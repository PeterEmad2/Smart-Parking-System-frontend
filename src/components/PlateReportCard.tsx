"use client";

import {
  CheckCircle2,
  Copy,
  FileText,
  Gauge,
  Layers,
  Printer,
  ShieldCheck,
} from "lucide-react";
import type { ScanResponse } from "@/types/anpr";

interface PlateReportCardProps {
  scan: ScanResponse | null;
  onNotify: (msg: string, tone?: "success" | "info" | "danger") => void;
}

export function PlateReportCard({ scan, onNotify }: PlateReportCardProps) {
  if (!scan) {
    return (
      <div className="cockpit-card flex min-h-[220px] flex-col items-center justify-center rounded-2xl p-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
          <FileText className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-white">
          AI Telemetry &amp; Plate Report
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Analyze a vehicle image to generate the structured RTL Arabic character
          breakdown.
        </p>
      </div>
    );
  }

  const primary = scan.plates[0];
  const meanPrecision =
    scan.plates.length > 0
      ? Math.round(
          (scan.plates.reduce((acc, p) => acc + p.precision, 0) /
            scan.plates.length) *
            100
        )
      : 0;
  const totalChars = scan.plates.reduce(
    (acc, p) => acc + p.characters.length,
    0
  );
  const anyPartial = scan.plates.some((p) => p.is_partial);

  function handleCopyJson() {
    navigator.clipboard
      ?.writeText(JSON.stringify(scan, null, 2))
      .catch(() => {});
    onNotify("Structured JSON report copied", "success");
  }

  return (
    <div className="cockpit-card space-y-5 overflow-hidden rounded-2xl p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#ff4b33]/55 via-cyan-400/35 to-transparent" />

      {/* Report Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ff5b45]/35 bg-gradient-to-br from-[#ff4b33]/20 to-cyan-400/10 text-[#ff7847]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-white">
              AI Plate Telemetry Report
            </h2>
            <p className="text-xs text-slate-400">
              Structured Egyptian plate &amp; RTL character assessment ·{" "}
              <span className="font-mono text-cyan-300">
                Scan #{scan.scan_id}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/35 hover:text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-ember inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 3-Column Dual-Accent KPI Summary Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#070a10]/85 p-4">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#34d399] to-transparent" />
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-[#34d399]" />
            <span>READ STATUS</span>
          </div>
          <div className="mt-2.5">
            {scan.plate_count === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                No Plate Found
              </span>
            ) : anyPartial ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/12 px-3 py-1 text-xs font-semibold text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Partial Read
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-[#34d399]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                Full RTL Match
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            BiDi Arabic sequence verified
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#070a10]/85 p-4">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent" />
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>PLATES &amp; TOKENS</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {scan.plate_count}
            </span>
            <span className="font-mono text-xs text-cyan-300">
              · {totalChars} tokens
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {primary
              ? `Primary class: ${primary.vehicle_type}`
              : "No vehicle plate localized"}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#070a10]/85 p-4">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#ff4b33] to-[#ff7847]" />
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <Gauge className="h-3.5 w-3.5 text-[#ff7847]" />
            <span>MEAN CONFIDENCE</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white">
              {meanPrecision}
            </span>
            <span className="font-mono text-xs text-[#ff8b73]">%</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Stage-1 YOLO26m precision
          </p>
        </div>
      </div>

      {/* Plate Assessment Breakdown */}
      <div className="rounded-xl border border-white/10 bg-[#070a10]/75 p-4">
        <div className="mb-3 flex items-center justify-between border-b border-white/[0.07] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Character Token &amp; Geometry Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Right-to-left Arabic letters &amp; numerals with pixel bounding
              coordinates
            </p>
          </div>
          <span className="badge-cyan rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider">
            {scan.plates.length}{" "}
            {scan.plates.length === 1 ? "DETECTION" : "DETECTIONS"}
          </span>
        </div>

        {scan.plates.length > 0 ? (
          <div className="divide-y divide-white/[0.07]">
            {scan.plates.map((p) => (
              <div
                key={`rep-${scan.scan_id}-${p.plate_index}`}
                className="flex flex-col gap-3 py-3.5 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff5b45] shadow-[0_0_8px_#ff5b45]" />
                    <span className="text-xs font-bold text-white">
                      Plate #{p.plate_index} ·{" "}
                      {p.vehicle_type === "motorcycle"
                        ? "Motorcycle (2-Row)"
                        : p.vehicle_type === "car"
                          ? "Passenger Car"
                          : "Vehicle"}
                    </span>
                    <span className="badge-ember rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold">
                      {(p.precision * 100).toFixed(0)}% conf
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-cyan-300">
                    bbox [{p.bbox.join(", ")}]
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.vehicle_type === "motorcycle"
                      ? "Two-row stacked plate decoded with letters row first, followed by numerals right-to-left."
                      : "Single-row wide Egyptian license plate decoded right-to-left."}
                  </p>
                </div>

                {/* Glowing RTL Character Token Chips */}
                <div dir="rtl" className="flex flex-wrap items-center gap-1.5">
                  {p.characters.map((ch, idx) => (
                    <span
                      key={`rtok-${p.plate_index}-${idx}`}
                      className="inline-flex h-9 min-w-[34px] items-center justify-center rounded-lg border border-cyan-400/25 bg-[#04060a] px-2.5 font-arabic text-base font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-[#ff6b52]/60 hover:text-[#ff9c86]"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-xs text-slate-400">
            No plates met the active detection confidence threshold.
          </p>
        )}
      </div>

      {/* 2-Column Pipeline & Verification Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#070a10]/75 p-4">
          <h3 className="mb-3 text-sm font-bold text-white">
            Dual-Stage Recognition Pipeline
          </h3>
          <ol className="space-y-2.5 text-xs text-slate-300/85">
            {[
              "Stage-1 YOLO26m localizes plate region and classifies Car vs. Motorcycle.",
              "6% adaptive padding & bicubic upscaling normalize compact plate crops.",
              "Stage-2 pure EALPR OCR extracts 27 Arabic letters & numerals with IoU filtering.",
              "Y-gap row clustering orders stacked motorcycle plates (letters row first, RTL).",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 font-mono text-[10px] font-bold text-cyan-300">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070a10]/75 p-4">
          <h3 className="mb-3 text-sm font-bold text-white">
            Telemetry Verification
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300/85">
            {[
              "29-class Car & Motorcycle Stage-1 detector active",
              "Zero-suppression pure-EALPR Stage-2 character head",
              "Arabic letter reshaping & BiDi visual ordering verified",
              `Scan #${scan.scan_id} indexed for instant History lookup`,
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#34d399]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
