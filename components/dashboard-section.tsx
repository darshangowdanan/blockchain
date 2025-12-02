"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { QrCode, X, Copy, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";

type TicketItem = {
  _id: string;
  from: string;
  to: string;
  passengers: number;
  createdAt: string; 
  qrCode: string;    
  blockchainTicketId?: string; 
  blockchainTxHash?: string;   
  path?: string[];
};

type TicketGroup = {
  _id: string;
  paymentId: string;
  tickets: TicketItem[];
};

export function DashboardSection() {
  const { data: session, status } = useSession(); 
  const [bookings, setBookings] = useState<TicketGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketItem | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
        if (status === "unauthenticated") setLoading(false);
        return;
    }

    async function fetchTickets() {
      try {
        const res = await fetch("/api/my-ticket"); 
        const data = await res.json();

        // ✅ FIX: Handle the Direct Array response you are getting
        if (Array.isArray(data)) {
            setBookings(data);
        } 
        // Handle { success: true, tickets: [...] } format just in case
        else if (data.success && Array.isArray(data.tickets)) {
             setBookings([{ _id: "recent", paymentId: "Recent", tickets: data.tickets }]);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [status]);

  const handleShareTicket = (ticketId: string) => {
    const url = `${window.location.origin}/ticket/${ticketId}`;
    navigator.clipboard.writeText(url);
    alert("Ticket link copied to clipboard!");
  };

  const openPolygonScan = (txHash?: string) => {
    if(!txHash) return;
    window.open(`https://amoy.polygonscan.com/tx/${txHash}`, "_blank");
  };

  return (
    <section id="dashboard" className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">
            My Bookings
          </span>
        </h2>
      </div>

      {/* Loading */}
      {(status === "loading" || loading) && (
        <div className="flex justify-center items-center gap-2 text-white/70 text-lg">
            <Loader2 className="animate-spin" /> Loading tickets...
        </div>
      )}

      {/* No Bookings */}
      {status === "authenticated" && !loading && bookings.length === 0 && (
        <div className="text-center">
            <p className="text-white/70 text-lg mb-4">No bookings found.</p>
        </div>
      )}

      {/* Tickets List */}
      {status === "authenticated" && bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map((group) => (
            <div
              key={group._id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur md:flex md:flex-col"
            >
              <h3 className="text-white font-semibold mb-4 opacity-50 text-sm uppercase tracking-wider border-b border-white/10 pb-2">
                Order: {group.paymentId}
              </h3>

              {group.tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex flex-col md:flex-row justify-between items-center mb-3 rounded-xl bg-white/5 border border-white/5 p-4 hover:border-white/20 transition"
                >
                  <div className="text-white mb-3 md:mb-0 w-full md:w-auto">
                    <div className="text-lg font-semibold flex items-center gap-2">
                        {ticket.from} <span className="text-slate-500">→</span> {ticket.to}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mt-2">
                        <span className="bg-white/10 px-2 py-0.5 rounded">{ticket.passengers} Passenger(s)</span>
                        
                        {/* Status Badge */}
                        {ticket.blockchainTicketId ? (
                            <span className="flex items-center gap-1 text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded border border-cyan-500/30">
                                <ShieldCheck size={12} />
                                #{ticket.blockchainTicketId}
                            </span>
                        ) : (
                            <span className="text-yellow-500 text-xs border border-yellow-500/30 px-2 py-0.5 rounded">
                                Syncing / Old Ticket
                            </span>
                        )}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button
                      onClick={() => setSelected(ticket)}
                      className="flex-1 md:flex-none justify-center inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/50 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20 transition"
                    >
                      <QrCode className="h-4 w-4" />
                      Show QR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 p-6 border border-white/10 shadow-2xl relative">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                  <h3 className="text-xl text-white font-bold">Ticket #{selected.blockchainTicketId || "---"}</h3>
                  <p className="text-slate-400 text-sm">Scan to board</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white bg-white/5 rounded-full p-1">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mx-auto mb-6 flex items-center justify-center bg-white p-4 rounded-2xl w-fit">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selected.qrCode)}`}
                alt="Ticket QR"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-xl text-sm mb-4 border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400">Route</span>
                <span className="text-white font-medium">{selected.from} ➝ {selected.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hash</span>
                <span className="text-white font-mono text-xs truncate w-32">{selected.blockchainTxHash || "---"}</span>
              </div>
            </div>

            {selected.blockchainTxHash && (
                <button
                    onClick={() => openPolygonScan(selected.blockchainTxHash)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm text-slate-300 hover:bg-slate-700 transition"
                >
                    <ExternalLink size={14} />
                    View Proof
                </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}