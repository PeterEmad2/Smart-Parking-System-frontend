"use client";

import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-white/[0.08] bg-[#04060a]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1450px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-[11px] text-slate-400/75">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5b45]" />
          <span>
            EALPR Vision · AI Egyptian Car &amp; Motorcycle License Plate
            Recognition
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/" className="transition hover:text-white">
            Analyze
          </Link>
          <Link href="/history" className="transition hover:text-white">
            History
          </Link>
          <Link href="/about" className="transition hover:text-white">
            About
          </Link>
          <a
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-cyan-300/80 transition hover:text-cyan-200"
          >
            FastAPI Docs
          </a>
          <span className="text-slate-500">YOLO26m + EALPR-OCR</span>
        </div>
      </div>
    </footer>
  );
}
