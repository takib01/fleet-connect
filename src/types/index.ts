export type VehicleCategory = "sedan" | "suv" | "hatchback" | "van" | "pickup" | "luxury";

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  "sedan",
  "suv",
  "hatchback",
  "van",
  "pickup",
  "luxury",
];

export interface Vehicle {
  id: string;
  name: string;
  plate_number: string;
  category: VehicleCategory;
  daily_rate: number;
  photo_url: string | null;
  created_at?: string;
}

export type RentalStatus = "booked" | "ongoing" | "completed" | "cancelled";

export const RENTAL_STATUSES: RentalStatus[] = ["booked", "ongoing", "completed", "cancelled"];

export interface Rental {
  id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_id: string;
  vehicle_name?: string;
  vehicle_plate_number?: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_amount: number;
  status: RentalStatus;
  created_at?: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ReportRow {
  vehicle_id: string;
  vehicle_name: string;
  plate_number: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  totals: {
    total_bookings: number;
    total_days_rented: number;
    total_revenue: number;
    highest_revenue_vehicle: { vehicle_id: string; vehicle_name: string; revenue: number } | null;
  };
  rows: ReportRow[];
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: StaffUser;
}
