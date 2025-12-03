import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import { JourneyTicket } from "@/models/JourneyTicket";
import { TicketGroup } from "@/models/TicketGroup";
import mongoose from "mongoose";
import { ethers } from "ethers";

// ---------------------------------------------------------
// SERVER CONFIG
// ---------------------------------------------------------
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 
const RPC_URL = process.env.RPC_URL; 

// ✅ FIX 1: Hardcoded ABI (Safest way to avoid import errors)
const CONTRACT_ABI = [
  "function issueTicket(string memory _userId, string[] memory _path) public",
  "event TicketIssued(uint256 ticketId, string userId)"
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    // 1. Validation
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
    }

    const { journeys, paymentId } = await req.json(); 
    
    if (!journeys || journeys.length === 0) {
      return NextResponse.json({ success: false, message: "No journeys found" });
    }

    // 2. Connect DB
    await connectDB();
    
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !RPC_URL) {
      return NextResponse.json({ success: false, message: "Server Blockchain Config Missing" });
    }

    // Setup Provider & Wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    // Use the hardcoded ABI
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    const userEmail = session.user.email;

    // 3. Create TicketGroup
    const ticketGroup = await TicketGroup.create({
      userId: userEmail,
      userEmail: userEmail,
      paymentId,
      tickets: [],
    });

    const journeyTickets = [];

    // ✅ FIX 2: SEQUENTIAL LOOP (Fixes "Payment Processing Failed" for multiple tickets)
    // We process one ticket at a time so the blockchain doesn't get confused.
    for (const j of journeys) {
        try {
            console.log(`Minting ticket for route: ${j.from} -> ${j.to}`);
            
            // A. WRITE TO BLOCKCHAIN
            const tx = await contract.issueTicket(userEmail, j.path || []);
            const receipt = await tx.wait(); // Wait for mining
            
            // B. EXTRACT ID FROM LOGS
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

            // C. SAVE TO MONGODB
            const ticket = await JourneyTicket.create({
                from: j.from,
                to: j.to,
                passengers: j.passengers,
                path: j.path || [],
                blockchainTxHash: receipt.hash, 
                blockchainTicketId: blockchainId,
                groupId: ticketGroup._id,
                qrCode: `TICKET_ID:${blockchainId}`,
            });
            
            journeyTickets.push(ticket._id);

        } catch (chainError: any) {
            console.error("Minting Failed for one ticket:", chainError);
            // We continue the loop so 1 failure doesn't kill the whole group if possible
        }
    }

    // 5. Update TicketGroup
    ticketGroup.tickets = journeyTickets;
    await ticketGroup.save();

    return NextResponse.json({ success: true, groupId: ticketGroup._id });

  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Payment processing failed" });
  }
}