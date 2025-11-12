"use client"

import { Ticket, Download, QrCode } from "lucide-react"

const bookings = [
  {
    id: "1",
    event: "Tech Summit 2025",
    date: "March 15, 2025",
    tickets: 2,
    status: "Confirmed",
    qr: "████ ████ ████",
  },
  {
    id: "2",
    event: "Music Festival",
    date: "April 20, 2025",
    tickets: 1,
    status: "Confirmed",
    qr: "████ ████ ████",
  },
]

export function DashboardSection() {
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

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur md:flex md:items-center md:justify-between"
          >
            <div className="mb-4 flex items-start gap-4 md:mb-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 text-cyan-300">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{booking.event}</h3>
                <p className="text-sm text-slate-400">{booking.date}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                  <span>{booking.tickets} ticket(s)</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-300">
                    ✓ {booking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm transition-colors hover:bg-white/10">
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
    </section>
  )
}
