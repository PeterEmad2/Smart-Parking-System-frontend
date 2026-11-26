"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { ActiveParkingStrip } from "@/components/ActiveParkingStrip";
import { StepUploadCard } from "@/components/StepUploadCard";
import { StepResultsCard } from "@/components/StepResultsCard";
import { ParkingTicketCard } from "@/components/ParkingTicketCard";
import { PlateReportCard } from "@/components/PlateReportCard";
import { Footer } from "@/components/Footer";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ToastContainer, type ToastItem } from "@/components/ToastContainer";
import {
  ApiError,
  analyzeImage,
  checkoutParkingSession,
  getHealth,
  getScan,
  listParkingSessions,
  resolveImageUrl,
  updateParkingRates,
} from "@/lib/api";
import {
  DEFAULT_PARKING_RATES,
  DEMO_PRESETS,
  checkoutLocalParkingSession,
  computeLocalParkingSummary,
  formatDurationLabel,
  loadStoredMockScans,
  loadStoredParkingSessions,
  loadStoredRates,
  normalizeArabicPlate,
  processLocalParkingScan,
  saveStoredMockScans,
  saveStoredRates,
  type DemoPreset,
} from "@/lib/mockData";
import type {
  GateMode,
  ParkingRates,
  ParkingSessionRecord,
  ParkingSummary,
  ScanResponse,
} from "@/types/anpr";

export default function HomePage() {
  const defaultPreset = DEMO_PRESETS[0];

  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [forceDemoOffline, setForceDemoOffline] = useState<boolean>(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultPreset.originalUrl
  );
  const [filename, setFilename] = useState<string | null>(
    defaultPreset.filename
  );
  const [activeScan, setActiveScan] = useState<ScanResponse | null>(
    defaultPreset.scan
  );
  const [activeParkingEvent, setActiveParkingEvent] =
    useState<ParkingSessionRecord | null>(
      defaultPreset.scan.parking_events?.[0] ?? null
    );

  const [rates, setRates] = useState<ParkingRates>(DEFAULT_PARKING_RATES);
  const [sessions, setSessions] = useState<ParkingSessionRecord[]>([]);
  const [summary, setSummary] = useState<ParkingSummary>(() =>
    computeLocalParkingSummary([], DEFAULT_PARKING_RATES)
  );

  const [gateMode, setGateMode] = useState<GateMode>("auto");
  const [simulateMinutes, setSimulateMinutes] = useState<number>(0);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  const [plateConf, setPlateConf] = useState<number>(0.25);
  const [charConf, setCharConf] = useState<number>(0.1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lightbox, setLightbox] = useState<{
    url: string | null;
    title: string;
  }>({ url: null, title: "" });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const blobUrlRef = useRef<string | null>(null);
  const workspaceRef = useRef<HTMLElement | null>(null);

  const addToast = useCallback(
    (message: string, tone: ToastItem["tone"] = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3600);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const syncLocalParkingState = useCallback((customRates?: ParkingRates) => {
    const activeRates = customRates ?? loadStoredRates();
    const storedSessions = loadStoredParkingSessions();
    setRates(activeRates);
    setSessions(storedSessions);
    setSummary(computeLocalParkingSummary(storedSessions, activeRates));
  }, []);

  const refreshParkingState = useCallback(
    async (preferDemo = false) => {
      if (preferDemo) {
        syncLocalParkingState();
        return;
      }
      try {
        const res = await listParkingSessions({ limit: 50, status: "all" });
        setSessions(res.sessions);
        setSummary(res.summary);
        setRates(res.summary.rates);
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
        syncLocalParkingState();
      }
    },
    [syncLocalParkingState]
  );

  const revokeActiveBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const handleSelectFile = useCallback(
    (file: File) => {
      revokeActiveBlob();
      const objectUrl = URL.createObjectURL(file);
      blobUrlRef.current = objectUrl;
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setFilename(file.name);
      setActiveScan(null);
      setActiveParkingEvent(null);
      setError(null);
    },
    [revokeActiveBlob]
  );

  const handleSelectPreset = useCallback(
    (preset: DemoPreset) => {
      revokeActiveBlob();
      setSelectedFile(null);
      setPreviewUrl(preset.originalUrl);
      setFilename(preset.filename);
      setActiveScan(preset.scan);
      const norm = normalizeArabicPlate(preset.scan.plates[0]?.text || "");
      const matchingOpen = sessions.find(
        (s) => s.plate_normalized === norm && s.status === "parked"
      );
      setActiveParkingEvent(
        matchingOpen || preset.scan.parking_events?.[0] || null
      );
      setError(null);
      addToast(`Loaded gate sample · ${preset.shortLabel}`, "info");
    },
    [addToast, revokeActiveBlob, sessions]
  );

  const handleClear = useCallback(() => {
    revokeActiveBlob();
    setSelectedFile(null);
    setPreviewUrl(null);
    setFilename(null);
    setActiveScan(null);
    setActiveParkingEvent(null);
    setError(null);
  }, [revokeActiveBlob]);

  useEffect(() => {
    let cancelled = false;

    getHealth()
      .then((health) => {
        if (!cancelled) {
          setBackendOnline(health.status === "ok" && health.model_loaded);
        }
      })
      .catch(() => {
        if (!cancelled) setBackendOnline(false);
      });

    listParkingSessions({ limit: 50, status: "all" })
      .then((res) => {
        if (cancelled) return;
        setSessions(res.sessions);
        setSummary(res.summary);
        setRates(res.summary.rates);
        const defNorm = normalizeArabicPlate(
          defaultPreset.scan.plates[0]?.text || ""
        );
        const liveMatch = res.sessions.find(
          (s) => s.plate_normalized === defNorm
        );
        if (liveMatch) setActiveParkingEvent(liveMatch);
      })
      .catch(() => {
        if (cancelled) return;
        const localRates = loadStoredRates();
        const localSessions = loadStoredParkingSessions();
        setRates(localRates);
        setSessions(localSessions);
        setSummary(computeLocalParkingSummary(localSessions, localRates));
        const defNorm = normalizeArabicPlate(
          defaultPreset.scan.plates[0]?.text || ""
        );
        const localMatch = localSessions.find(
          (s) => s.plate_normalized === defNorm
        );
        if (localMatch) setActiveParkingEvent(localMatch);
      });

    const scanParam = new URLSearchParams(window.location.search).get("scan");
    const requestedId = scanParam ? Number.parseInt(scanParam, 10) : NaN;
    if (Number.isFinite(requestedId) && requestedId > 0) {
      getScan(requestedId)
        .then((loaded) => {
          if (cancelled) return;
          const matchingPreset = DEMO_PRESETS.find(
            (p) => p.filename === loaded.filename
          );
          setActiveScan(loaded);
          setActiveParkingEvent(loaded.parking_events?.[0] ?? null);
          setFilename(loaded.filename || `scan_${loaded.scan_id}.jpg`);
          setPreviewUrl(
            matchingPreset?.originalUrl ||
              resolveImageUrl(loaded.annotated_image_url)
          );
          setSelectedFile(null);
        })
        .catch(() => {
          if (cancelled) return;
          const localMatch = loadStoredMockScans().find(
            (s) => s.scan_id === requestedId
          );
          if (localMatch) {
            const matchingPreset = DEMO_PRESETS.find(
              (p) => p.filename === localMatch.filename
            );
            setActiveScan(localMatch);
            setActiveParkingEvent(localMatch.parking_events?.[0] ?? null);
            setFilename(localMatch.filename || `scan_${localMatch.scan_id}.jpg`);
            setPreviewUrl(
              matchingPreset?.originalUrl ||
                resolveImageUrl(localMatch.annotated_image_url)
            );
            setSelectedFile(null);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [defaultPreset.scan.plates]);

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const pasted = item.getAsFile();
          if (pasted) {
            handleSelectFile(pasted);
            addToast("Pasted gate image from clipboard", "info");
            break;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addToast, handleSelectFile]);

  useEffect(() => {
    return () => revokeActiveBlob();
  }, [revokeActiveBlob]);

  const handleRatesChange = useCallback(
    (carRate: number, motoRate: number) => {
      const nextRates: ParkingRates = {
        ...rates,
        car_rate_egp: carRate,
        motorcycle_rate_egp: motoRate,
      };
      setRates(nextRates);
      saveStoredRates(nextRates);
      setSummary((prev) => ({ ...prev, rates: nextRates }));

      if (backendOnline && !forceDemoOffline) {
        updateParkingRates(carRate, motoRate).catch(() => {});
      }
    },
    [backendOnline, forceDemoOffline, rates]
  );

  const handleCheckoutSession = useCallback(
    async (sessionId: number, simMins = 0) => {
      if (backendOnline && !forceDemoOffline) {
        try {
          const completed = await checkoutParkingSession(sessionId, simMins);
          setActiveParkingEvent(completed);
          await refreshParkingState(false);
          addToast(
            `EXIT CLEARED · ${completed.plate_text} · ${formatDurationLabel(
              completed.duration_minutes
            )} · ${completed.total_fee_egp.toFixed(2)} EGP`,
            "success"
          );
          return;
        } catch {
          // Fall back to local demo checkout if backend is offline
        }
      }

      const localCompleted = checkoutLocalParkingSession(sessionId, simMins);
      if (localCompleted) {
        setActiveParkingEvent(localCompleted);
        syncLocalParkingState();
        addToast(
          `EXIT CLEARED · ${localCompleted.plate_text} · ${formatDurationLabel(
            localCompleted.duration_minutes
          )} · ${localCompleted.total_fee_egp.toFixed(2)} EGP`,
          "success"
        );
      }
    },
    [addToast, backendOnline, forceDemoOffline, refreshParkingState, syncLocalParkingState]
  );

  async function runOfflineDemoFallback(targetFilename: string) {
    await new Promise((resolve) => setTimeout(resolve, 750));

    const storedScans = loadStoredMockScans();
    const nextScanId =
      storedScans.reduce((maxId, s) => Math.max(maxId, s.scan_id), 24) + 1;
    const nowIso = new Date().toISOString();

    const matchedPreset = DEMO_PRESETS.find(
      (p) => p.filename === targetFilename
    );

    const plates = matchedPreset
      ? matchedPreset.scan.plates
      : [
          /moto|bike|scooter/i.test(targetFilename)
            ? {
                plate_index: 1,
                vehicle_type: "motorcycle" as const,
                precision: 0.87,
                text: "ف أ ع ٣ ٦ ٢ ٤",
                characters: ["ف", "أ", "ع", "٣", "٦", "٢", "٤"],
                bbox: [324, 688, 406, 782],
                fallback_full_image: false,
                is_partial: false,
              }
            : {
                plate_index: 1,
                vehicle_type: "car" as const,
                precision: 0.91,
                text: "س ط ن ٦ ٢ ١ ٧",
                characters: ["س", "ط", "ن", "٦", "٢", "١", "٧"],
                bbox: [333, 372, 445, 430],
                fallback_full_image: false,
                is_partial: false,
              },
        ];

    const events = processLocalParkingScan({
      scanId: nextScanId,
      plates,
      scanTimeIso: nowIso,
      gateMode,
      simulateMinutes,
      rates,
    });

    const scanRecord: ScanResponse = {
      scan_id: nextScanId,
      filename: targetFilename,
      plate_count: plates.length,
      plates,
      annotated_image_url: matchedPreset
        ? matchedPreset.scan.annotated_image_url
        : previewUrl,
      created_at: nowIso,
      parking_events: events,
    };

    setActiveScan(scanRecord);
    const primaryEvent = events[0] ?? null;
    setActiveParkingEvent(primaryEvent);
    saveStoredMockScans([scanRecord, ...storedScans]);
    syncLocalParkingState();

    if (primaryEvent?.status === "completed") {
      addToast(
        `EXIT RECEIPT · ${primaryEvent.plate_text} · ${formatDurationLabel(
          primaryEvent.duration_minutes
        )} → ${primaryEvent.total_fee_egp.toFixed(2)} EGP`,
        "success"
      );
    } else if (primaryEvent) {
      addToast(
        `ENTRY TICKET OPENED · ${primaryEvent.plate_text} (${primaryEvent.hourly_rate_egp} EGP/h)`,
        "success"
      );
    } else {
      addToast("Scan complete (unreadable / partial plate)", "info");
    }
  }

  async function handleAnalyze() {
    if (!previewUrl || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);

    const activeName = filename || "vehicle_upload.jpg";

    if (forceDemoOffline) {
      await runOfflineDemoFallback(activeName);
      setIsAnalyzing(false);
      return;
    }

    try {
      let fileToUpload = selectedFile;
      if (!fileToUpload) {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        fileToUpload = new File([blob], activeName, {
          type: blob.type || "image/jpeg",
        });
      }

      const result = await analyzeImage(fileToUpload, {
        plateConf,
        charConf,
        gateMode,
        simulateMinutes,
        carRateEgp: rates.car_rate_egp,
        motorcycleRateEgp: rates.motorcycle_rate_egp,
      });
      setBackendOnline(true);
      setActiveScan(result);
      const ev = result.parking_events?.[0] ?? null;
      setActiveParkingEvent(ev);
      await refreshParkingState(false);

      if (ev?.status === "completed") {
        addToast(
          `EXIT RECEIPT · ${ev.plate_text} · ${formatDurationLabel(
            ev.duration_minutes
          )} → ${ev.total_fee_egp.toFixed(2)} EGP`,
          "success"
        );
      } else if (ev) {
        addToast(
          `ENTRY TICKET OPENED · ${ev.plate_text} (${ev.hourly_rate_egp} EGP/h)`,
          "success"
        );
      } else {
        addToast(`Scan #${result.scan_id} complete`, "info");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 600) {
        setError(err.message);
        addToast(err.message, "danger");
      } else {
        setBackendOnline(false);
        await runOfflineDemoFallback(activeName);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  const activeParkedSessions = useMemo(
    () => sessions.filter((s) => s.status === "parked"),
    [sessions]
  );

  // Determine if scanning the currently previewed preset/plate will trigger an Exit checkout
  const willTriggerExit = useMemo(() => {
    if (gateMode === "exit") return true;
    if (gateMode === "entry") return false;
    const candidatePlate =
      activeScan?.plates[0]?.text ||
      DEMO_PRESETS.find((p) => p.filename === filename)?.scan.plates[0]?.text ||
      "";
    const norm = normalizeArabicPlate(candidatePlate);
    if (!norm) return false;
    return activeParkedSessions.some((s) => s.plate_normalized === norm);
  }, [activeParkedSessions, activeScan?.plates, filename, gateMode]);

  const systemOperational = backendOnline && !forceDemoOffline;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        systemOperational={systemOperational}
        activeParkedCount={summary.active_parked_count}
        onToggleDemoStatus={() => {
          setForceDemoOffline((prev) => {
            const next = !prev;
            if (next) {
              syncLocalParkingState();
            } else {
              void refreshParkingState(false);
            }
            addToast(
              next
                ? "Switched to interactive local parking demo"
                : "Live FastAPI Smart Parking enabled",
              "info"
            );
            return next;
          });
        }}
      />

      <main className="mx-auto w-full max-w-[1450px] flex-1 px-4 pb-8 sm:px-6">
        <HeroBanner
          rates={rates}
          onStartScan={() =>
            workspaceRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        />

        {/* Live Smart Parking Occupancy, Revenue & Active Garage Vehicles */}
        <ActiveParkingStrip
          summary={summary}
          activeSessions={activeParkedSessions}
          onCheckoutSession={(id, simMins) =>
            void handleCheckoutSession(id, simMins)
          }
          onSelectSessionPlate={(sess) => {
            setActiveParkingEvent(sess);
            const matchPreset = DEMO_PRESETS.find(
              (p) =>
                normalizeArabicPlate(p.scan.plates[0]?.text || "") ===
                sess.plate_normalized
            );
            if (matchPreset) {
              setPreviewUrl(matchPreset.originalUrl);
              setFilename(matchPreset.filename);
              setActiveScan(matchPreset.scan);
              setSelectedFile(null);
            }
            workspaceRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
          onOpenTariffSettings={() => {
            setShowSettingsDrawer(true);
            workspaceRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        />

        {/* 2-Column Smart Parking Gate Workspace */}
        <section
          ref={workspaceRef}
          id="scanner-workspace"
          className="mt-6 scroll-mt-24 grid grid-cols-1 items-start gap-5 xl:grid-cols-[0.72fr_1.28fr]"
        >
          <StepUploadCard
            previewUrl={previewUrl}
            filename={filename}
            isAnalyzing={isAnalyzing}
            plateConf={plateConf}
            charConf={charConf}
            gateMode={gateMode}
            simulateMinutes={simulateMinutes}
            rates={rates}
            willTriggerExit={willTriggerExit}
            showSettingsExternal={showSettingsDrawer}
            onToggleSettingsExternal={() => setShowSettingsDrawer((p) => !p)}
            error={error}
            onDismissError={() => setError(null)}
            onPlateConfChange={setPlateConf}
            onCharConfChange={setCharConf}
            onGateModeChange={setGateMode}
            onSimulateMinutesChange={setSimulateMinutes}
            onRatesChange={handleRatesChange}
            onSelectFile={handleSelectFile}
            onSelectPreset={handleSelectPreset}
            onClear={handleClear}
            onAnalyze={() => void handleAnalyze()}
          />

          <div className="flex flex-col gap-5">
            {/* Smart Parking Entry Ticket / Exit Fee Receipt */}
            <ParkingTicketCard
              event={activeParkingEvent}
              onCheckoutSession={(id, simMins) =>
                void handleCheckoutSession(id, simMins)
              }
              onNotify={addToast}
            />

            <StepResultsCard
              scan={activeScan}
              originalUrl={previewUrl}
              onOpenFullscreen={(url, title) => setLightbox({ url, title })}
              onNotify={addToast}
            />

            <PlateReportCard scan={activeScan} onNotify={addToast} />
          </div>
        </section>
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
