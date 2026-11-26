"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Info, ParkingSquare, ScanLine } from "lucide-react";

interface NavbarProps {
  systemOperational?: boolean;
  activeParkedCount?: number;
  onToggleDemoStatus?: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Gate & Analyze", icon: ScanLine },
  { href: "/history", label: "Parking Ledger", icon: History },
  { href: "/about", label: "About", icon: Info },
];

export function Navbar({
  systemOperational = true,
  activeParkedCount,
  onToggleDemoStatus,
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 h-[74px] border-b border-white/[0.08] bg-[#05070b]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-full max-w-[1450px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Emblem */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff5b45]/35 bg-gradient-to-br from-[#ff4b33]/20 via-[#101622] to-cyan-400/15 text-[#ff6f56] shadow-[0_0_22px_-4px_rgba(255,75,51,0.38)] transition group-hover:border-[#ff7847]/60">
            <ParkingSquare className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                EALPR
              </span>
              <span className="badge-cyan hidden rounded-md px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider sm:inline-block">
                SMART PARK
              </span>
            </div>
            <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-400/75">
              EGYPTIAN ANPR &amp; GATE BILLING
            </div>
          </div>
        </Link>

        {/* Floating Glass Pill Navigation Capsule */}
        <nav className="flex items-center gap-1 rounded-full border border-white/[0.09] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-[13px] ${
                  active
                    ? "border border-[#ff6b52]/45 bg-gradient-to-r from-[#ff4b33]/25 to-[#ff7847]/15 text-white shadow-[0_0_20px_-4px_rgba(255,75,51,0.45)]"
                    : "border border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    active ? "text-[#ff7b61]" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Live Occupancy + API Status */}
        <div className="flex items-center gap-2.5">
          {activeParkedCount !== undefined && (
            <Link
              href="/history"
              className="hidden items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 font-mono text-[10px] font-semibold text-cyan-200 transition hover:border-cyan-400/45 lg:inline-flex"
            >
              <ParkingSquare className="h-3 w-3 text-cyan-300" />
              <span>{activeParkedCount} Parked</span>
            </Link>
          )}

          <button
            type="button"
            onClick={onToggleDemoStatus}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              systemOperational
                ? "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200"
                : "border-amber-400/25 bg-amber-400/[0.08] text-amber-200"
            } ${
              onToggleDemoStatus
                ? "cursor-pointer hover:border-white/25"
                : "cursor-default"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                systemOperational
                  ? "animate-pulse bg-[#34d399] shadow-[0_0_10px_#34d399]"
                  : "bg-amber-400 shadow-[0_0_10px_#fbbf24]"
              }`}
            />
            <span className="hidden sm:inline">
              {systemOperational ? "Gate API Online" : "Interactive Demo"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
