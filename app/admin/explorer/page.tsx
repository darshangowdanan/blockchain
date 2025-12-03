"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Database, RefreshCw, Shield, MapPin, Clock } from "lucide-react";
import AdvancedTransitABI from "@/artifacts/contracts/AdvancedTransit.sol/AdvancedTransit.json";

// Types matching the Smart Contract Struct
type BlockchainTicket = {
  id: string;
  userId: string;
  activationTime: string;
  isActive: boolean;
  allowedPath: string[];
  scannedStops: string[];
};

export default function BlockchainExplorer() {
  const [tickets, setTickets] = useState<BlockchainTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockNumber, setBlockNumber] = useState(0);

  // 1. Fetch Data from Blockchain
  const fetchBlockchainData = async () => {
    setLoading(true);
    try {
      // Connect to Localhost Blockchain directly (Read-Only)
      // We don't need a Wallet/Signer to READ data, just a Provider.
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      
      // Get current block number (to show it's live)
      const block = await provider.getBlockNumber();
      setBlockNumber(block);

      // Connect to Contract
      // NOTE: Ensure this address matches your .env or the deploy log!
      const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
      const contract = new ethers.Contract(contractAddress, AdvancedTransitABI.abi, provider);

      // A. Get Total Tickets Count
      // 'nextTicketId' is a public variable in solidity, so we get a getter function for free
      const totalTickets = await contract.nextTicketId();
      const count = Number(totalTickets);

      console.log(`Found ${count} tickets on blockchain`);

      // B. Loop and Fetch Each Ticket
      const fetchedTickets: BlockchainTicket[] = [];
      
      for (let i = 0; i < count; i++) {
        // Call the mapping: tickets(id)
        // Returns array: [id, userId, activationTime, isActive, ...]
        // Note: Struct arrays (path/scannedStops) might not be returned by the default mapping getter 
        // depending on solidity version, but let's try the mapping first. 
        // If mappings don't return dynamic arrays, we use our helper 'getTicketDetails'
        
        const rawTicket = await contract.getTicketDetails(i);
        
        fetchedTickets.push({
          id: rawTicket.ticketId.toString(),
          userId: rawTicket.userId,
          // Convert BigInt timestamp to Date
          activationTime: Number(rawTicket.activationTime) > 0 
            ? new Date(Number(rawTicket.activationTime) * 1000).toLocaleString() 
            : "Not Activated",
          isActive: rawTicket.isActive,
          // Handle proxy objects/arrays from Ethers
          allowedPath: Array.from(rawTicket.allowedPath), 
          scannedStops: Array.from(rawTicket.scannedStops)
        });
      }

      // Sort newest first
      setTickets(fetchedTickets.reverse());

    } catch (error) {
      console.error("Blockchain Read Error:", error);
      alert("Failed to connect to Local Blockchain. Is 'npx hardhat node' running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 flex items-center gap-3">
              <Database /> Blockchain Explorer
            </h1>
            <p className="text-slate-400 mt-2">
              Direct Live View of Smart Contract Storage (Localhost:1337)
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Current Block Height</div>
            <div className="text-2xl font-mono font-bold text-green-400">#{blockNumber}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-end">
          <button 
            onClick={fetchBlockchainData}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 px-4 py-2 rounded-lg transition"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium border-b border-white/10">Ticket ID</th>
                  <th className="p-4 font-medium border-b border-white/10">User Email (Owner)</th>
                  <th className="p-4 font-medium border-b border-white/10">Status</th>
                  <th className="p-4 font-medium border-b border-white/10">Route Path</th>
                  <th className="p-4 font-medium border-b border-white/10">Scanned History</th>
                  <th className="p-4 font-medium border-b border-white/10">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition font-mono text-sm">
                    <td className="p-4 text-green-400 font-bold">#{t.id}</td>
                    <td className="p-4 text-slate-300">{t.userId}</td>
                    <td className="p-4">
                      {t.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs border border-yellow-500/30">
                          <Clock size={12} /> Active / In-Use
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">
                          <Shield size={12} /> Issued / Unused
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex flex-wrap gap-1">
                        {t.allowedPath.map((stop, i) => (
                          <span key={i} className="bg-black/40 px-2 py-1 rounded border border-white/10">
                            {stop}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {t.scannedStops.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {t.scannedStops.map((stop, i) => (
                            <span key={i} className="bg-green-900/40 text-green-300 px-2 py-1 rounded border border-green-500/30 flex items-center gap-1">
                              <MapPin size={10} /> {stop}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">No scans yet</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                        {t.activationTime}
                    </td>
                  </tr>
                ))}

                {tickets.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No tickets found on the blockchain ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}