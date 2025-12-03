"use client";

import { useState, useEffect, useRef } from "react";
import { ScanLine, CheckCircle, XCircle, MapPin, Loader2, Camera, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ConductorPage() {
  // State for form inputs
  const [ticketId, setTicketId] = useState("");
  const [currentStop, setCurrentStop] = useState("Kempegowda Bus Station (Majestic)"); 
  
  // State for UI feedback
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Scanner Logic
  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          // Success Callback
          handleScanSuccess(decodedText);
          scanner.clear();
          setIsScanning(false);
        },
        (errorMessage) => {
          // Error Callback (ignore frame errors)
        }
      );

      return () => {
        scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
      };
    }
  }, [isScanning]);

  const handleScanSuccess = (decodedText: string) => {
    // Parse the QR data (Format: "TICKET_ID:101" or just "101")
    let extractedId = decodedText;
    
    if (decodedText.startsWith("TICKET_ID:")) {
      extractedId = decodedText.split(":")[1];
    } else if (decodedText.includes("_TICKET:")) {
       // Handle older format GROUP:ID_TICKET:ID
       const parts = decodedText.split("_TICKET:");
       if (parts.length > 1) extractedId = parts[1];
    }

    setTicketId(extractedId);
    // Auto-submit after scanning? Optional. Let's just fill the input.
    // handleValidation(extractedId); 
  };

  const handleValidation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketId) return;

    setStatus("loading");
    setStatusMsg("Verifying with Blockchain...");

    try {
      const res = await fetch("/api/scan-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, currentStop }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setStatusMsg("VALID TICKET ✅");
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
      
      {/* SCANNER MODAL */}
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

      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400">
            <ScanLine size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Conductor Scanner</h1>
            <p className="text-slate-400 text-sm">Blockchain Validator</p>
          </div>
        </div>

        {/* Validation Form */}
        <form onSubmit={handleValidation} className="space-y-5">
          
          {/* Ticket ID Input */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">
              Ticket Blockchain ID
            </label>
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
                title="Open Camera"
              >
                <Camera size={24} />
              </button>
            </div>
          </div>

          {/* Bus Stop Selection */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5 font-medium">
              Current Bus Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
              <select
                value={currentStop}
                onChange={(e) => setCurrentStop(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white appearance-none focus:ring-2 focus:ring-fuchsia-500 outline-none cursor-pointer transition-all"
              >
                <option value="Kempegowda Bus Station (Majestic)">Kempegowda Bus Station (Majestic)</option>
                <option value="Shivajinagar Bus Station">Shivajinagar Bus Station</option>
                <option value="Banashankari Bus Station">Banashankari Bus Station</option>
                <option value="K R Market">K R Market</option>
                <option value="Whitefield">Whitefield</option>
                <option value="Yelahanka">Yelahanka</option>
                <option value="Electronic City">Electronic City</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading" || !ticketId}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-3.5 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Validating...
              </>
            ) : (
              "Validate Ticket"
            )}
          </button>
        </form>

        {/* Status Feedback Display */}
        {status !== "idle" && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              status === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : status === "loading"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {status === "success" && <CheckCircle size={28} className="shrink-0" />}
            {status === "error" && <XCircle size={28} className="shrink-0" />}
            {status === "loading" && <Loader2 size={28} className="animate-spin shrink-0" />}
            
            <span className="font-semibold text-lg leading-tight">
              {statusMsg}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}