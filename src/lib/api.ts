import type {
  DeleteResponse,
  DeleteSessionResponse,
  GateMode,
  HealthResponse,
  HistoryResponse,
  ParkingRates,
  ParkingSessionRecord,
  ParkingSessionsResponse,
  ParkingStatus,
  ScanResponse,
  VehicleType,
} from "@/types/anpr";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(res: Response): Promise<never> {
  let detail = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") {
      detail = body.detail;
    } else if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
      detail = String(body.detail[0].msg);
    }
  } catch {
    // Keep status fallback when response is not JSON
  }
  throw new ApiError(detail, res.status);
}

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/demos/") ||
    url.startsWith("/images/")
  ) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function analyzeImage(
  file: File,
  options?: {
    plateConf?: number;
    charConf?: number;
    gateMode?: GateMode;
    simulateMinutes?: number;
    carRateEgp?: number;
    motorcycleRateEgp?: number;
  }
): Promise<ScanResponse> {
  const params = new URLSearchParams({ format: "json" });
  if (options?.plateConf !== undefined) {
    params.set("plate_conf", options.plateConf.toFixed(2));
  }
  if (options?.charConf !== undefined) {
    params.set("char_conf", options.charConf.toFixed(2));
  }
  if (options?.gateMode) {
    params.set("gate_mode", options.gateMode);
  }
  if (options?.simulateMinutes !== undefined && options.simulateMinutes > 0) {
    params.set("simulate_minutes", String(Math.round(options.simulateMinutes)));
  }
  if (options?.carRateEgp !== undefined) {
    params.set("car_rate_egp", options.carRateEgp.toFixed(2));
  }
  if (options?.motorcycleRateEgp !== undefined) {
    params.set("motorcycle_rate_egp", options.motorcycleRateEgp.toFixed(2));
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/analyze?${params.toString()}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function getParkingRates(): Promise<ParkingRates> {
  const res = await fetch(`${API_BASE_URL}/parking/rates`, {
    cache: "no-store",
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function updateParkingRates(
  carRateEgp: number,
  motorcycleRateEgp: number
): Promise<ParkingRates> {
  const res = await fetch(`${API_BASE_URL}/parking/rates`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      car_rate_egp: carRateEgp,
      motorcycle_rate_egp: motorcycleRateEgp,
    }),
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function listParkingSessions(options?: {
  limit?: number;
  offset?: number;
  status?: "all" | ParkingStatus;
  plate?: string;
  vehicleType?: VehicleType | "all";
}): Promise<ParkingSessionsResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 50));
  params.set("offset", String(options?.offset ?? 0));
  params.set("status", options?.status ?? "all");
  if (options?.plate && options.plate.trim()) {
    params.set("plate", options.plate.trim());
  }
  if (options?.vehicleType && options.vehicleType !== "all") {
    params.set("vehicle_type", options.vehicleType);
  }

  const res = await fetch(
    `${API_BASE_URL}/parking/sessions?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function checkoutParkingSession(
  sessionId: number,
  simulateMinutes = 0
): Promise<ParkingSessionRecord> {
  const params = new URLSearchParams();
  if (simulateMinutes > 0) {
    params.set("simulate_minutes", String(Math.round(simulateMinutes)));
  }
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(
    `${API_BASE_URL}/parking/sessions/${sessionId}/checkout${qs}`,
    { method: "POST" }
  );
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function deleteParkingSession(
  sessionId: number
): Promise<DeleteSessionResponse> {
  const res = await fetch(`${API_BASE_URL}/parking/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function listScans(options?: {
  limit?: number;
  offset?: number;
  plate?: string;
  vehicleType?: VehicleType | "all";
}): Promise<HistoryResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 20));
  params.set("offset", String(options?.offset ?? 0));
  if (options?.plate && options.plate.trim()) {
    params.set("plate", options.plate.trim());
  }
  if (options?.vehicleType && options.vehicleType !== "all") {
    params.set("vehicle_type", options.vehicleType);
  }

  const res = await fetch(`${API_BASE_URL}/scans?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function getScan(scanId: number): Promise<ScanResponse> {
  const res = await fetch(`${API_BASE_URL}/scans/${scanId}`, {
    cache: "no-store",
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function deleteScan(scanId: number): Promise<DeleteResponse> {
  const res = await fetch(`${API_BASE_URL}/scans/${scanId}`, {
    method: "DELETE",
  });
  if (!res.ok) return parseError(res);
  return res.json();
}
