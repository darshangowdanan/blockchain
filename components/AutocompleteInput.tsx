"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  color?: "cyan" | "fuchsia";
}

export default function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  color = "cyan",
}: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch
  useEffect(() => {
    if (!value) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(`/api/stops?search=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(data);
      setIsOpen(true);
    }, 300);
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev === 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      onChange(suggestions[activeIndex].stop_name);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full md:w-1/4">
      <label className="text-slate-300 text-sm mb-1 ml-1 block">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`px-4 py-3 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-${color}-500 text-lg placeholder:text-slate-400 transition w-full`}
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-black/80 border border-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              onClick={() => {
                onChange(s.stop_name);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer text-white ${
                i === activeIndex ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              {s.stop_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
