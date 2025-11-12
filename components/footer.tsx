"use client"

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative w-full border-t border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-black py-12 text-center text-slate-400">
      <div className="mx-auto px-6">
        {/* Top section with logo + text */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            Slice Ticketing
          </h2>

          <div className="flex gap-6">
            <a href="#" className="hover:text-cyan-400 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* Links */}
        <div className="flex flex-col items-center justify-center gap-4 text-sm md:flex-row md:gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>

        {/* Bottom copyright */}
        <p className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} Slice Ticketing. Built with Blockchain Security.
        </p>
      </div>
    </footer>
  )
}
