"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import SignInForm from "./SignIn"

export function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getUserInitial = () => {
    if (!session?.user?.email) return ""
    return session.user.email[0].toUpperCase()
  }

  return (
    <header className="relative z-10 mx-auto flex items-center justify-center">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur w-[95%]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">HoloTicket</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-xl text-slate-300 md:flex">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#booking" className="transition-colors hover:text-white">Book</a>
          <a href="#dashboard" className="transition-colors hover:text-white">My Bookings</a>
        </nav>

        {/* Desktop Auth / Avatar */}
        <div className="hidden md:flex items-center gap-4 relative">
          {session?.user ? (
            <div ref={avatarRef} className="relative">
              <div
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-xl font-bold text-white"
              >
                {getUserInitial()}
              </div>

              {isAvatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-lg bg-slate-800 border border-white/10 shadow-lg text-white z-50">
                  <button
                    onClick={() => signOut()}
                    className="w-full py-2 px-4 text-left hover:bg-slate-700 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xl text-white transition-colors hover:bg-white/10"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-6 right-6 top-20 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-4 backdrop-blur-sm md:hidden">
          <nav className="flex flex-col gap-4 text-lg text-slate-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#booking" className="hover:text-white">Book</a>
            <a href="#dashboard" className="hover:text-white">My Bookings</a>

            {session?.user ? (
              <div className="relative mt-4">
                <div
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-xl font-bold text-white"
                >
                  {getUserInitial()}
                </div>

                {isAvatarMenuOpen && (
                  <div className="absolute mt-2 w-32 rounded-lg bg-slate-800 border border-white/10 shadow-lg text-white z-50">
                    <button
                      onClick={() => signOut()}
                      className="w-full py-2 px-4 text-left hover:bg-slate-700 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-white font-medium hover:opacity-90"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Sign In Modal */}
      {isModalOpen && (
        <SignInForm onClose={() => setIsModalOpen(false)} />
      )}
    </header>
  )
}
