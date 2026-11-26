import type {
  GateMode,
  ParkingRates,
  ParkingSessionRecord,
  ParkingSummary,
  PlateDetection,
  ScanResponse,
} from "@/types/anpr";

export interface DemoPreset {
  id: "car" | "motorcycle";
  shortLabel: string;
  filename: string;
  originalUrl: string;
  scan: ScanResponse;
}

export const DEFAULT_PARKING_RATES: ParkingRates = {
  car_rate_egp: 25,
  motorcycle_rate_egp: 10,
  min_hours: 1,
  rounding_minutes: 30,
  currency: "EGP",
};

export function normalizeArabicPlate(text: string): string {
  return (text || "")
    .replace(/\s+/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[ھة]/g, "ه")
    .trim();
}

export function calculateParkingFee(
  durationMinutes: number,
  hourlyRateEgp: number
): { billableHours: number; totalFeeEgp: number } {
  const mins = Math.max(0, Math.floor(durationMinutes));
  const billableHours = mins <= 60 ? 1.0 : Math.ceil(mins / 30) * 0.5;
  const totalFeeEgp = Math.round(billableHours * hourlyRateEgp * 100) / 100;
  return { billableHours, totalFeeEgp };
}

export function formatDurationLabel(minutes: number): string {
  const mins = Math.max(0, Math.floor(minutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Deterministic static UTC timestamps so SSR and client initial render match 100%
const CAR_ENTRY_ISO = "2026-11-26T13:36:00.000Z";
const MOTO_ENTRY_ISO = "2026-11-26T14:14:00.000Z";
const COMP_CAR_ENTRY_ISO = "2026-11-26T10:30:00.000Z";
const COMP_CAR_EXIT_ISO = "2026-11-26T12:45:00.000Z";
const COMP_MOTO_ENTRY_ISO = "2026-11-26T09:10:00.000Z";
const COMP_MOTO_EXIT_ISO = "2026-11-26T10:50:00.000Z";
const EXTRA_MOTO_SCAN_ISO = "2026-11-26T11:20:00.000Z";

export const INITIAL_MOCK_PARKING_SESSIONS: ParkingSessionRecord[] = [
  {
    session_id: 104,
    event_type: "entry",
    status: "parked",
    plate_text: "س ط ن ٦ ٢ ١ ٧",
    plate_normalized: "سطن٦٢١٧",
    vehicle_type: "car",
    entry_scan_id: 24,
    exit_scan_id: null,
    entry_time: CAR_ENTRY_ISO,
    exit_time: null,
    duration_minutes: 82,
    billable_hours: 1.5,
    hourly_rate_egp: 25,
    total_fee_egp: 37.5,
  },
  {
    session_id: 103,
    event_type: "entry",
    status: "parked",
    plate_text: "ف أ ع ٣ ٦ ٢ ٤",
    plate_normalized: "فاع٣٦٢٤",
    vehicle_type: "motorcycle",
    entry_scan_id: 23,
    exit_scan_id: null,
    entry_time: MOTO_ENTRY_ISO,
    exit_time: null,
    duration_minutes: 44,
    billable_hours: 1.0,
    hourly_rate_egp: 10,
    total_fee_egp: 10.0,
  },
  {
    session_id: 102,
    event_type: "exit",
    status: "completed",
    plate_text: "ر و ق ٦ ٦ ٦ ٦",
    plate_normalized: "روق٦٦٦٦",
    vehicle_type: "car",
    entry_scan_id: 18,
    exit_scan_id: 21,
    entry_time: COMP_CAR_ENTRY_ISO,
    exit_time: COMP_CAR_EXIT_ISO,
    duration_minutes: 135,
    billable_hours: 2.5,
    hourly_rate_egp: 25,
    total_fee_egp: 62.5,
  },
  {
    session_id: 101,
    event_type: "exit",
    status: "completed",
    plate_text: "أ د ھ ٧ ٥ ٨ ٦",
    plate_normalized: "اده٧٥٨٦",
    vehicle_type: "motorcycle",
    entry_scan_id: 16,
    exit_scan_id: 19,
    entry_time: COMP_MOTO_ENTRY_ISO,
    exit_time: COMP_MOTO_EXIT_ISO,
    duration_minutes: 100,
    billable_hours: 2.0,
    hourly_rate_egp: 10,
    total_fee_egp: 20.0,
  },
];

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "car",
    shortLabel: "Car (س ط ن)",
    filename: "egypt_sedan_01.jpg",
    originalUrl: "/demos/car-orig.jpg",
    scan: {
      scan_id: 24,
      filename: "egypt_sedan_01.jpg",
      plate_count: 1,
      plates: [
        {
          plate_index: 1,
          vehicle_type: "car",
          precision: 0.91,
          text: "س ط ن ٦ ٢ ١ ٧",
          characters: ["س", "ط", "ن", "٦", "٢", "١", "٧"],
          bbox: [333, 372, 445, 430],
          fallback_full_image: false,
          is_partial: false,
        },
      ],
      annotated_image_url: "/demos/car-annotated.jpg",
      created_at: CAR_ENTRY_ISO,
      parking_events: [INITIAL_MOCK_PARKING_SESSIONS[0]],
    },
  },
  {
    id: "motorcycle",
    shortLabel: "2-Row Moto (ف أ ع)",
    filename: "cairo_moto_2row_04.jpg",
    originalUrl: "/demos/moto-orig.jpg",
    scan: {
      scan_id: 23,
      filename: "cairo_moto_2row_04.jpg",
      plate_count: 1,
      plates: [
        {
          plate_index: 1,
          vehicle_type: "motorcycle",
          precision: 0.86,
          text: "ف أ ع ٣ ٦ ٢ ٤",
          characters: ["ف", "أ", "ع", "٣", "٦", "٢", "٤"],
          bbox: [324, 688, 406, 782],
          fallback_full_image: false,
          is_partial: false,
        },
      ],
      annotated_image_url: "/demos/moto-annotated.jpg",
      created_at: MOTO_ENTRY_ISO,
      parking_events: [INITIAL_MOCK_PARKING_SESSIONS[1]],
    },
  },
];

export const INITIAL_MOCK_SCANS: ScanResponse[] = [
  DEMO_PRESETS[0].scan,
  DEMO_PRESETS[1].scan,
  {
    scan_id: 21,
    filename: "giza_coupe_gate2.jpg",
    plate_count: 1,
    plates: [
      {
        plate_index: 1,
        vehicle_type: "car",
        precision: 0.89,
        text: "ر و ق ٦ ٦ ٦ ٦",
        characters: ["ر", "و", "ق", "٦", "٦", "٦", "٦"],
        bbox: [51, 298, 194, 372],
        fallback_full_image: false,
        is_partial: false,
      },
    ],
    annotated_image_url: "/demos/car2-annotated.jpg",
    created_at: COMP_CAR_EXIT_ISO,
    parking_events: [INITIAL_MOCK_PARKING_SESSIONS[2]],
  },
  {
    scan_id: 20,
    filename: "alex_scooter_rear.jpg",
    plate_count: 1,
    plates: [
      {
        plate_index: 1,
        vehicle_type: "motorcycle",
        precision: 0.84,
        text: "أ ع ن ٦ ٤ ١ ٧",
        characters: ["أ", "ع", "ن", "٦", "٤", "١", "٧"],
        bbox: [328, 441, 421, 538],
        fallback_full_image: false,
        is_partial: false,
      },
    ],
    annotated_image_url: "/demos/moto2-annotated.jpg",
    created_at: EXTRA_MOTO_SCAN_ISO,
    parking_events: [],
  },
  {
    scan_id: 19,
    filename: "nasr_city_bike_hd.jpg",
    plate_count: 1,
    plates: [
      {
        plate_index: 1,
        vehicle_type: "motorcycle",
        precision: 0.88,
        text: "أ د ھ ٧ ٥ ٨ ٦",
        characters: ["أ", "د", "ھ", "٧", "٥", "٨", "٦"],
        bbox: [409, 376, 1164, 1171],
        fallback_full_image: false,
        is_partial: false,
      },
    ],
    annotated_image_url: "/demos/moto3-annotated.jpg",
    created_at: COMP_MOTO_EXIT_ISO,
    parking_events: [INITIAL_MOCK_PARKING_SESSIONS[3]],
  },
];

const SCANS_KEY = "ealpr_demo_scans_v3";
const SESSIONS_KEY = "ealpr_demo_parking_sessions_v2";
const RATES_KEY = "ealpr_demo_parking_rates_v1";

export function loadStoredRates(): ParkingRates {
  if (typeof window === "undefined") return DEFAULT_PARKING_RATES;
  try {
    const raw = window.localStorage.getItem(RATES_KEY);
    if (!raw) return DEFAULT_PARKING_RATES;
    const parsed = JSON.parse(raw) as Partial<ParkingRates>;
    return {
      ...DEFAULT_PARKING_RATES,
      car_rate_egp:
        typeof parsed.car_rate_egp === "number" && parsed.car_rate_egp > 0
          ? parsed.car_rate_egp
          : DEFAULT_PARKING_RATES.car_rate_egp,
      motorcycle_rate_egp:
        typeof parsed.motorcycle_rate_egp === "number" &&
        parsed.motorcycle_rate_egp > 0
          ? parsed.motorcycle_rate_egp
          : DEFAULT_PARKING_RATES.motorcycle_rate_egp,
    };
  } catch {
    return DEFAULT_PARKING_RATES;
  }
}

export function saveStoredRates(rates: ParkingRates): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RATES_KEY, JSON.stringify(rates));
  } catch {
    // Ignore storage errors
  }
}

export function refreshSessionLiveEstimate(
  session: ParkingSessionRecord
): ParkingSessionRecord {
  if (session.status !== "parked") return session;
  const elapsedMs = Math.max(0, Date.now() - Date.parse(session.entry_time));
  const durationMinutes = Math.floor(elapsedMs / 60000);
  const { billableHours, totalFeeEgp } = calculateParkingFee(
    durationMinutes,
    session.hourly_rate_egp
  );
  return {
    ...session,
    duration_minutes: durationMinutes,
    billable_hours: billableHours,
    total_fee_egp: totalFeeEgp,
  };
}

export function loadStoredParkingSessions(): ParkingSessionRecord[] {
  if (typeof window === "undefined") return INITIAL_MOCK_PARKING_SESSIONS;
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) return INITIAL_MOCK_PARKING_SESSIONS.map(refreshSessionLiveEstimate);
    const parsed = JSON.parse(raw) as ParkingSessionRecord[];
    if (!Array.isArray(parsed)) return INITIAL_MOCK_PARKING_SESSIONS;
    return parsed.map(refreshSessionLiveEstimate);
  } catch {
    return INITIAL_MOCK_PARKING_SESSIONS;
  }
}

export function saveStoredParkingSessions(
  sessions: ParkingSessionRecord[]
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore storage quota errors
  }
}

export function computeLocalParkingSummary(
  sessions: ParkingSessionRecord[],
  rates: ParkingRates
): ParkingSummary {
  let activeCars = 0;
  let activeMotos = 0;
  let completedCount = 0;
  let totalRevenue = 0;

  for (const s of sessions) {
    if (s.status === "parked") {
      if (s.vehicle_type === "motorcycle") activeMotos += 1;
      else activeCars += 1;
    } else {
      completedCount += 1;
      totalRevenue += s.total_fee_egp;
    }
  }

  return {
    active_parked_count: activeCars + activeMotos,
    active_cars: activeCars,
    active_motorcycles: activeMotos,
    completed_count: completedCount,
    total_revenue_egp: Math.round(totalRevenue * 100) / 100,
    rates,
  };
}

export function processLocalParkingScan(options: {
  scanId: number;
  plates: PlateDetection[];
  scanTimeIso: string;
  gateMode: GateMode;
  simulateMinutes: number;
  rates: ParkingRates;
}): ParkingSessionRecord[] {
  const sessions = loadStoredParkingSessions();
  const events: ParkingSessionRecord[] = [];
  let maxId = sessions.reduce((m, s) => Math.max(m, s.session_id), 104);

  for (const p of options.plates) {
    const norm = normalizeArabicPlate(p.text);
    if (!norm) continue;

    const vType = p.vehicle_type === "motorcycle" ? "motorcycle" : "car";
    const rate =
      vType === "motorcycle"
        ? options.rates.motorcycle_rate_egp
        : options.rates.car_rate_egp;

    const openIdx = sessions.findIndex(
      (s) => s.plate_normalized === norm && s.status === "parked"
    );

    const shouldCheckout =
      (options.gateMode === "auto" && openIdx !== -1) ||
      options.gateMode === "exit";

    if (shouldCheckout && openIdx !== -1) {
      const existing = sessions[openIdx];
      const entryMs = Date.parse(existing.entry_time);
      const exitMs =
        Math.max(entryMs, Date.parse(options.scanTimeIso)) +
        Math.max(0, options.simulateMinutes) * 60000;
      const durationMinutes = Math.max(
        0,
        Math.floor((exitMs - entryMs) / 60000)
      );
      const { billableHours, totalFeeEgp } = calculateParkingFee(
        durationMinutes,
        existing.hourly_rate_egp || rate
      );

      const completed: ParkingSessionRecord = {
        ...existing,
        event_type: "exit",
        status: "completed",
        exit_scan_id: options.scanId,
        exit_time: new Date(exitMs).toISOString(),
        duration_minutes: durationMinutes,
        billable_hours: billableHours,
        total_fee_egp: totalFeeEgp,
      };
      sessions[openIdx] = completed;
      events.push(completed);
    } else if (options.gateMode === "exit" && openIdx === -1) {
      maxId += 1;
      const durationMinutes = Math.max(60, options.simulateMinutes || 60);
      const exitMs = Date.parse(options.scanTimeIso);
      const entryMs = exitMs - durationMinutes * 60000;
      const { billableHours, totalFeeEgp } = calculateParkingFee(
        durationMinutes,
        rate
      );
      const directExit: ParkingSessionRecord = {
        session_id: maxId,
        event_type: "exit",
        status: "completed",
        plate_text: p.text,
        plate_normalized: norm,
        vehicle_type: vType,
        entry_scan_id: options.scanId,
        exit_scan_id: options.scanId,
        entry_time: new Date(entryMs).toISOString(),
        exit_time: new Date(exitMs).toISOString(),
        duration_minutes: durationMinutes,
        billable_hours: billableHours,
        hourly_rate_egp: rate,
        total_fee_egp: totalFeeEgp,
      };
      sessions.unshift(directExit);
      events.push(directExit);
    } else {
      if (openIdx !== -1 && options.gateMode === "entry") {
        events.push(refreshSessionLiveEstimate(sessions[openIdx]));
        continue;
      }
      maxId += 1;
      const { billableHours, totalFeeEgp } = calculateParkingFee(0, rate);
      const created: ParkingSessionRecord = {
        session_id: maxId,
        event_type: "entry",
        status: "parked",
        plate_text: p.text,
        plate_normalized: norm,
        vehicle_type: vType,
        entry_scan_id: options.scanId,
        exit_scan_id: null,
        entry_time: options.scanTimeIso,
        exit_time: null,
        duration_minutes: 0,
        billable_hours: billableHours,
        hourly_rate_egp: rate,
        total_fee_egp: totalFeeEgp,
      };
      sessions.unshift(created);
      events.push(created);
    }
  }

  saveStoredParkingSessions(sessions);
  return events;
}

export function checkoutLocalParkingSession(
  sessionId: number,
  simulateMinutes = 0
): ParkingSessionRecord | null {
  const sessions = loadStoredParkingSessions();
  const idx = sessions.findIndex((s) => s.session_id === sessionId);
  if (idx === -1) return null;

  const existing = sessions[idx];
  if (existing.status === "completed") return existing;

  const entryMs = Date.parse(existing.entry_time);
  const exitMs =
    Math.max(entryMs, Date.now()) + Math.max(0, simulateMinutes) * 60000;
  const durationMinutes = Math.max(0, Math.floor((exitMs - entryMs) / 60000));
  const { billableHours, totalFeeEgp } = calculateParkingFee(
    durationMinutes,
    existing.hourly_rate_egp
  );

  const completed: ParkingSessionRecord = {
    ...existing,
    event_type: "exit",
    status: "completed",
    exit_time: new Date(exitMs).toISOString(),
    duration_minutes: durationMinutes,
    billable_hours: billableHours,
    total_fee_egp: totalFeeEgp,
  };
  sessions[idx] = completed;
  saveStoredParkingSessions(sessions);
  return completed;
}

export function loadStoredMockScans(): ScanResponse[] {
  if (typeof window === "undefined") return INITIAL_MOCK_SCANS;
  try {
    const raw = window.localStorage.getItem(SCANS_KEY);
    if (!raw) return INITIAL_MOCK_SCANS;
    const parsed = JSON.parse(raw) as ScanResponse[];
    return Array.isArray(parsed) ? parsed : INITIAL_MOCK_SCANS;
  } catch {
    return INITIAL_MOCK_SCANS;
  }
}

export function saveStoredMockScans(scans: ScanResponse[]): void {
  if (typeof window === "undefined") return;
  try {
    const serializable = scans.map((s) => ({
      ...s,
      annotated_image_url: s.annotated_image_url?.startsWith("blob:")
        ? "/demos/car-annotated.jpg"
        : s.annotated_image_url,
    }));
    window.localStorage.setItem(SCANS_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore storage quota errors
  }
}
