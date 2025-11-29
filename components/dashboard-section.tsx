"use client";

import { useState, useEffect } from "react";
import { Ticket, Download, QrCode, X } from "lucide-react";

export function DashboardSection() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    // Fetch tickets from your API
    async function fetchTickets() {
      try {
        const res = await fetch("/api/my-ticket");
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    }

    fetchTickets();
  }, []);

  return (
    <section id="dashboard" className="relative mx-auto max-w-7xl px-6 py-20">
      {/* Header */}
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">
            My Bookings
          </span>
        </h2>
        <p className="text-lg text-slate-400">Manage your holographic tickets</p>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {bookings.map((booking: any) => (
          <div
            key={booking._id}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur md:flex md:items-center md:justify-between"
          >
            <div className="mb-4 flex items-start gap-4 md:mb-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 text-cyan-300">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {booking.from} → {booking.to}
                </h3>
                <p className="text-sm text-slate-400">{booking.date}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                  <span>{booking.passengers} passenger(s)</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-300">
                    ✓ Confirmed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelected(booking)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm transition-colors hover:bg-white/10"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">View QR</span>
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
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

            {/* QR Placeholder (replace with real QR) */}
            <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-xl bg-white/20 text-white">
              <span className="text-lg">QR CODE</span>
            </div>

            {/* Ticket Info */}
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
