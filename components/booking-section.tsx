"use client";

import Image from "next/image";
import { Users, MapPin, Route } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";

type Stop = {
  _id: string;
  stop_id: number;
  stop_name: string;
  lat: number;
  lng: number;
};

type Journey = {
  from: string;
  to: string;
  passengers: number;
};

export default function BookingSection() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromId, setFromId] = useState<number | null>(null);
  const [toId, setToId] = useState<number | null>(null);
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [fromSuggestions, setFromSuggestions] = useState<Stop[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Stop[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);

  const messages = [
    "Secure. Smart. Seamless Ticketing.",
    "Your Journey, Simplified.",
    "Travel Made Transparent.",
  ];

  // Typing animation
  useEffect(() => {
    let i = 0, j = 0, current = "", typing = true;

    const type = () => {
      if (typing) {
        if (j < messages[i].length) {
          current += messages[i][j];
          j++;
          setMessage(current);
        } else {
          typing = false;
          setTimeout(type, 1200);
          return;
        }
      } else {
        if (j > 0) {
          current = current.slice(0, -1);
          j--;
          setMessage(current);
        } else {
          typing = true;
          i = (i + 1) % messages.length;
        }
      }
      setTimeout(type, typing ? 60 : 40);
    };

    const setMessage = (msg: string) => {
      const element = document.getElementById("typingMessage");
      if (element) {
        element.textContent = msg;
      }
    };

    type();
  }, []);

  const fetchSuggestions = async (type: "from" | "to", query: string) => {
    try {
      const res = await fetch(`/api/stops?search=${encodeURIComponent(query)}`);
      const data = await res.json(); 
      if (type === "from") setFromSuggestions(data);
      else setToSuggestions(data);
    } catch (err) {
      console.error("Suggestion Error:", err);
    }
  };

  const handleConfirm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fromId || !toId) {
      alert("Please select valid stops.");
      return;
    }
    // Add journey to the list
    setJourneys([...journeys, { from, to, passengers: selectedTickets }]);
    // Reset inputs
    setFrom("");
    setTo("");
    setFromId(null);
    setToId(null);
    setSelectedTickets(1);
  };

  const renderSuggestions = (suggestions: Stop[], onSelect: (s: Stop) => void) => (
    <ul className="absolute top-full left-0 mt-1 z-20 bg-slate-900/95 border border-white/10 rounded-xl max-h-56 overflow-y-auto w-full shadow-xl backdrop-blur-lg">
      {suggestions.map((s, i) => (
        <li
          key={i}
          onClick={() => onSelect(s)}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer text-slate-200 hover:bg-white/10 transition"
        >
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{s.stop_name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="relative w-full min-h-[75vh] flex flex-col md:flex-row items-center justify-center overflow-hidden px-6 md:px-16 bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* LEFT */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 text-white space-y-8">
        {/* Heading */}
        <div className="flex flex-col w-3/4 items-start gap-2">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
            Book Your Journey
          </h1>
          <p id="typingMessage" className="text-xl text-slate-400 mt-2 h-8"></p>
        </div>

        {/* BOOKING FORM */}
        <form
          onSubmit={handleConfirm}
          className="w-full max-w-3xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-wrap md:flex-nowrap items-end justify-between gap-4 shadow-lg"
        >
          {/* FROM */}
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
              className="px-4 py-3 rounded-lg bg-white/10 text-white text-lg focus:ring-2 focus:ring-cyan-500"
            />
            {fromSuggestions.length > 0 &&
              renderSuggestions(fromSuggestions, (stop) => {
                setFrom(stop.stop_name);
                setFromId(stop.stop_id);
                setFromSuggestions([]);
              })}
          </div>

          {/* TO */}
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
              className="px-4 py-3 rounded-lg bg-white/10 text-white text-lg focus:ring-2 focus:ring-fuchsia-500"
            />
            {toSuggestions.length > 0 &&
              renderSuggestions(toSuggestions, (stop) => {
                setTo(stop.stop_name);
                setToId(stop.stop_id);
                setToSuggestions([]);
              })}
          </div>

          {/* PASSENGERS */}
          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-slate-300 text-sm mb-1 ml-1">Passengers</label>
            <div className="flex items-center justify-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Users className="h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setSelectedTickets(Math.max(1, selectedTickets - 1))}
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

          {/* SUBMIT */}
          <div className="w-full md:w-auto">
            <button
              type="submit"
              className="w-full md:w-auto rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-3 text-lg font-semibold text-white hover:opacity-90"
            >
              Confirm
            </button>
          </div>
        </form>

        {/* CONFIRMED JOURNEYS */}
        {journeys.length > 0 && (
          <div className="w-full max-w-3xl mt-6 space-y-4">
            {journeys.map((j, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-2 text-slate-200"
              >
                <h2 className="text-2xl font-semibold text-cyan-300 flex gap-2 items-center">
                  <Route className="w-6 h-6" /> Journey {idx + 1}
                </h2>
                <p>
                  <span className="font-semibold text-white">From:</span> {j.from}
                </p>
                <p>
                  <span className="font-semibold text-white">To:</span> {j.to}
                </p>
                <p>
                  <span className="font-semibold text-white">Passengers:</span> {j.passengers}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
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
