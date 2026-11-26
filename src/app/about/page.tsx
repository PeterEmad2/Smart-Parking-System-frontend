"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Clock,
  Languages,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getHealth } from "@/lib/api";

const FEATURE_CARDS = [
  {
    icon: Languages,
    accent: "cyan" as const,
    title: "Car & 2-Row Motorcycle RTL OCR",
    description:
      "Decoupled 29-class YOLO26m plate localization + 28-class EALPR character OCR decodes single-row cars and stacked motorcycle plates right-to-left.",
  },
  {
    icon: Clock,
    accent: "emerald" as const,
    title: "Automatic Same-Plate Entry & Exit",
    description:
      "Normalized Arabic plate matching opens an Entry ticket on the first scan and automatically calculates exact stay duration when the same plate exits.",
  },
  {
    icon: Banknote,
    accent: "ember" as const,
    title: "Tiered Egyptian EGP Billing",
    description:
      "Configurable hourly tariffs by vehicle class (default 25 EGP/hr Cars, 10 EGP/hr Motorcycles) with 1-hour minimum and 30-minute block rounding.",
  },
];

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Entry Gate Scan",
    description:
      "Vehicle arrives at gate; YOLO26m + EALPR OCR reads the Arabic plate and opens an active 'Parked' session.",
  },
  {
    step: "02",
    title: "Live Garage Tracking",
    description:
      "Active parked cars and motorcycles accrue time in SQLite with real-time elapsed timers and occupancy KPIs.",
  },
  {
    step: "03",
    title: "Same-Plate Exit Match",
    description:
      "Scanning the same license plate at the exit automatically pairs Entry & Exit timestamps (ignoring spaces/glyph variants).",
  },
  {
    step: "04",
    title: "Instant EGP Receipt",
    description:
      "System computes billable hours, applies Car or Motorcycle EGP rate, logs revenue, and generates a printable receipt.",
  },
];

export default function AboutPage() {
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((h) => {
        if (!cancelled) setBackendOnline(h.status === "ok" && h.model_loaded);
      })
      .catch(() => {
        if (!cancelled) setBackendOnline(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar systemOperational={backendOnline} />

      <main className="mx-auto w-full max-w-[1220px] flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Gate Cockpit</span>
        </Link>

        {/* Open Seamless About Hero Over Squared Grid */}
        <section className="relative mt-4 py-6 sm:py-9">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[64%] overflow-hidden md:block [mask-image:linear-gradient(to_right,transparent_0%,#000_42%,#000_86%,transparent_100%)]">
            <div className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,#000_15%,#000_82%,transparent_100%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-duo.jpg"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover object-right opacity-55 mix-blend-lighten"
              />
            </div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="badge-cyan inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>EALPR SMART PARKING SYSTEM</span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.08]">
              Automated{" "}
              <span className="bg-gradient-to-r from-[#ff4b33] via-[#ff7847] to-[#22d3ee] bg-clip-text text-transparent">
                Egyptian parking gate
              </span>{" "}
              &amp; plate billing.
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300/85 sm:text-[15px]">
              EALPR Smart Park pairs our decoupled two-stage YOLO26m + Arabic
              OCR engine with an automated SQLite gate ledger. Every vehicle is
              identified solely by its Egyptian license plate — eliminating
              paper tickets, RFID cards, and manual fee calculation.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[15px]">
              When the same car or motorcycle plate is scanned a second time,
              the system computes exact elapsed minutes, rounds billable hours
              according to garage policy, applies the vehicle-specific EGP
              tariff, and issues an instant checkout receipt.
            </p>
          </div>
        </section>

        {/* 3-Column Feature Cards */}
        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon;
            const iconStyle =
              feature.accent === "ember"
                ? "border-[#ff5b45]/35 bg-[#ff4b33]/15 text-[#ff7847]"
                : feature.accent === "cyan"
                  ? "border-cyan-400/35 bg-cyan-400/12 text-cyan-300"
                  : "border-emerald-400/35 bg-emerald-400/12 text-[#34d399]";

            return (
              <div
                key={feature.title}
                className="cockpit-card rounded-2xl p-6"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${iconStyle}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {feature.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* How Smart Parking Works — 4-Step Pipeline */}
        <section className="cockpit-card mt-6 overflow-hidden rounded-3xl p-7 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#ff4b33]/55 via-cyan-400/40 to-transparent" />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
                GATE-TO-RECEIPT WORKFLOW
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                How Smart Parking Billing Works
              </h2>
            </div>

            <Link
              href="/"
              className="btn-ember inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"
            >
              <span>Open Gate Scanner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE_STEPS.map((item, idx) => (
              <div
                key={item.step}
                className="rounded-2xl border border-white/10 bg-[#05080f]/80 p-5 transition hover:border-cyan-400/30"
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    idx % 2 === 0 ? "badge-ember" : "badge-cyan"
                  }`}
                >
                  {item.step}
                </span>
                <h3 className="mt-4 text-sm font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
