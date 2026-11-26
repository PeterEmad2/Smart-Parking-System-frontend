"use client";

import { useState } from "react";
import {
  Bike,
  CarFront,
  Check,
  Copy,
  Download,
  Maximize2,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/api";
import type { PlateDetection, ScanResponse } from "@/types/anpr";

interface StepResultsCardProps {
  scan: ScanResponse | null;
  originalUrl: string | null;
  onOpenFullscreen: (url: string, title: string) => void;
  onNotify: (msg: string, tone?: "success" | "info" | "danger") => void;
}

export async function downloadFileFromUrl(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function DetectedPlateRow({
  plate,
  onCopyText,
}: {
  plate: PlateDetection;
  onCopyText: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isMoto = plate.vehicle_type === "motorcycle";
  const Icon = isMoto ? Bike : CarFront;
  const pct = Math.round(plate.precision * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-3.5 transition hover:border-cyan-400/30">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
              isMoto
                ? "border-[#ff6b52]/35 bg-[#ff4b33]/15 text-[#ff8469]"
                : "border-cyan-400/30 bg-cyan-400/12 text-cyan-300"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {isMoto
                  ? "Motorcycle Plate"
                  : plate.vehicle_type === "car"
                    ? "Car Plate"
                    : "License Plate"}
              </span>
              <button
                type="button"
                disabled={!plate.text}
                onClick={() => {
                  if (!plate.text) return;
                  navigator.clipboard?.writeText(plate.text).catch(() => {});
                  setCopied(true);
                  onCopyText(plate.text);
                  setTimeout(() => setCopied(false), 1400);
                }}
                title="Copy Arabic plate text"
                className="rounded p-0.5 text-slate-400 transition hover:text-cyan-300 disabled:opacity-30"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[#34d399]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {isMoto ? "Two-row stacked RTL" : "Single-row Egyptian plate"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-xs font-bold text-white">{pct}%</div>
          <div
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              plate.is_partial ? "text-amber-400" : "text-[#34d399]"
            }`}
          >
            {plate.is_partial ? "Partial" : "Verified"}
          </div>
        </div>
      </div>

      {/* Authentic Stylized Egyptian License Plate Graphic */}
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-900 shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
        <div
          className={`flex items-center justify-between px-2.5 py-1 text-[9px] font-extrabold tracking-wider text-white ${
            isMoto
              ? "bg-gradient-to-r from-[#d97706] to-[#f59e0b]"
              : "bg-gradient-to-r from-[#1d4ed8] to-[#2563eb]"
          }`}
        >
          <span>EGYPT</span>
          <span className="font-arabic text-[11px]" dir="rtl">
            مصر
          </span>
        </div>
        <div className="flex min-h-[42px] items-center justify-center bg-gradient-to-b from-white via-slate-100 to-slate-200 px-3 py-1.5">
          {plate.text ? (
            <span
              dir="rtl"
              className="font-arabic text-xl font-extrabold tracking-wide text-slate-950"
            >
              {plate.text}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Unreadable</span>
          )}
        </div>
      </div>

      {/* Precision Progress Bar */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/50">
        <div
          style={{ width: `${Math.max(8, pct)}%` }}
          className={`h-full rounded-full ${
            isMoto
              ? "bg-gradient-to-r from-[#ff4b33] to-amber-400"
              : "bg-gradient-to-r from-cyan-400 to-[#34d399]"
          }`}
        />
      </div>
    </div>
  );
}

export function StepResultsCard({
  scan,
  originalUrl,
  onOpenFullscreen,
  onNotify,
}: StepResultsCardProps) {
  const [tab, setTab] = useState<"detection" | "original">("detection");
  const [zoomed, setZoomed] = useState(false);

  const annotatedUrl = resolveImageUrl(scan?.annotated_image_url);
  const activeUrl =
    tab === "original" && originalUrl ? originalUrl : annotatedUrl || originalUrl;
  const hasImage = Boolean(scan && activeUrl);

  async function handleCopyImage() {
    if (!activeUrl) return;
    try {
      const res = await fetch(activeUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type || "image/png"]: blob }),
      ]);
      onNotify("Image copied to clipboard", "success");
    } catch {
      await navigator.clipboard?.writeText(activeUrl).catch(() => {});
      onNotify("Image link copied to clipboard", "info");
    }
  }

  return (
    <div className="cockpit-card overflow-hidden rounded-2xl p-5">
      {/* Subtle Ice-Cyan Top Specular Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400/65 via-cyan-300/20 to-transparent" />

      {/* Step 02 Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/15 font-mono text-xs font-bold text-cyan-200 shadow-[0_6px_18px_rgba(34,211,238,0.22)]">
            02
          </span>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-white">
              Visual Inspection Cockpit
            </h2>
            <p className="text-xs text-slate-400">
              Annotated plate bounding boxes &amp; verified Egyptian RTL readout
            </p>
          </div>
        </div>

        <span className="badge-cyan rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-wider">
          YOLO26m + EALPR-OCR
        </span>
      </div>

      {/* Controls Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="inline-flex rounded-xl border border-white/10 bg-[#05080e] p-1 text-xs">
          <button
            type="button"
            disabled={!scan}
            onClick={() => setTab("detection")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition disabled:opacity-40 ${
              tab === "detection"
                ? "badge-ember"
                : "text-slate-400 hover:text-white"
            }`}
          >
            AI Detection
          </button>
          <button
            type="button"
            disabled={!scan || !originalUrl}
            onClick={() => setTab("original")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition disabled:opacity-40 ${
              tab === "original"
                ? "badge-cyan"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Original Frame
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!hasImage}
            onClick={() => setZoomed((z) => !z)}
            title={zoomed ? "Zoom out" : "Zoom in"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] text-slate-300 transition hover:border-cyan-400/35 hover:text-white disabled:opacity-35"
          >
            {zoomed ? (
              <ZoomOut className="h-3.5 w-3.5" />
            ) : (
              <ZoomIn className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            disabled={!hasImage}
            onClick={() => void handleCopyImage()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/35 hover:text-white disabled:opacity-35"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </button>

          <button
            type="button"
            disabled={!hasImage}
            onClick={() =>
              activeUrl &&
              void downloadFileFromUrl(
                activeUrl,
                `ealpr-scan-${scan?.scan_id ?? "result"}.jpg`
              )
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/35 hover:text-white disabled:opacity-35"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>

          <button
            type="button"
            disabled={!hasImage}
            onClick={() =>
              activeUrl &&
              onOpenFullscreen(
                activeUrl,
                `Scan #${scan?.scan_id} · ${scan?.filename || "Detection"}`
              )
            }
            title="Fullscreen"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] text-slate-300 transition hover:border-cyan-400/35 hover:text-white disabled:opacity-35"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Split Body: HUD Viewport (1.25fr) + Detected Plates Deck (0.75fr) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div
          id="analysis-image-container"
          className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#030508]"
        >
          {/* Subtle Cyan Corner HUD Reticles */}
          <span className="pointer-events-none absolute top-2.5 left-2.5 h-3 w-3 border-t-2 border-l-2 border-cyan-400/40" />
          <span className="pointer-events-none absolute top-2.5 right-2.5 h-3 w-3 border-t-2 border-r-2 border-cyan-400/40" />
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 h-3 w-3 border-b-2 border-l-2 border-cyan-400/40" />
          <span className="pointer-events-none absolute right-2.5 bottom-2.5 h-3 w-3 border-r-2 border-b-2 border-cyan-400/40" />

          {hasImage && activeUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeUrl}
                alt={`Scan #${scan?.scan_id}`}
                onClick={() =>
                  onOpenFullscreen(
                    activeUrl,
                    `Scan #${scan?.scan_id} · ${scan?.filename || "Detection"}`
                  )
                }
                className={`max-h-[420px] w-full cursor-zoom-in object-contain transition-transform duration-200 ${
                  zoomed ? "scale-150" : "scale-100"
                }`}
              />
            </>
          ) : (
            <p className="font-mono text-xs text-slate-500">
              AWAITING VEHICLE INPUT...
            </p>
          )}
        </div>

        {/* Detected Plates Sidebar */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#070a10]/80 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">Detected Plates</h3>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
              {scan?.plate_count ?? 0}{" "}
              {scan?.plate_count === 1 ? "FOUND" : "FOUND"}
            </span>
          </div>

          {scan && scan.plates.length > 0 ? (
            <div className="flex flex-col gap-3">
              {scan.plates.map((plate) => (
                <DetectedPlateRow
                  key={`${scan.scan_id}-${plate.plate_index}`}
                  plate={plate}
                  onCopyText={() =>
                    onNotify("Plate text copied to clipboard", "success")
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <ShieldAlert className="mb-2 h-6 w-6 text-slate-600" />
              <p className="text-xs text-slate-400">
                {scan ? "No license plates detected" : "No plates detected yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
