export type VehicleType = "car" | "motorcycle" | "unknown";
export type GateMode = "auto" | "entry" | "exit";
export type ParkingStatus = "parked" | "completed";
export type ParkingEventType = "entry" | "exit";

export interface PlateDetection {
  plate_index: number;
  vehicle_type: VehicleType;
  precision: number;
  text: string;
  characters: string[];
  bbox: number[];
  fallback_full_image: boolean;
  is_partial: boolean;
}

export interface ParkingSessionRecord {
  session_id: number;
  event_type: ParkingEventType;
  status: ParkingStatus;
  plate_text: string;
  plate_normalized: string;
  vehicle_type: VehicleType;
  entry_scan_id: number | null;
  exit_scan_id: number | null;
  entry_time: string;
  exit_time: string | null;
  duration_minutes: number;
  billable_hours: number;
  hourly_rate_egp: number;
  total_fee_egp: number;
}

export interface ParkingRates {
  car_rate_egp: number;
  motorcycle_rate_egp: number;
  min_hours: number;
  rounding_minutes: number;
  currency: string;
}

export interface ParkingSummary {
  active_parked_count: number;
  active_cars: number;
  active_motorcycles: number;
  completed_count: number;
  total_revenue_egp: number;
  rates: ParkingRates;
}

export interface ParkingSessionsResponse {
  total: number;
  limit: number;
  offset: number;
  summary: ParkingSummary;
  sessions: ParkingSessionRecord[];
}

export interface ScanResponse {
  scan_id: number;
  filename: string | null;
  plate_count: number;
  plates: PlateDetection[];
  annotated_image_url: string | null;
  created_at: string;
  parking_events?: ParkingSessionRecord[];
}

export interface HistoryResponse {
  total: number;
  limit: number;
  offset: number;
  scans: ScanResponse[];
}

export interface DeleteResponse {
  deleted_scan_id: number;
}

export interface DeleteSessionResponse {
  deleted_session_id: number;
}

export interface HealthResponse {
  status: string;
  device: string;
  model_loaded: boolean;
}
