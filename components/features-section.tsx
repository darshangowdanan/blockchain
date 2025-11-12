"use client"

import { ShieldCheck, Clock, CreditCard, Bus } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Blockchain Secured",
    description:
      "Each ticket is verified on blockchain — ensuring authenticity, transparency, and zero fraud.",
  },
  {
    icon: Clock,
    title: "Instant Booking",
    description:
      "Book your bus tickets in seconds with real-time confirmation and live seat availability.",
  },
  {
    icon: CreditCard,
    title: "Multiple Payments",
    description:
      "Pay seamlessly using UPI, cards, or crypto — your choice, your convenience.",
  },
  {
    icon: Bus,
    title: "Smart Travel Experience",
    description:
      "Manage bookings, and enjoy a futuristic ticketing experience.",
  },
]
export function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto w-3/4 pt-12">
      {/* Section Header */}
      <div className="mb-20 text-center">
        <h2 className="mb-5 text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">
            Why Choose HoloTicket?
          </span>
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Experience next-gen, secure, and transparent travel ticketing powered by blockchain.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:border-cyan-400/50 hover:bg-white/10"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 group-hover:text-fuchsia-300">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-white">{feature.title}</h3>
              <p className="text-base text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
