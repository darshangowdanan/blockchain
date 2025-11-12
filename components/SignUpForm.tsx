"use client";

import { useState } from "react";
import SignInForm from "./SignIn";

type SignUpFormProps = {
  onClose: () => void;
};

export default function SignUpForm({ onClose }: SignUpFormProps) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (showSignIn) return <SignInForm onClose={onClose} />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email,
          password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        // 👇 Handle existing email
        if (res.status === 409) {
          setError("Email already registered. Please sign in.");
        } else {
          throw new Error(data.error || "Failed to register");
        }
        return;
      }

      // ✅ Ask browser to remember password
      const form = e.target as HTMLFormElement;
      const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]');
      const passwordInput = form.querySelector<HTMLInputElement>('input[type="password"]');
      if (emailInput && passwordInput) {
        emailInput.autocomplete = "username";
        passwordInput.autocomplete = "new-password";
      }

      alert("Account created successfully 🎉 Please sign in now.");

      // 👇 After successful sign-up, redirect to Sign In
      setShowSignIn(true);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 w-[400px] text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold transition"
        >
          ×
        </button>

        <h2 className="text-3xl font-semibold text-white mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="on">
          <input
            type="text"
            placeholder="Full Name"
            className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none text-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none text-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none text-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-3 text-lg font-medium text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <button
          onClick={() => alert("Google Sign-Up Coming Soon!")}
          className="mt-4 w-full rounded-lg border border-white/20 py-3 text-lg text-white hover:bg-white/10 transition"
        >
          Continue with Google
        </button>

        <p className="text-slate-400 text-base mt-4">
          Already have an account?{" "}
          <button
            onClick={() => setShowSignIn(true)}
            className="text-cyan-400 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
