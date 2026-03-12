"use client";

import { useState, useRef, useEffect } from "react";

const triggerBaseClass =
  "h-12 w-full rounded-box border-2 bg-white px-4 py-3 text-sm text-foreground shadow-sm transition placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-[#e87b35]/25 focus:shadow-md focus:shadow-[#e87b35]/10 text-left flex items-center justify-between gap-2";

interface FormSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  "aria-label": string;
}

export function FormSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  "aria-label": ariaLabel,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const display = value || placeholder;
  const isPlaceholder = !value;

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`${triggerBaseClass} border-foreground/15 hover:border-foreground/25 ${open ? "border-[#e87b35] ring-2 ring-[#e87b35]/25" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={isPlaceholder ? "text-foreground/40" : ""}>{display}</span>
        <span
          className="shrink-0 text-foreground/60 transition-transform duration-200 ease-out"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        role="listbox"
        aria-label={ariaLabel}
        className="dropdown-panel absolute left-0 top-full z-50 mt-1 min-w-full overflow-hidden rounded-box border-2 border-foreground/15 bg-white py-1 shadow-lg"
        style={{
          visibility: open ? "visible" : "hidden",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transformOrigin: "top",
          pointerEvents: open ? "auto" : "none",
          transition: open
            ? "visibility 0s, opacity 0.2s ease-out, transform 0.2s ease-out"
            : "opacity 0.2s ease-out, transform 0.2s ease-out, visibility 0s linear 0.2s",
        }}
      >
        <div className="max-h-56 overflow-y-auto py-1">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-foreground/5 focus:bg-foreground/5 focus:outline-none"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
