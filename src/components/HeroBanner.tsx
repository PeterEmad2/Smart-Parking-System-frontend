"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  Banknote,
  Bike,
  CarFront,
  Clock,
  History,
  Layers,
  Sparkles,
} from "lucide-react";
import type { ParkingRates } from "@/types/anpr";

interface HeroBannerProps {
  rates?: ParkingRates;
  onStartScan?: () => void;
}

export function HeroBanner({ rates, onStartScan }: HeroBannerProps) {
  const carRate = rates?.car_rate_egp ?? 25;
  const motoRate = rates?.motorcycle_rate_egp ?? 10;

  return (
    <section className="relative pt-4 pb-6 sm:pt-6 sm:pb-8 lg:min-h-[445px] lg:pt-8 lg:pb-9">
      {/* Open Seamless Studio Car + Motorcycle Artwork over Squared Dark Background */}
      <div className="pointer-events-none absolute -inset-x-4 -top-6 -bottom-8 overflow-hidden sm:-inset-x-6">
        <div className="animate-ember-breathe absolute top-[18%] right-[4%] h-72 w-96 rounded-full bg-[#ff4b33]/20 blur-[110px]" />
        <div className="absolute top-[42%] right-[28%] h-52 w-72 rounded-full bg-cyan-400/12 blur-[95px]" />

        <div className="absolute inset-y-0 right-0 w-full lg:w-[84%] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.45)_22%,#000_44%,#000_86%,transparent_100%)]">
          <div className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,#000_12%,#000_78%,transparent_100%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-duo.jpg"
              alt="Stealth black sports sedan and street motorcycle in dark studio with ice-cyan headlights and ember rim lighting"
              className="h-full w-full object-cover object-[72%_center] opacity-95 mix-blend-lighten sm:object-[68%_center] lg:object-right"
            />
          </div>
        </div>
      </div>

      {/* Top-Right Smart Parking Gate Telemetry Pill */}
      <div className="pointer-events-none absolute top-6 right-2 z-20 hidden flex-col items-end gap-3 xl:flex">
        <div className="animate-float-slow flex items-center gap-2 rounded-full border border-cyan-400/30 bg-[#070b12]/80 px-3.5 py-1.5 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.65)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#34d399] shadow-[0_0_10px_#34d399]" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-200">
            SMART GATE ACTIVE · CAR {carRate} EGP/H · MOTO {motoRate} EGP/H
          </span>
        </div>
      </div>

      {/* Bottom-Right Live Gate Entry/Exit Plate Lock Chips */}
      <div className="pointer-events-none absolute right-2 bottom-4 z-20 hidden items-center gap-3 xl:flex">
        <div className="animate-float-slow flex items-center gap-2.5 rounded-2xl border border-cyan-400/25 bg-[#070b13]/85 px-3.5 py-2 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.75)]">
          <div className="overflow-hidden rounded-md border border-slate-900 bg-white">
            <div className="flex items-center justify-between gap-2 bg-[#1d4ed8] px-1.5 py-0.5 text-[7px] font-bold text-white">
              <span>EGYPT</span>
              <span className="font-arabic">مصر</span>
            </div>
            <div
              dir="rtl"
              className="px-2 py-0.5 font-arabic text-xs font-extrabold text-slate-950"
            >
              س ط ن ٦ ٢ ١ ٧
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-white">
              <CarFront className="h-3.5 w-3.5 text-cyan-300" />
              <span>2.5h · {(carRate * 2.5).toFixed(1)} EGP</span>
            </div>
            <p className="font-mono text-[9px] text-[#34d399]">
              Car Tariff ({carRate} EGP/h)
            </p>
          </div>
        </div>

        <div className="animate-float-delayed flex items-center gap-2.5 rounded-2xl border border-[#ff6b52]/30 bg-[#090c14]/85 px-3.5 py-2 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.75)]">
          <div className="overflow-hidden rounded-md border border-slate-900 bg-white">
            <div className="flex items-center justify-between gap-2 bg-[#d97706] px-1.5 py-0.5 text-[7px] font-bold text-white">
              <span>EGYPT</span>
              <span className="font-arabic">مصر</span>
            </div>
            <div
              dir="rtl"
              className="px-2 py-0.5 font-arabic text-xs font-extrabold text-slate-950"
            >
              ف أ ع ٣ ٦ ٢ ٤
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-white">
              <Bike className="h-3.5 w-3.5 text-[#ff7b61]" />
              <span>1.5h · {(motoRate * 1.5).toFixed(0)} EGP</span>
            </div>
            <p className="font-mono text-[9px] text-amber-300">
              2-Row Moto ({motoRate} EGP/h)
            </p>
          </div>
        </div>
      </div>

      {/* Foreground Left Copy */}
      <div className="relative z-10 flex flex-col justify-between lg:max-w-[620px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              AI SMART PARKING GATE · EGYPTIAN ANPR
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-[-0.04em] text-white sm:text-5xl lg:text-[56px]">
            <span className="block drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
              Read every plate.
            </span>
            <span className="mt-1 block bg-gradient-to-r from-[#ff4b33] via-[#ff7847] to-[#22d3ee] bg-clip-text text-transparent">
              Automate every stay.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-[15px]">
            Automated Entry &amp; Exit license plate recognition for Egyptian
            cars and two-row motorcycles — matching repeat plate scans to
            calculate exact parked duration and EGP fees instantly.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartScan}
              className="btn-ember inline-flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-bold tracking-wide sm:text-sm"
            >
              <span>Open Gate Scanner</span>
              <ArrowDownRight className="h-4 w-4" />
            </button>

            <Link
              href="/history"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-[#080c14]/75 px-4 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.08] hover:text-white sm:text-sm"
            >
              <History className="h-4 w-4 text-cyan-300" />
              <span>Parking Ledger</span>
            </Link>
          </div>
        </div>

        {/* Bottom Inline Smart Parking Capabilities */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#070a11]/80 px-3 py-1.5 text-[11px] font-medium text-slate-300 backdrop-blur-md">
            <Clock className="h-3.5 w-3.5 text-[#34d399]" />
            <span>Auto Entry → Exit Timer</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#070a11]/80 px-3 py-1.5 text-[11px] font-medium text-slate-300 backdrop-blur-md">
            <Banknote className="h-3.5 w-3.5 text-[#ff6f56]" />
            <span>Tiered EGP Billing</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#070a11]/80 px-3 py-1.5 text-[11px] font-medium text-slate-300 backdrop-blur-md">
            <Layers className="h-3.5 w-3.5 text-cyan-300" />
            <span>Car &amp; 2-Row Moto RTL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
