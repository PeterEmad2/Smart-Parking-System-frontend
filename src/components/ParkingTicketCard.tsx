"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bike,
  CarFront,
  Check,
  Clock,
  Copy,
  LogIn,
  LogOut,
  Printer,
  Receipt,
  Timer,
} from "lucide-react";
import { calculateParkingFee, formatDurationLabel } from "@/lib/mockData";
import type { ParkingSessionRecord } from "@/types/anpr";

interface ParkingTicketCardProps {
  event: ParkingSessionRecord | null;
  onCheckoutSession: (sessionId: number, simulateMinutes?: number) => void;
  onNotify: (msg: string, tone?: "success" | "info" | "danger") => void;
}

function formatDateTimeShort(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatStaticMinutesAsStopwatch(minutes: number): string {
  const clamped = Math.max(0, Math.floor(minutes));
  const hrs = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(
    2,
    "0"
  )}m 00s`;
}

function formatLiveStopwatch(entryIso: string, nowMs: number): string {
  const diffSec = Math.max(
    0,
    Math.floor((nowMs - Date.parse(entryIso)) / 1000)
  );
  const hrs = Math.floor(diffSec / 3600);
  const mins = Math.floor((diffSec % 3600) / 60);
  const secs = diffSec % 60;
  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(
    2,
    "0"
  )}m ${String(secs).padStart(2, "0")}s`;
}

export function ParkingTicketCard({
  event,
  onCheckoutSession,
  onNotify,
}: ParkingTicketCardProps) {
  // Defer Date.now() until after client hydration so SSR HTML matches initial client render
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const initialTick = window.setTimeout(() => setNowMs(Date.now()), 0);
    if (!event || event.status !== "parked") {
      return () => window.clearTimeout(initialTick);
    }
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(intervalId);
    };
  }, [event]);

  if (!event) {
    return (
      <div className="cockpit-card flex min-h-[180px] flex-col items-center justify-center rounded-2xl p-6 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ff5b45]/30 bg-[#ff4b33]/12 text-[#ff7847]">
          <Receipt className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-white">
          Smart Parking Gate &amp; Billing Ticket
        </h3>
        <p className="mt-1 max-w-md text-xs text-slate-400">
          Scan a readable license plate to open an Entry session, then scan the{" "}
          <span className="text-white">same plate</span> again to calculate
          parked time and EGP fee.
        </p>
      </div>
    );
  }

  const isParked = event.status === "parked";
  const isMoto = event.vehicle_type === "motorcycle";
  const VehicleIcon = isMoto ? Bike : CarFront;

  const liveElapsedMins =
    isParked && nowMs !== null
      ? Math.max(0, Math.floor((nowMs - Date.parse(event.entry_time)) / 60000))
      : event.duration_minutes;

  const liveBilling = isParked
    ? calculateParkingFee(liveElapsedMins, event.hourly_rate_egp)
    : {
        billableHours: event.billable_hours,
        totalFeeEgp: event.total_fee_egp,
      };

  function handleCopyTicket() {
    if (!event) return;
    const summaryText = [
      `EALPR SMART PARKING ${isParked ? "ENTRY TICKET" : "EXIT RECEIPT"}`,
      `Session: #PK-${event.session_id}`,
      `Plate: ${event.plate_text} (${event.vehicle_type.toUpperCase()})`,
      `Entry: ${formatDateTimeShort(event.entry_time)}`,
      isParked
        ? `Status: CURRENTLY PARKED (${formatDurationLabel(liveElapsedMins)})`
        : `Exit: ${formatDateTimeShort(event.exit_time)}`,
      `Billable Duration: ${liveBilling.billableHours.toFixed(1)} hrs @ ${event.hourly_rate_egp} EGP/hr`,
      `Total ${isParked ? "Accrued" : "Amount Due"}: ${liveBilling.totalFeeEgp.toFixed(2)} EGP`,
    ].join("\n");

    navigator.clipboard?.writeText(summaryText).catch(() => {});
    setCopied(true);
    onNotify("Parking ticket copied to clipboard", "success");
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="cockpit-card overflow-hidden rounded-2xl p-5">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${
          isParked
            ? "bg-gradient-to-r from-[#34d399] via-cyan-400 to-transparent"
            : "bg-gradient-to-r from-[#ff4b33] via-amber-400 to-cyan-400"
        }`}
      />

      {/* Ticket Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isParked
                ? "border-emerald-400/35 bg-emerald-400/12 text-[#34d399]"
                : "border-[#ff6b52]/40 bg-[#ff4b33]/15 text-[#ff7b61]"
            }`}
          >
            {isParked ? (
              <LogIn className="h-5 w-5" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                  isParked
                    ? "border-emerald-400/35 bg-emerald-400/12 text-[#34d399]"
                    : "border-amber-400/35 bg-amber-400/15 text-amber-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isParked ? "animate-pulse bg-[#34d399]" : "bg-amber-400"
                  }`}
                />
                {isParked
                  ? "ENTRY GATE · ACTIVE STAY"
                  : "EXIT GATE · FEE CALCULATED"}
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">
                #PK-{event.session_id}
              </span>
            </div>
            <h2 className="mt-1 text-[15px] font-extrabold text-white">
              {isParked
                ? "Smart Parking Check-In Ticket"
                : "Smart Parking Checkout & EGP Receipt"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyTicket}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/35 hover:text-white"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#34d399]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>Copy Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn-ember inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Body */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left: Plate Identity + Entry/Exit Timestamps */}
        <div className="flex flex-col justify-between gap-3.5 rounded-xl border border-white/10 bg-[#05080f]/85 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-lg border border-slate-900 bg-white shadow-md">
                <div
                  className={`flex items-center justify-between gap-3 px-2 py-0.5 text-[8px] font-extrabold text-white ${
                    isMoto ? "bg-[#d97706]" : "bg-[#1d4ed8]"
                  }`}
                >
                  <span>EGYPT</span>
                  <span className="font-arabic">مصر</span>
                </div>
                <div
                  dir="rtl"
                  className="px-3 py-1 font-arabic text-lg font-extrabold text-slate-950"
                >
                  {event.plate_text}
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                  <VehicleIcon className="h-3.5 w-3.5 text-cyan-300" />
                  <span>
                    {isMoto ? "Motorcycle Tariff" : "Passenger Car Tariff"}
                  </span>
                </div>
                <p className="font-mono text-xs text-cyan-300">
                  {event.hourly_rate_egp.toFixed(0)} EGP / hour
                </p>
                <p className="text-[11px] text-slate-400">
                  1 hr minimum · +30 min blocks
                </p>
              </div>
            </div>

            {/* Hydration-Safe Live Stopwatch or Completed Duration Badge */}
            <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] px-3.5 py-2 text-right">
              <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                <Timer className="h-3.5 w-3.5" />
                <span>{isParked ? "LIVE PARKED TIME" : "TOTAL STAY"}</span>
              </div>
              <div className="mt-0.5 font-mono text-sm font-extrabold text-white">
                {isParked
                  ? nowMs !== null
                    ? formatLiveStopwatch(event.entry_time, nowMs)
                    : formatStaticMinutesAsStopwatch(event.duration_minutes)
                  : formatDurationLabel(event.duration_minutes)}
              </div>
            </div>
          </div>

          {/* Entry -> Exit Timestamp Row */}
          <div className="grid grid-cols-1 gap-2.5 border-t border-white/[0.07] pt-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.07] bg-black/35 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                ENTRY TIMESTAMP
              </span>
              <p
                suppressHydrationWarning
                className="mt-0.5 font-mono text-xs font-semibold text-white"
              >
                {nowMs !== null
                  ? formatDateTimeShort(event.entry_time)
                  : event.entry_time.slice(0, 19).replace("T", " ") + " UTC"}
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.07] bg-black/35 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                EXIT TIMESTAMP
              </span>
              <p
                suppressHydrationWarning
                className={`mt-0.5 font-mono text-xs font-semibold ${
                  isParked ? "text-emerald-300" : "text-[#ff8b73]"
                }`}
              >
                {isParked
                  ? "Still Parked Inside Garage"
                  : nowMs !== null
                    ? formatDateTimeShort(event.exit_time)
                    : (event.exit_time || "").slice(0, 19).replace("T", " ") +
                      " UTC"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Standout EGP Fee Box + Quick Checkout Actions */}
        <div
          className={`flex flex-col justify-between rounded-xl border p-4 ${
            isParked
              ? "border-emerald-400/25 bg-gradient-to-b from-emerald-950/25 to-[#05080f]"
              : "border-[#ff6b52]/35 bg-gradient-to-b from-[#ff4b33]/15 to-[#05080f]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                {isParked ? "ACCRUED FEE" : "TOTAL PARKING FEE"}
              </span>
              <span className="font-mono text-[11px] font-semibold text-cyan-300">
                {liveBilling.billableHours.toFixed(1)} billable hrs
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {liveBilling.totalFeeEgp.toFixed(2)}
              </span>
              <span className="font-mono text-sm font-bold text-[#ff8b73]">
                EGP
              </span>
            </div>

            <p className="mt-1 font-mono text-[11px] text-slate-400">
              {liveBilling.billableHours.toFixed(1)}h ×{" "}
              {event.hourly_rate_egp.toFixed(0)} EGP/h
            </p>
          </div>

          {isParked ? (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onCheckoutSession(event.session_id, 0)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/[0.05] px-2.5 py-2 text-[11px] font-bold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                >
                  <Clock className="h-3 w-3 text-cyan-300" />
                  <span>Exit Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => onCheckoutSession(event.session_id, 120)}
                  className="btn-ember inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-bold"
                >
                  <span>+2h Exit</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <p className="text-[10px] leading-snug text-slate-400">
                Scan{" "}
                <span className="font-arabic text-white">
                  {event.plate_text}
                </span>{" "}
                again at the gate to auto-calculate final checkout price.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-[#34d399]">
              ✓ Same-plate exit matched &amp; session closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
