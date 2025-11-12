"use client"

import { useState } from "react"
import SignUpForm from "./SignUpForm"

type SignInFormProps = {
  onClose: () => void
}

export default function SignInForm({ onClose }: SignInFormProps) {
  const [showSignUp, setShowSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  if (showSignUp) return <SignUpForm onClose={onClose} />

interface FormSubmitEvent extends React.FormEvent<HTMLFormElement> {}

const handleSubmit = (e: FormSubmitEvent): void => {
    e.preventDefault()
    if (!email || !password) {
        setError("All fields are required.")
        return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.")
        return
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.")
        return
    }
    setError("")
    alert("Sign in successful ✅")
}

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 w-[400px] text-center shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold transition"
        >
          ×
        </button>

        <h2 className="text-3xl font-semibold text-white mb-6">Sign In</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none text-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-3 text-lg font-medium text-white hover:opacity-90 transition"
          >
            Sign In
          </button>
        </form>

        <button
          onClick={() => alert("Google Sign-In Coming Soon!")}
          className="mt-4 w-full rounded-lg border border-white/20 py-3 text-lg text-white hover:bg-white/10 transition"
        >
          Continue with Google
        </button>

        <p className="text-slate-400 text-base mt-4">
          Don’t have an account?{" "}
          <button
            onClick={() => setShowSignUp(true)}
            className="text-cyan-400 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
