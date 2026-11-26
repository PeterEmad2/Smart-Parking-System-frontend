"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bike,
  Camera,
  CarFront,
  CheckCircle2,
  Clock,
  LogOut,
  ParkingSquare,
  Receipt,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ToastContainer, type ToastItem } from "@/components/ToastContainer";
import {
  checkoutParkingSession,
  deleteParkingSession,
  deleteScan,
  getHealth,
  listParkingSessions,
  listScans,
  resolveImageUrl,
} from "@/lib/api";
import {
  DEFAULT_PARKING_RATES,
  INITIAL_MOCK_PARKING_SESSIONS,
  INITIAL_MOCK_SCANS,
  checkoutLocalParkingSession,
  computeLocalParkingSummary,
  formatDurationLabel,
  loadStoredMockScans,
  loadStoredParkingSessions,
  loadStoredRates,
  normalizeArabicPlate,
  saveStoredMockScans,
  saveStoredParkingSessions,
} from "@/lib/mockData";
import type {
  ParkingSessionRecord,
  ParkingStatus,
  ParkingSummary,
  ScanResponse,
  VehicleType,
} from "@/types/anpr";

function formatScanTimestamp(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Cairo",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function HistoryPage() {
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [usingDemoSource, setUsingDemoSource] = useState<boolean>(false);

  const [ledgerTab, setLedgerTab] = useState<"sessions" | "scans">("sessions");
  const [statusFilter, setStatusFilter] = useState<"all" | ParkingStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | "all">("all");

  const [sessions, setSessions] = useState<ParkingSessionRecord[]>([]);
  const [summary, setSummary] = useState<ParkingSummary>(() =>
    computeLocalParkingSummary([], DEFAULT_PARKING_RATES)
  );
  const [scans, setScans] = useState<ScanResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [lightbox, setLightbox] = useState<{
    url: string | null;
    title: string;
  }>({ url: null, title: "" });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, tone: ToastItem["tone"] = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const filterLocalSessions = useCallback(
    (
      source: ParkingSessionRecord[],
      query: string,
      vType: VehicleType | "all",
      st: "all" | ParkingStatus
    ) => {
      const qNorm = normalizeArabicPlate(query);
      return source.filter((s) => {
        if (st !== "all" && s.status !== st) return false;
        if (vType !== "all" && s.vehicle_type !== vType) return false;
        if (!qNorm) return true;
        return (
          s.plate_text.includes(query.trim()) ||
          s.plate_normalized.includes(qNorm) ||
          `#pk-${s.session_id}`.includes(query.trim().toLowerCase())
        );
      });
    },
    []
  );

  const filterLocalScans = useCallback(
    (source: ScanResponse[], query: string, vType: VehicleType | "all") => {
      const qNorm = normalizeArabicPlate(query);
      return source.filter((scan) => {
        const matchesType =
          vType === "all" ||
          scan.plates.some((p) => p.vehicle_type === vType);
        if (!matchesType) return false;
        if (!qNorm) return true;
        const matchesPlate = scan.plates.some(
          (p) =>
            p.text.includes(query.trim()) ||
            normalizeArabicPlate(p.text).includes(qNorm)
        );
        const matchesFile = (scan.filename || "")
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesPlate || matchesFile || `#${scan.scan_id}` === query.trim();
      });
    },
    []
  );

  const loadData = useCallback(() => {
    let cancelled = false;

    getHealth()
      .then((h) => {
        if (!cancelled) setBackendOnline(h.status === "ok" && h.model_loaded);
      })
      .catch(() => {
        if (!cancelled) setBackendOnline(false);
      });

    Promise.all([
      listParkingSessions({
        limit: 80,
        status: statusFilter,
        plate: searchQuery,
        vehicleType: vehicleFilter,
      }),
      listScans({
        limit: 50,
        plate: searchQuery,
        vehicleType: vehicleFilter,
      }),
    ])
      .then(([sessRes, scansRes]) => {
        if (cancelled) return;
        setSessions(sessRes.sessions);
        setSummary(sessRes.summary);
        setScans(scansRes.scans);
        setUsingDemoSource(false);
        setBackendOnline(true);
      })
      .catch(() => {
        if (cancelled) return;
        const rates = loadStoredRates();
        const allLocalSess = loadStoredParkingSessions();
        const allLocalScans = loadStoredMockScans();
        setSummary(computeLocalParkingSummary(allLocalSess, rates));
        setSessions(
          filterLocalSessions(
            allLocalSess,
            searchQuery,
            vehicleFilter,
            statusFilter
          )
        );
        setScans(filterLocalScans(allLocalScans, searchQuery, vehicleFilter));
        setUsingDemoSource(true);
        setBackendOnline(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    filterLocalScans,
    filterLocalSessions,
    searchQuery,
    statusFilter,
    vehicleFilter,
  ]);

  useEffect(() => {
    return loadData();
  }, [loadData]);

  async function handleCheckout(sessionId: number, simMins = 0) {
    if (!usingDemoSource) {
      try {
        const out = await checkoutParkingSession(sessionId, simMins);
        addToast(
          `Checked out ${out.plate_text} · ${out.total_fee_egp.toFixed(2)} EGP`,
          "success"
        );
        loadData();
        return;
      } catch {
        // Fallback to local
      }
    }

    const out = checkoutLocalParkingSession(sessionId, simMins);
    if (out) {
      addToast(
        `Checked out ${out.plate_text} · ${out.total_fee_egp.toFixed(2)} EGP`,
        "success"
      );
      loadData();
    }
  }

  async function handleDeleteSession(sessionId: number) {
    if (!usingDemoSource) {
      try {
        await deleteParkingSession(sessionId);
        setConfirmDeleteId(null);
        addToast(`Deleted session #PK-${sessionId}`, "info");
        loadData();
        return;
      } catch {
        // Fallback
      }
    }
    const updated = loadStoredParkingSessions().filter(
      (s) => s.session_id !== sessionId
    );
    saveStoredParkingSessions(updated);
    setConfirmDeleteId(null);
    addToast(`Removed session #PK-${sessionId}`, "info");
    loadData();
  }

  async function handleDeleteScan(scanId: number) {
    if (!usingDemoSource) {
      try {
        await deleteScan(scanId);
        setConfirmDeleteId(null);
        addToast(`Deleted scan #${scanId}`, "info");
        loadData();
        return;
      } catch {
        // Fallback
      }
    }
    const updated = loadStoredMockScans().filter((s) => s.scan_id !== scanId);
    saveStoredMockScans(updated);
    setConfirmDeleteId(null);
    addToast(`Removed scan #${scanId}`, "info");
    loadData();
  }

  function handleRestoreDemoData() {
    saveStoredParkingSessions(INITIAL_MOCK_PARKING_SESSIONS);
    saveStoredMockScans(INITIAL_MOCK_SCANS);
    loadData();
    addToast("Restored sample Smart Parking sessions & scans", "success");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        systemOperational={backendOnline}
        activeParkedCount={summary.active_parked_count}
      />

      <main className="mx-auto w-full max-w-[1260px] flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Gate Cockpit</span>
        </Link>

        {/* Header Banner */}
        <div className="cockpit-card relative mt-5 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400/60 via-white/15 to-[#ff4b33]/60" />
          <div className="pointer-events-none absolute -top-16 -right-12 h-52 w-72 rounded-full bg-[#ff4b33]/15 blur-[85px]" />

          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="badge-cyan inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em]">
                <Receipt className="h-3 w-3" />
                <span>SMART PARKING LEDGER &amp; ANPR ARCHIVE</span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Parking Sessions &amp; Billing History
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300/75">
                Track active vehicles inside the garage, Entry → Exit stay
                durations, EGP revenue, and raw camera captures.
              </p>
            </div>

            {usingDemoSource && (
              <button
                type="button"
                onClick={handleRestoreDemoData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] px-3.5 py-2 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/45 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Ledger</span>
              </button>
            )}
          </div>

          {/* 4 Summary Metrics */}
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#05080f]/80 p-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span>PARKED NOW</span>
                <ParkingSquare className="h-3.5 w-3.5 text-cyan-300" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-white">
                {summary.active_parked_count}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#05080f]/80 p-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span>COMPLETED EXITS</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#34d399]" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-white">
                {summary.completed_count}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#05080f]/80 p-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span>COLLECTED REVENUE</span>
                <Banknote className="h-3.5 w-3.5 text-[#ff7b61]" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-white">
                {summary.total_revenue_egp.toFixed(2)}{" "}
                <span className="font-mono text-xs text-[#ff8b73]">EGP</span>
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#05080f]/80 p-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span>RATES (1H MIN)</span>
                <Clock className="h-3.5 w-3.5 text-amber-300" />
              </div>
              <p className="mt-2 font-mono text-xs font-bold text-white">
                Car {summary.rates.car_rate_egp} · Moto{" "}
                {summary.rates.motorcycle_rate_egp} EGP/h
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher + Search & Filters */}
        <div className="cockpit-card mt-5 flex flex-col gap-3 rounded-2xl p-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Primary Ledger Switcher */}
          <div className="inline-flex rounded-xl border border-white/10 bg-[#04060a] p-1 text-xs">
            <button
              type="button"
              onClick={() => setLedgerTab("sessions")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition ${
                ledgerTab === "sessions"
                  ? "badge-ember"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Parking Sessions ({sessions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setLedgerTab("scans")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition ${
                ledgerTab === "scans"
                  ? "badge-cyan"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Raw Scans ({scans.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-cyan-300/70" />
            <input
              type="text"
              dir="auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Arabic plate (e.g. س ط ن or ٣٦٢٤)..."
              className="h-10 w-full rounded-xl border border-white/10 bg-[#04060a] pr-9 pl-10 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status & Vehicle Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {ledgerTab === "sessions" && (
              <div className="inline-flex rounded-xl border border-white/10 bg-[#04060a] p-1 text-xs">
                {(
                  [
                    { value: "all", label: "All" },
                    { value: "parked", label: "Parked" },
                    { value: "completed", label: "Completed" },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setStatusFilter(st.value)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      statusFilter === st.value
                        ? "badge-cyan"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}

            <div className="inline-flex rounded-xl border border-white/10 bg-[#04060a] p-1 text-xs">
              {(
                [
                  { value: "all", label: "All Types" },
                  { value: "car", label: "Cars" },
                  { value: "motorcycle", label: "Motos" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setVehicleFilter(tab.value)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                    vehicleFilter === tab.value
                      ? "badge-ember"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="cockpit-card h-44 animate-pulse rounded-2xl p-5"
              />
            ))}
          </div>
        ) : ledgerTab === "sessions" ? (
          sessions.length === 0 ? (
            <div className="cockpit-card mt-6 flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff5b45]/35 bg-gradient-to-br from-[#ff4b33]/20 to-cyan-400/10 text-[#ff7847]">
                <ParkingSquare className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-white">
                No parking sessions found.
              </h2>
              <p className="mt-1.5 max-w-md text-xs text-slate-400 sm:text-sm">
                Scan a vehicle at the Gate Cockpit to automatically start a
                parking stay and calculate EGP billing on exit.
              </p>
              <Link
                href="/"
                className="btn-ember mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold"
              >
                <span>Open Gate Scanner</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {sessions.map((sess) => {
                const isParked = sess.status === "parked";
                const isMoto = sess.vehicle_type === "motorcycle";
                const VIcon = isMoto ? Bike : CarFront;
                const delKey = `sess-${sess.session_id}`;

                return (
                  <article
                    key={sess.session_id}
                    className="cockpit-card flex flex-col justify-between gap-4 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="overflow-hidden rounded-lg border border-slate-900 bg-white">
                          <div
                            className={`flex items-center justify-between gap-2 px-2 py-0.5 text-[8px] font-extrabold text-white ${
                              isMoto ? "bg-[#d97706]" : "bg-[#1d4ed8]"
                            }`}
                          >
                            <span>EGYPT</span>
                            <span className="font-arabic">مصر</span>
                          </div>
                          <div
                            dir="rtl"
                            className="px-3 py-1 font-arabic text-base font-extrabold text-slate-950"
                          >
                            {sess.plate_text}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              #PK-{sess.session_id}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                isParked
                                  ? "border border-emerald-400/35 bg-emerald-400/12 text-[#34d399]"
                                  : "border border-amber-400/35 bg-amber-400/12 text-amber-300"
                              }`}
                            >
                              {isParked ? "Parked Now" : "Completed"}
                            </span>
                          </div>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                            <VIcon className="h-3.5 w-3.5 text-cyan-300" />
                            <span>
                              {isMoto ? "Motorcycle" : "Car"} ·{" "}
                              {sess.hourly_rate_egp} EGP/hr
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-extrabold text-white">
                          {sess.total_fee_egp.toFixed(2)}{" "}
                          <span className="font-mono text-xs text-[#ff8b73]">
                            EGP
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-cyan-300">
                          {formatDurationLabel(sess.duration_minutes)} (
                          {sess.billable_hours.toFixed(1)}h)
                        </div>
                      </div>
                    </div>

                    {/* Entry -> Exit Timestamps */}
                    <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-white/[0.08] bg-[#04060a] p-3 text-xs">
                      <div>
                        <span className="font-mono text-[10px] text-slate-400">
                          ENTRY
                        </span>
                        <p className="mt-0.5 font-mono text-[11px] font-semibold text-white">
                          {formatScanTimestamp(sess.entry_time)}
                        </p>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-slate-400">
                          EXIT
                        </span>
                        <p
                          className={`mt-0.5 font-mono text-[11px] font-semibold ${
                            isParked ? "text-[#34d399]" : "text-[#ff8b73]"
                          }`}
                        >
                          {isParked
                            ? "Active inside garage"
                            : formatScanTimestamp(sess.exit_time)}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
                      {isParked ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleCheckout(sess.session_id, 0)
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/20"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Checkout Now</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void handleCheckout(sess.session_id, 120)
                            }
                            className="btn-ember inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold"
                          >
                            <span>+2h Exit</span>
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={
                            sess.exit_scan_id
                              ? `/?scan=${sess.exit_scan_id}`
                              : sess.entry_scan_id
                                ? `/?scan=${sess.entry_scan_id}`
                                : "/"
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 transition hover:text-white"
                        >
                          <span>View Gate Scan</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}

                      {confirmDeleteId === delKey ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteSession(sess.session_id)
                            }
                            className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/30"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(delKey)}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : (
          /* Raw Camera Scans Grid */
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {scans.map((scan) => {
              const primary = scan.plates[0];
              const isMoto = primary?.vehicle_type === "motorcycle";
              const VehicleIcon = isMoto ? Bike : CarFront;
              const imgUrl = resolveImageUrl(scan.annotated_image_url);
              const pct = primary ? Math.round(primary.precision * 100) : 0;
              const delKey = `scan-${scan.scan_id}`;

              return (
                <article
                  key={scan.scan_id}
                  className="cockpit-card flex flex-col justify-between gap-4 rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#030508] sm:h-28 sm:w-40">
                      {imgUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={scan.filename || `Scan #${scan.scan_id}`}
                            onClick={() =>
                              setLightbox({
                                url: imgUrl,
                                title: `Scan #${scan.scan_id} · ${
                                  scan.filename || "Detection"
                                }`,
                              })
                            }
                            className="h-full w-full cursor-zoom-in object-cover transition duration-200 hover:scale-105"
                          />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
                          No preview
                        </div>
                      )}
                      <span className="absolute top-2 left-2 rounded-md border border-cyan-400/30 bg-[#05080f]/85 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-200 backdrop-blur">
                        #{scan.scan_id}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {scan.filename || `scan_${scan.scan_id}.jpg`}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                            {formatScanTimestamp(scan.created_at)}
                          </p>
                        </div>

                        {primary && (
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isMoto ? "badge-ember" : "badge-cyan"
                            }`}
                          >
                            <VehicleIcon className="h-3 w-3" />
                            <span>{isMoto ? "Motorcycle" : "Car"}</span>
                          </span>
                        )}
                      </div>

                      {primary ? (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#04060a] px-3 py-2">
                          <span
                            dir="rtl"
                            className="font-arabic text-base font-extrabold text-white"
                          >
                            {primary.text || "—"}
                          </span>
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            {pct}%
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-[#04060a] px-3 py-2 text-xs text-slate-400">
                          No license plate detected
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.07] pt-3">
                    <Link
                      href={`/?scan=${scan.scan_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff7b61] transition hover:text-cyan-300"
                    >
                      <span>Open in Gate Cockpit</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {confirmDeleteId === delKey ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleDeleteScan(scan.scan_id)}
                          className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-300"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(delKey)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <ImageLightbox
        url={lightbox.url}
        title={lightbox.title}
        onClose={() => setLightbox({ url: null, title: "" })}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
