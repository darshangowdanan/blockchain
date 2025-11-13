"use client";

import Image from "next/image";
import { Users, MapPin } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";

export default function BookingSection() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [passengers, setPassengers] = useState<
    { id: number; from: string; to: string; count: number; price: number }[]
  >([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const messages = [
    "Secure. Smart. Seamless Ticketing.",
    "Your Journey, Simplified.",
    "Travel Made Transparent.",
  ];

  // Typing animation for tagline
  useEffect(() => {
    let i = 0,
      j = 0,
      current = "",
      typing = true;

    const type = () => {
      if (typing) {
        if (j < messages[i].length) {
          current += messages[i][j];
          setMessage(current);
          j++;
        } else {
          typing = false;
          setTimeout(type, 1200);
          return;
        }
      } else {
        if (j > 0) {
          current = current.slice(0, -1);
          setMessage(current);
          j--;
        } else {
          typing = true;
          i = (i + 1) % messages.length;
        }
      }
      setTimeout(type, typing ? 60 : 40);
    };
    type();
  }, []);

  // Fetch stop suggestions
  const fetchSuggestions = async (type: "from" | "to", query: string) => {
    try {
      const res = await fetch(`/api/stops?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (type === "from") setFromSuggestions(data);
      else setToSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
  };

  // Calculate fare based on number of stops
  const calculateFare = (fromStop: string, toStop: string): number => {
    // Fake stop distance for now, later you can compute actual distance
    const allStops = [
      "Kempegowda Bus Station (Majestic)",
      "Corporation Circle",
      "MG Road Metro",
      "Trinity Circle",
      "Indiranagar",
      "Tin Factory",
      "KR Puram",
      "Marathahalli",
      "Graphite India",
      "Hope Farm Junction",
      "Whitefield TTMC",
    ];

    const fromIndex = allStops.indexOf(fromStop);
    const toIndex = allStops.indexOf(toStop);

    if (fromIndex === -1 || toIndex === -1) return 5;

    const stopCount = Math.abs(toIndex - fromIndex);
    const fareUnits = Math.ceil(stopCount / 2); // every 2 stops → ₹5
    return fareUnits * 5 || 5;
  };

  const handleConfirm = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!from || !to) {
      alert("Please enter both From and To locations.");
      return;
    }

    const baseFare = calculateFare(from, to);
    const total = baseFare * selectedTickets;

    const newBooking = {
      id: Date.now(),
      from,
      to,
      count: selectedTickets,
      price: total,
    };

    setPassengers([...passengers, newBooking]);
    setTotalPrice((prev) => prev + total);
    setFrom("");
    setTo("");
    setSelectedTickets(1);
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  const handleReset = () => {
    setPassengers([]);
    setTotalPrice(0);
  };

  const renderSuggestions = (
    suggestions: string[],
    onSelect: (value: string) => void
  ) => (
    <ul className="absolute z-20 bg-slate-900/95 border border-white/10 mt-2 rounded-xl max-h-56 overflow-y-auto w-full shadow-2xl backdrop-blur-lg scrollbar-thin scrollbar-thumb-white/10">
      {suggestions.map((stop, i) => (
        <li
          key={i}
          onClick={() => onSelect(stop)}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer text-slate-200 hover:bg-gradient-to-r hover:from-cyan-600/30 hover:to-fuchsia-600/30 transition"
        >
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{stop}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="relative w-full min-h-[75vh] flex flex-col md:flex-row items-center justify-center overflow-hidden from-slate-950 via-slate-900 to-black px-6 md:px-16">
      {/* Left Section */}
      <div className="flex flex-col items-center justify-center z-0 w-full md:w-1/2 text-white space-y-8">
        <div className="flex flex-col w-3/4 items-start gap-2">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
            Book Your Journey
          </h1>
          <p className="text-xl text-slate-400 mt-2 h-8">{message}</p>
        </div>

        {/* Booking Form */}
        <form
          onSubmit={handleConfirm}
          className="w-full max-w-3xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-wrap md:flex-nowrap items-end justify-between gap-4 shadow-lg"
        >
          {/* FROM Input */}
          <div className="flex flex-col w-full md:w-1/4 relative">
            <label className="text-slate-300 text-sm mb-1 ml-1">From</label>
            <input
              type="text"
              placeholder="Enter departure"
              value={from}
              onChange={(e) => {
                const val = e.target.value;
                setFrom(val);
                if (typingTimeout) clearTimeout(typingTimeout);
                setTypingTimeout(
                  setTimeout(() => {
                    if (val.length > 1) fetchSuggestions("from", val);
                  }, 300)
                );
              }}
              className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg placeholder:text-slate-400 transition"
            />
            {fromSuggestions.length > 0 &&
              renderSuggestions(fromSuggestions, (val) => {
                setFrom(val);
                setFromSuggestions([]);
              })}
          </div>

          {/* TO Input */}
          <div className="flex flex-col w-full md:w-1/4 relative">
            <label className="text-slate-300 text-sm mb-1 ml-1">To</label>
            <input
              type="text"
              placeholder="Enter destination"
              value={to}
              onChange={(e) => {
                const val = e.target.value;
                setTo(val);
                if (typingTimeout) clearTimeout(typingTimeout);
                setTypingTimeout(
                  setTimeout(() => {
                    if (val.length > 1) fetchSuggestions("to", val);
                  }, 300)
                );
              }}
              className="px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-lg placeholder:text-slate-400 transition"
            />
            {toSuggestions.length > 0 &&
              renderSuggestions(toSuggestions, (val) => {
                setTo(val);
                setToSuggestions([]);
              })}
          </div>

          {/* PASSENGERS */}
          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-slate-300 text-sm mb-1 ml-1">
              Passengers
            </label>
            <div className="flex items-center justify-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Users className="h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() =>
                  setSelectedTickets(Math.max(1, selectedTickets - 1))
                }
                className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
              >
                −
              </button>
              <span className="w-8 text-center">{selectedTickets}</span>
              <button
                type="button"
                onClick={() => setSelectedTickets(selectedTickets + 1)}
                className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
              >
                +
              </button>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <button
              type="submit"
              className="w-full md:w-auto rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-3 text-lg font-semibold text-white hover:opacity-90 active:scale-95 transition"
            >
              Confirm
            </button>
          </div>
        </form>

        {/* Booking Summary */}
        {passengers.length > 0 && (
          <div className="w-full max-w-3xl mt-6 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-cyan-300">
              Booking Summary
            </h2>

            <ul className="space-y-2 text-slate-300 max-h-40 overflow-y-auto pr-2">
              {passengers.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between bg-white/10 rounded-lg p-3"
                >
                  <span>
                    {p.from} ➜ {p.to} ({p.count} Passenger
                    {p.count > 1 ? "s" : ""})
                  </span>
                  <span className="text-fuchsia-400 font-medium">
                    ₹{p.price}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-lg font-medium text-white">Total Fare:</span>
              <span className="text-2xl font-bold text-cyan-400">
                ₹{totalPrice}
              </span>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition"
              >
                Reset
              </button>
              <button
                onClick={() => alert("Proceeding to Payment...")}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-semibold hover:opacity-90 transition"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center md:w-1/2">
        <Image
          src="/image.png"
          alt="Bus"
          width={850}
          height={600}
          className="object-contain rounded-2xl"
          priority
        />
      </div>
    </section>
  );
}
