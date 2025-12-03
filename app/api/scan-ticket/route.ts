import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { connectDB } from "@/lib/mongodb";
import { JourneyTicket } from "@/models/JourneyTicket";

// SERVER CONFIG
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;

// ✅ Hardcoded ABI for Validation
const CONTRACT_ABI = [
  "function scanTicket(uint256 _ticketId, string memory _currentStop) public"
];

export async function POST(req: Request) {
  try {
    const { ticketId, currentStop } = await req.json();

    if (!ticketId || !currentStop) {
      return NextResponse.json({ success: false, message: "Missing ticket details" });
    }

    // 1. Setup Blockchain Connection
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !RPC_URL) {
      return NextResponse.json({ success: false, message: "Server Config Error" });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    console.log(`Conductor Scanning Ticket #${ticketId} at ${currentStop}...`);

    // 2. Call Smart Contract: scanTicket(ticketId, currentStop)
    // The Admin Wallet pays the gas for this validation logic
    try {
        const tx = await contract.scanTicket(ticketId, currentStop);
        await tx.wait(); // Wait for confirmation
    } catch (contractError: any) {
        console.error("Smart Contract Reverted:", contractError);
        
        // Extract the error reason if possible (e.g. "Ticket Expired")
        const reason = contractError.reason || contractError.shortMessage || "Validation Failed on Blockchain";
        return NextResponse.json({ success: false, message: reason });
    }

    // 3. Optional: Log scan in MongoDB for analytics
    await connectDB();
    await JourneyTicket.findOneAndUpdate(
        { blockchainTicketId: ticketId.toString() },
        { $set: { updatedAt: new Date() } } 
    );

    return NextResponse.json({ 
      success: true, 
      message: "Ticket Validated Successfully ✅"
    });

  } catch (error: any) {
    console.error("Scan API Error:", error);
    return NextResponse.json({ success: false, message: "Network or Server Error" });
  }
}