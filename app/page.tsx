"use client"
import ClientOnly from "@/components/ClientOnly"
import { Header } from "@/components/header"
import { FeaturesSection } from "@/components/features-section"
import  BookingSection  from "@/components/booking-section"
import { DashboardSection } from "@/components/dashboard-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="pt-10 min-h-screen bg-slate-950 text-slate-100">
      {/* Animated background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(50%_40%_at_50%_-10%,rgba(99,102,241,0.2),transparent),radial-gradient(40%_30%_at_10%_20%,rgba(34,211,238,0.12),transparent)]" />

      {/* Content */}
      <div className="relative z-10">
        <ClientOnly><Header /></ClientOnly>        
        <ClientOnly><BookingSection /></ClientOnly>
        <DashboardSection />
        <FeaturesSection />
        <Footer />
      </div>
    </main>
  )
}
