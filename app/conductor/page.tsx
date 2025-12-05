"use client";

import { useState, useEffect } from "react";
import { ScanLine, CheckCircle, XCircle, MapPin, Loader2, Camera, X, Users } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

type Stop = { stop_id: number; stop_name: string };

export default function ConductorPage() {
  const [ticketId, setTicketId] = useState("");
  
  // Autocomplete states
  const [stopSearch, setStopSearch] = useState("");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Stop[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // UI states
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  
  // ✅ NEW: Store the passenger count from the API
  const [passengerCount, setPassengerCount] = useState<number | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // 1. Scanner Logic
  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScanSuccess(decodedText);
          scanner.clear();
          setIsScanning(false);
        },
        (errorMessage) => {}
      );

      return () => {
        scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
      };
    }
  }, [isScanning]);

  const handleScanSuccess = (decodedText: string) => {
    let extractedId = decodedText;
    if (decodedText.startsWith("TICKET_ID:")) {
      extractedId = decodedText.split(":")[1];
    } else if (decodedText.includes("_TICKET:")) {
       const parts = decodedText.split("_TICKET:");
       if (parts.length > 1) extractedId = parts[1];
    }
    setTicketId(extractedId);
  };

  // 2. Autocomplete Logic
  const fetchSuggestions = async (query: string) => {
    try {
      setIsSearching(true);
      const res = await fetch(`/api/stops?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStopSearch(val);
    setSelectedStopId(null);

    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(() => {
        if (val.length > 1) fetchSuggestions(val);
        else setSuggestions([]);
      }, 300)
    );
  };

  const selectStop = (stop: Stop) => {
    setStopSearch(stop.stop_name);
    setSelectedStopId(stop.stop_id.toString());
    setSuggestions([]);
  };

  // 3. Validation Logic
  const handleValidation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!ticketId || !selectedStopId) {
      setStatus("error");
      setStatusMsg("Missing Ticket ID or Stop");
      return;
    }

    setStatus("loading");
    setStatusMsg("Verifying with Blockchain...");
    setPassengerCount(null); // Reset previous count

    try {
      const res = await fetch("/api/scan-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, currentStop: selectedStopId }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setStatusMsg("VALID TICKET ✅");
        // ✅ Capture the passenger count from backend
        setPassengerCount(data.passengers || 1);
      } else {
        setStatus("error");
        setStatusMsg(`INVALID: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setStatusMsg("Network Connection Error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white relative">
      
      {/* Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl overflow-hidden relative">
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
            >
              <X size={24} />
            </button>
            <div id="reader" className="w-full h-full text-black"></div>
          </div>
          <p className="mt-4 text-slate-300">Point camera at Passenger QR Code</p>
        </div>
      )}

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400">
            <ScanLine size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Conductor Scanner</h1>
            <p className="text-slate-400 text-sm">Blockchain Validator</p>
          </div>
        </div>

        <form onSubmit={handleValidation} className="space-y-5">
          {/* ID Input */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">Ticket Blockchain ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID (e.g. 0)"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-lg transition-all"
              />
              <button 
                type="button"
                onClick={() => setIsScanning(true)}
                className="bg-white/10 border border-white/10 rounded-lg px-4 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
              >
                <Camera size={24} />
              </button>
            </div>
          </div>

          {/* Stop Search */}
          <div className="relative">
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">Current Bus Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-slate-500 w-4 h-4 z-10" />
              <input
                type="text"
                placeholder="Search bus stop..."
                value={stopSearch}
                onChange={handleSearchChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-3.5"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>
              )}
            </div>
            {suggestions.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {suggestions.map((stop) => (
                  <li key={stop.stop_id} onClick={() => selectStop(stop)} className="px-4 py-3 hover:bg-white/10 cursor-pointer text-slate-200 border-b border-white/5 flex justify-between">
                    <span>{stop.stop_name}</span>
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">ID: {stop.stop_id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !ticketId || !selectedStopId}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-3.5 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading" ? <><Loader2 className="animate-spin" size={20} /> Validating...</> : "Validate Ticket"}
          </button>
        </form>

        {/* ✅ STATUS DISPLAY */}
        {status !== "idle" && (
          <div className={`mt-6 p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              status === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" :
              status === "loading" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
              "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
            
            <div className="flex items-center gap-3 mb-2">
                {status === "success" && <CheckCircle size={28} />}
                {status === "error" && <XCircle size={28} />}
                {status === "loading" && <Loader2 size={28} className="animate-spin" />}
                <span className="font-semibold text-lg">{statusMsg}</span>
            </div>

            {/* 🔥 PASSENGER COUNT BADGE */}
            {status === "success" && passengerCount !== null && (
                <div className="mt-2 bg-green-500/20 rounded-lg p-3 flex items-center justify-center gap-3 border border-green-500/30">
                    <Users size={32} className="text-green-300" />
                    <div className="text-center">
                        <span className="block text-3xl font-bold text-white leading-none">{passengerCount}</span>
                        <span className="text-xs uppercase font-semibold text-green-300">Passengers Allowed</span>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}