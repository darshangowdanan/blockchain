"use client";

import { useState, useEffect } from "react";
import { QrCode, X, Copy } from "lucide-react";

type TicketItem = {
  _id: string;
  from: string;
  to: string;
  passengers: number;
  date: string;
  fare: number;
};

type TicketGroup = {
  _id: string;
  paymentId: string;
  tickets: TicketItem[];
};

export function DashboardSection() {
  const [bookings, setBookings] = useState<TicketGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketItem | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch("/api/my-ticket");
        const data = await res.json();

        if (Array.isArray(data)) {
          // 🔥 JUST REVERSE GROUPS + REVERSE TICKETS
          const reversed = data
            .map((group: TicketGroup) => ({
              ...group,
              tickets: [...group.tickets].reverse(),
            }))
            .reverse();

          setBookings(reversed);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setBookings([]);
      }

      setLoading(false);
    }

    fetchTickets();
  }, []);

  const handleShareTicket = (ticketId: string) => {
    const url = `${window.location.origin}/ticket/${ticketId}`;
    navigator.clipboard.writeText(url);
    alert("Ticket link copied to clipboard!");
  };

  return (
    <section id="dashboard" className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">
            My Bookings
          </span>
        </h2>
        <p className="text-lg text-slate-400">Manage your holographic tickets</p>
      </div>

      {loading && (
        <p className="text-center text-white/70 text-lg">Loading your tickets…</p>
      )}

      {!loading && bookings.length === 0 && (
        <p className="text-center text-white/70 text-lg">
          No bookings yet. Start your journey! 🚍
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-6">
          {bookings.map((group) => (
            <div
              key={group._id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur md:flex md:flex-col"
            >
              <h3 className="text-white font-semibold mb-4">
                Payment ID: {group.paymentId}
              </h3>

              {group.tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex justify-between items-center mb-2 rounded-lg bg-white/5 p-3"
                >
                  <div className="text-white">
                    {ticket.from} → {ticket.to} | {ticket.passengers} passenger(s)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(ticket)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
                    >
                      <QrCode className="h-4 w-4" />
                      View QR
                    </button>
                    <button
                      onClick={() => handleShareTicket(ticket._id)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white font-semibold">Ticket Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-xl bg-white/20 text-white">
              <span className="text-lg">QR CODE</span>
            </div>

            <div className="space-y-2 text-white/90">
              <p><strong>From:</strong> {selected.from}</p>
              <p><strong>To:</strong> {selected.to}</p>
              <p><strong>Passengers:</strong> {selected.passengers}</p>
              <p><strong>Date:</strong> {selected.date}</p>
              <p><strong>Fare:</strong> ₹{selected.fare}</p>
              <p><strong>Ticket ID:</strong> {selected._id}</p>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-2 font-medium text-white hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
