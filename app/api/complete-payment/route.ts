import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import { JourneyTicket } from "@/models/JourneyTicket";
import { TicketGroup } from "@/models/TicketGroup";
import mongoose from "mongoose";
import { ethers } from "ethers";
import AdvancedTransitABI from "@/artifacts/contracts/AdvancedTransit.sol/AdvancedTransit.json";

// SERVER CONFIG
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 
const RPC_URL = process.env.RPC_URL; 

const CONTRACT_ABI = [
  "function issueTicket(string memory _userId, string[] memory _path) public",
  "event TicketIssued(uint256 ticketId, string userId)"
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
    }

    const { journeys, paymentId } = await req.json(); 
    
    if (!journeys || journeys.length === 0) {
      return NextResponse.json({ success: false, message: "No journeys found" });
    }

    await connectDB();
    
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !RPC_URL) {
      return NextResponse.json({ success: false, message: "Server Blockchain Config Missing" });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    const userEmail = session.user.email;

    const ticketGroup = await TicketGroup.create({
      userId: userEmail,
      userEmail: userEmail,
      paymentId,
      tickets: [],
    });

    const journeyTickets = [];

    // ✅ FIX: Get the starting Nonce (Transaction Count) ONCE
    let currentNonce = await provider.getTransactionCount(wallet.address);

    // ---------------------------------------------------------
    // ✅ OPTIMIZED: GROUP TICKETING LOGIC
    // ---------------------------------------------------------
    // We now iterate ONLY through the routes. 
    // If a route has 3 passengers, we create ONE blockchain ticket for the group.
    
    for (const j of journeys) {
        try {
            const passengerCount = Number(j.passengers) || 1;
            
            console.log(`Minting GROUP ticket for ${passengerCount} passengers: ${j.from} -> ${j.to} [Nonce: ${currentNonce}]`);
            
            // A. WRITE TO BLOCKCHAIN (One TX per Group)
            // We issue a single ticket ID that represents the entire group.
            const tx = await contract.issueTicket(userEmail, j.path || [], {
                nonce: currentNonce 
            });
            
            currentNonce++; // Increment for next journey group

            const receipt = await tx.wait(); 
            
            // B. EXTRACT ID
            let blockchainId = "PENDING";
            try {
                for (const log of receipt.logs) {
                    const parsed = contract.interface.parseLog(log);
                    if (parsed && parsed.name === "TicketIssued") {
                        blockchainId = parsed.args[0].toString();
                        break;
                    }
                }
            } catch (e) {
                console.error("Log parsing warning:", e);
            }

            // C. SAVE TO MONGODB (One Record for the Group)
            // We store 'passengers: passengerCount' so the conductor knows how many people this ID covers.
            const ticket = await JourneyTicket.create({
                from: j.from,
                to: j.to,
                passengers: passengerCount, // ✅ Stores "3" in one record
                path: j.path || [],
                blockchainTxHash: receipt.hash, 
                blockchainTicketId: blockchainId,
                groupId: ticketGroup._id,
                qrCode: `TICKET_ID:${blockchainId}`,
            });
            
            journeyTickets.push(ticket._id);

        } catch (chainError: any) {
            console.error("Minting Failed for a journey:", chainError);
        }
    }

    ticketGroup.tickets = journeyTickets;
    await ticketGroup.save();

    return NextResponse.json({ success: true, groupId: ticketGroup._id });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Payment processing failed" });
  }
}