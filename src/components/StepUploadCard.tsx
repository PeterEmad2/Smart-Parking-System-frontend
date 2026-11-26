"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bike,
  CarFront,
  Clock,
  ImageIcon,
  Loader2,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { DEMO_PRESETS, type DemoPreset } from "@/lib/mockData";
import type { GateMode, ParkingRates } from "@/types/anpr";

interface StepUploadCardProps {
  previewUrl: string | null;
  filename: string | null;
  isAnalyzing: boolean;
  plateConf: number;
  charConf: number;
  gateMode: GateMode;
  simulateMinutes: number;
  rates: ParkingRates;
  willTriggerExit?: boolean;
  showSettingsExternal?: boolean;
  onToggleSettingsExternal?: () => void;
  error: string | null;
  onDismissError: () => void;
  onPlateConfChange: (val: number) => void;
  onCharConfChange: (val: number) => void;
  onGateModeChange: (mode: GateMode) => void;
  onSimulateMinutesChange: (mins: number) => void;
  onRatesChange: (carRate: number, motoRate: number) => void;
  onSelectFile: (file: File) => void;
  onSelectPreset: (preset: DemoPreset) => void;
  onClear: () => void;
  onAnalyze: () => void;
}

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
]);

const TIME_SKIP_OPTIONS = [
  { label: "Real-Time", minutes: 0 },
  { label: "+1 hr", minutes: 60 },
  { label: "+2.5 hrs", minutes: 150 },
  { label: "+4 hrs", minutes: 240 },
];

export function StepUploadCard({
  previewUrl,
  filename,
  isAnalyzing,
  plateConf,
  charConf,
  gateMode,
  simulateMinutes,
  rates,
  willTriggerExit = false,
  showSettingsExternal,
  onToggleSettingsExternal,
  error,
  onDismissError,
  onPlateConfChange,
  onCharConfChange,
  onGateModeChange,
  onSimulateMinutesChange,
  onRatesChange,
  onSelectFile,
  onSelectPreset,
  onClear,
  onAnalyze,
}: StepUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localShowSettings, setLocalShowSettings] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const showSettings =
    showSettingsExternal !== undefined ? showSettingsExternal : localShowSettings;

  function toggleSettings() {
    if (onToggleSettingsExternal) {
      onToggleSettingsExternal();
    } else {
      setLocalShowSettings((p) => !p);
    }
  }

  function validateAndPick(file: File) {
    setLocalError(null);
    onDismissError();
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      setLocalError("Unsupported format. Upload PNG, JPG, WEBP, or BMP.");
      return;
    }
    if (file.size === 0) {
      setLocalError("Uploaded file is empty.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError("File exceeds the 15 MB limit.");
      return;
    }
    onSelectFile(file);
  }

  const activeError = localError || error;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="cockpit-card overflow-hidden rounded-2xl p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#ff4b33]/70 via-[#ff7847]/35 to-transparent" />

        {/* Step 01 Header */}
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#ff7847]/45 bg-gradient-to-br from-[#ff4b33] to-[#ff7847] font-mono text-xs font-bold text-white shadow-[0_6px_18px_rgba(255,75,51,0.4)]">
              01
            </span>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-white">
                Smart Gate Camera
              </h2>
              <p className="text-xs text-slate-400">
                1st scan = Entry · 2nd same-plate scan = Exit &amp; EGP bill
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSettings}
            title="Tariff & confidence settings"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] font-semibold transition ${
              showSettings
                ? "badge-cyan"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Tariff</span>
          </button>
        </div>

        {/* Gate Mode Selector (Auto / Entry / Exit) */}
        <div className="mb-3 rounded-xl border border-white/10 bg-[#04060a]/90 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Gate Mode
            </span>
            <span className="font-mono text-[10px] text-cyan-300">
              {gateMode === "auto"
                ? "Auto Toggle by Plate"
                : gateMode === "entry"
                  ? "Force Check-In"
                  : "Force Checkout"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {(
              [
                { id: "auto", label: "Auto Gate", icon: Sparkles },
                { id: "entry", label: "Entry Only", icon: LogIn },
                { id: "exit", label: "Exit Only", icon: LogOut },
              ] as const
            ).map((m) => {
              const MIcon = m.icon;
              const active = gateMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onGateModeChange(m.id)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? "badge-ember"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                  }`}
                >
                  <MIcon className="h-3 w-3" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Demo Time-Skip Strip (for testing Exit duration & price instantly) */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-2">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <Clock className="h-3 w-3 text-cyan-300" />
              <span>Demo Stay Offset:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {TIME_SKIP_OPTIONS.map((opt) => {
                const active = simulateMinutes === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => onSimulateMinutesChange(opt.minutes)}
                    className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold transition ${
                      active
                        ? "badge-cyan"
                        : "border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editable EGP Tariff & Confidence Settings Drawer */}
        {showSettings && (
          <div className="mb-4 space-y-3 rounded-xl border border-cyan-400/25 bg-cyan-950/20 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                EGP Hourly Tariff &amp; Thresholds
              </span>
              <button
                type="button"
                onClick={() => {
                  onRatesChange(25, 10);
                  onPlateConfChange(0.25);
                  onCharConfChange(0.1);
                }}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block rounded-lg border border-white/10 bg-[#04060a] p-2.5">
                <span className="block text-[11px] text-slate-400">
                  Car Rate (EGP/hr)
                </span>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  step={5}
                  value={rates.car_rate_egp}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value);
                    if (Number.isFinite(v) && v > 0) {
                      onRatesChange(v, rates.motorcycle_rate_egp);
                    }
                  }}
                  className="mt-1 w-full bg-transparent font-mono text-sm font-bold text-white focus:outline-none"
                />
              </label>

              <label className="block rounded-lg border border-white/10 bg-[#04060a] p-2.5">
                <span className="block text-[11px] text-slate-400">
                  Motorcycle Rate (EGP/hr)
                </span>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  step={2}
                  value={rates.motorcycle_rate_egp}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value);
                    if (Number.isFinite(v) && v > 0) {
                      onRatesChange(rates.car_rate_egp, v);
                    }
                  }}
                  className="mt-1 w-full bg-transparent font-mono text-sm font-bold text-[#ff8b73] focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <div className="mb-1 flex justify-between">
                <span className="text-slate-300">Stage-1 Plate Confidence</span>
                <span className="font-mono text-cyan-300">
                  {plateConf.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.9}
                step={0.05}
                value={plateConf}
                onChange={(e) => onPlateConfChange(parseFloat(e.target.value))}
                className="w-full accent-[#22d3ee]"
              />
            </label>

            <label className="block">
              <div className="mb-1 flex justify-between">
                <span className="text-slate-300">
                  Stage-2 Character Confidence
                </span>
                <span className="font-mono text-[#ff8b73]">
                  {charConf.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.02}
                max={0.5}
                step={0.02}
                value={charConf}
                onChange={(e) => onCharConfChange(parseFloat(e.target.value))}
                className="w-full accent-[#ff5b45]"
              />
            </label>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) validateAndPick(f);
            e.target.value = "";
          }}
        />

        {/* Loaded Vehicle Preview vs Interactive Dropzone */}
        {previewUrl ? (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#04060a]">
            <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[#030508]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={filename || "Vehicle preview"}
                className={`max-h-[330px] w-full object-contain transition duration-300 ${
                  isAnalyzing ? "scale-[1.01] opacity-65" : "opacity-100"
                }`}
              />

              {isAnalyzing && (
                <div className="pointer-events-none absolute inset-0 z-10">
                  <div className="animate-cyan-scan absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-[#ff5b45] shadow-[0_0_20px_3px_rgba(34,211,238,0.75)]" />
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-[#060a12]/90 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-cyan-200 backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      <span>MATCHING PLATE &amp; PARKING SESSION...</span>
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClear}
                disabled={isAnalyzing}
                title="Clear image"
                className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white/80 backdrop-blur transition hover:border-[#ff5b45]/50 hover:bg-black hover:text-white disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] bg-white/[0.025] px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {filename || "vehicle-image.jpg"}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400">
                    {willTriggerExit
                      ? "MATCHES PARKED VEHICLE → NEXT SCAN CALCULATES EXIT FEE"
                      : "GATE CAMERA READY"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => inputRef.current?.click()}
                className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-cyan-400/35 hover:text-white disabled:opacity-40"
              >
                Replace
              </button>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) validateAndPick(dropped);
            }}
            className={`group flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-9 text-center transition ${
              isDragging
                ? "border-cyan-400 bg-cyan-400/[0.07]"
                : "border-white/15 bg-[#04060a]/70 hover:border-[#ff6b52]/50 hover:bg-white/[0.025]"
            }`}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff5b45]/35 bg-gradient-to-br from-[#ff4b33]/20 to-cyan-400/10 text-[#ff7847] shadow-[0_0_26px_-4px_rgba(255,75,51,0.35)] transition group-hover:scale-105">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-white">
              Upload Entry or Exit Gate Vehicle Photo
            </p>
            <p className="mt-1.5 text-xs text-slate-400">
              Scan once for Check-In · Scan same plate again for Checkout &amp;
              EGP Fee
            </p>
            <span className="btn-ember mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold">
              <span>Choose Gate Image</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}

        {/* Quick Interactive Sample Switcher Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
            Test Vehicles:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {DEMO_PRESETS.map((preset) => {
              const isMoto = preset.id !== "car";
              const PIcon = isMoto ? Bike : CarFront;
              const active = filename === preset.filename;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    setLocalError(null);
                    onDismissError();
                    onSelectPreset(preset);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "badge-ember shadow-[0_0_16px_-4px_rgba(255,75,51,0.45)]"
                      : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-cyan-400/30 hover:text-white"
                  }`}
                >
                  <PIcon className="h-3 w-3" />
                  <span>{preset.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeError && (
          <div className="mt-3 flex items-start justify-between gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <span>{activeError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                onDismissError();
              }}
              className="text-red-300/70 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Primary Contextual Gate CTA */}
      <button
        type="button"
        disabled={!previewUrl || isAnalyzing}
        onClick={onAnalyze}
        className="btn-ember flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Scanning Plate &amp; Computing Stay...</span>
          </>
        ) : willTriggerExit ? (
          <>
            <LogOut className="h-4 w-4" />
            <span>
              Scan Exit &amp; Calculate Fee
              {simulateMinutes > 0
                ? ` (+${(simulateMinutes / 60).toFixed(1)}h)`
                : ""}
            </span>
            <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>Scan Gate Plate (Entry / Exit)</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
