"use client";

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Bike,
  CarFront,
  CheckCircle2,
  LogOut,
  ParkingSquare,
  SlidersHorizontal,
} from "lucide-react";
import { formatDurationLabel } from "@/lib/mockData";
import type { ParkingSessionRecord, ParkingSummary } from "@/types/anpr";

interface ActiveParkingStripProps {
  summary: ParkingSummary;
  activeSessions: ParkingSessionRecord[];
  onCheckoutSession: (sessionId: number, simulateMinutes?: number) => void;
  onSelectSessionPlate?: (session: ParkingSessionRecord) => void;
  onOpenTariffSettings?: () => void;
}

export function ActiveParkingStrip({
  summary,
  activeSessions,
  onCheckoutSession,
  onSelectSessionPlate,
  onOpenTariffSettings,
}: ActiveParkingStripProps) {
  return (
    <section className="mt-3 space-y-3.5">
      {/* 4 Smart Parking KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="cockpit-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CURRENTLY PARKED
            </span>
            <ParkingSquare className="h-4 w-4 text-cyan-300" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary.active_parked_count}
            </span>
            <span className="font-mono text-[11px] text-cyan-300">
              {summary.active_cars} Car · {summary.active_motorcycles} Moto
            </span>
          </div>
        </div>

        <div className="cockpit-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              COMPLETED EXITS
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#34d399]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary.completed_count}
            </span>
            <span className="text-xs text-slate-400">billed stays</span>
          </div>
        </div>

        <div className="cockpit-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL REVENUE
            </span>
            <Banknote className="h-4 w-4 text-[#ff7b61]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">
              {summary.total_revenue_egp.toFixed(2)}
            </span>
            <span className="font-mono text-xs font-bold text-[#ff8b73]">
              EGP
            </span>
          </div>
        </div>

        <div className="cockpit-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              HOURLY TARIFF
            </span>
            <button
              type="button"
              onClick={onOpenTariffSettings}
              className="inline-flex items-center gap-1 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:text-white"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs font-bold text-white">
            <span>Car {summary.rates.car_rate_egp} EGP/h</span>
            <span className="text-slate-600">·</span>
            <span className="text-[#ff8b73]">
              Moto {summary.rates.motorcycle_rate_egp} EGP/h
            </span>
          </div>
        </div>
      </div>

      {/* Live Vehicles Inside Garage Strip */}
      {activeSessions.length > 0 && (
        <div className="cockpit-card rounded-2xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Vehicles Currently Inside Garage ({activeSessions.length})
              </span>
            </div>

            <Link
              href="/history"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 transition hover:text-white"
            >
              <span>Full Parking Ledger</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            {activeSessions.slice(0, 6).map((sess) => {
              const isMoto = sess.vehicle_type === "motorcycle";
              const Icon = isMoto ? Bike : CarFront;
              return (
                <div
                  key={sess.session_id}
                  onClick={() => onSelectSessionPlate?.(sess)}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#05080f]/90 px-3 py-2 transition hover:border-cyan-400/35"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isMoto ? "text-[#ff8469]" : "text-cyan-300"
                      }`}
                    />
                    <span
                      dir="rtl"
                      className="font-arabic text-sm font-extrabold text-white"
                    >
                      {sess.plate_text}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-400">
                    {formatDurationLabel(sess.duration_minutes)} ·{" "}
                    <strong className="text-emerald-300">
                      {sess.total_fee_egp.toFixed(0)} EGP
                    </strong>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCheckoutSession(sess.session_id, 120);
                    }}
                    title="Simulate +2h Exit & Calculate Fee"
                    className="inline-flex items-center gap-1 rounded-md border border-[#ff6b52]/35 bg-[#ff4b33]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#ff8b73] transition hover:bg-[#ff4b33]/30 hover:text-white"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>+2h Exit</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
