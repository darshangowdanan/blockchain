import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongodb";
import { JourneyTicket } from "@/models/JourneyTicket";
import { TicketGroup } from "@/models/TicketGroup";
import mongoose from "mongoose";
// IMPORT ETHERS
import { ethers } from "ethers";
// Ensure this path matches where your artifacts folder is located
import AdvancedTransitABI from "@/artifacts/contracts/AdvancedTransit.sol/AdvancedTransit.json";

// SERVER CONFIG (Read from .env)
const PRIVATE_KEY = process.env.PRIVATE_KEY; 
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // <--- CHANGED: Read from env
const RPC_URL = process.env.RPC_URL; // <--- CHANGED: Read from env

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

    // 2. Connect DB & Setup Blockchain
    await connectDB();
    
    // Safety check for env variables
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !RPC_URL) {
      console.error("Missing Blockchain Config in .env");
      return NextResponse.json({ success: false, message: "Server Config Error" });
    }

    // Setup Provider & Wallet (The Admin)
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, AdvancedTransitABI.abi, wallet);

    const userEmail = session.user.email;

    // 3. Create TicketGroup (MongoDB)
    const ticketGroup = await TicketGroup.create({
      userId: userEmail,
      userEmail: userEmail,
      paymentId,
      tickets: [],
    });

    // 4. Loop through journeys -> Mint on Blockchain -> Save to DB
    const journeyTickets = await Promise.all(
      journeys.map(async (j: any) => {
        try {
            // A. WRITE TO BLOCKCHAIN (Admin issues ticket)
            // Note: issueTicket(userId, path)
            const tx = await contract.issueTicket(userEmail, j.path || []);
            
            // Wait for confirmation (mining)
            const receipt = await tx.wait(); 
            const txHash = receipt.hash; // This is your proof!

            // B. SAVE TO MONGODB
            const ticket = await JourneyTicket.create({
                from: j.from,
                to: j.to,
                passengers: j.passengers,
                path: j.path || [],
                blockchainTxHash: txHash, // <--- SAVED HERE
                groupId: ticketGroup._id,
                qrCode: `GROUP:${ticketGroup._id}_TICKET:${new mongoose.Types.ObjectId()}`,
            });
            return ticket._id;
        } catch (chainError) {
            console.error("Blockchain Minting Failed:", chainError);
            // Optional: You might want to throw error to fail the whole booking, 
            // or just log it and mark ticket as "Pending Sync"
            throw chainError; 
        }
      })
    );

    // 5. Update TicketGroup and Return
    ticketGroup.tickets = journeyTickets;
    await ticketGroup.save();

    return NextResponse.json({ success: true, groupId: ticketGroup._id });

  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ success: false, message: "Payment processing failed" });
  }
}