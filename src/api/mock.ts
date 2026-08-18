/**
 * In-memory mock backend.
 *
 * Mirrors the REST contract exactly so `src/api/*.api.ts` can switch to the
 * real server by setting VITE_API_BASE_URL — no page/component changes.
 * Availability, totals and report figures are computed here only because this
 * stands in for the server; the UI never computes them itself.
 */
import { ApiError } from "./client";
import type {
  LoginResponse,
  MonthlyReport,
  Paginated,
  Rental,
  RentalStatus,
  ReportRow,
  Vehicle,
  VehicleCategory,
} from "@/types";

const latency = (ms = 420) => new Promise((r) => setTimeout(r, ms));

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

let vehicles: (Vehicle & { deleted: boolean })[] = [
  {
    id: "v1",
    name: "Toyota Corolla Altis",
    plate_number: "DHA-1129",
    category: "sedan",
    daily_rate: 55,
    photo_url: photo("photo-1552519507-da3b142c6e3d"),
    created_at: "2026-01-12T09:20:00Z",
    deleted: false,
  },
  {
    id: "v2",
    name: "Toyota Land Cruiser Prado",
    plate_number: "DHA-4402",
    category: "suv",
    daily_rate: 130,
    photo_url: photo("photo-1519641471654-76ce0107ad1b"),
    created_at: "2026-01-18T11:05:00Z",
    deleted: false,
  },
  {
    id: "v3",
    name: "Honda Fit Hybrid",
    plate_number: "DHA-7781",
    category: "hatchback",
    daily_rate: 38,
    photo_url: photo("photo-1503376780353-7e6692767b70"),
    created_at: "2026-02-02T08:40:00Z",
    deleted: false,
  },
  {
    id: "v4",
    name: "Toyota Hiace Grand Cabin",
    plate_number: "DHA-3315",
    category: "van",
    daily_rate: 96,
    photo_url: photo("photo-1570125909232-eb263c188f7e"),
    created_at: "2026-02-14T15:10:00Z",
    deleted: false,
  },
  {
    id: "v5",
    name: "Ford Ranger Wildtrak",
    plate_number: "DHA-9040",
    category: "pickup",
    daily_rate: 88,
    photo_url: photo("photo-1568605117036-5fe5e7bab0b7"),
    created_at: "2026-03-01T10:00:00Z",
    deleted: false,
  },
  {
    id: "v6",
    name: "Mercedes-Benz E-Class",
    plate_number: "DHA-0007",
    category: "luxury",
    daily_rate: 210,
    photo_url: photo("photo-1549317661-bd32c8ce0db2"),
    created_at: "2026-03-09T13:25:00Z",
    deleted: false,
  },
  {
    id: "v7",
    name: "Nissan X-Trail",
    plate_number: "DHA-6612",
    category: "suv",
    daily_rate: 78,
    photo_url: photo("photo-1533473359331-0135ef1b58bf"),
    created_at: "2026-04-04T07:55:00Z",
    deleted: false,
  },
  {
    id: "v8",
    name: "Hyundai Elantra",
    plate_number: "DHA-2288",
    category: "sedan",
    daily_rate: 48,
    photo_url: photo("photo-1502877338535-766e1452684a"),
    created_at: "2026-05-21T12:30:00Z",
    deleted: false,
  },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const shift = (days: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
};

export const dayCount = (start: string, end: string) => {
  const ms = Date.parse(end) - Date.parse(start);
  return Math.floor(ms / 86_400_000) + 1; // same-day rental = 1 day
};

let rentals: Rental[] = [
  mkRental("r1", "Ayesha Rahman", "+8801711223344", "v2", shift(-4), shift(2), "ongoing"),
  mkRental("r2", "Imran Chowdhury", "+8801811556677", "v1", shift(1), shift(5), "booked"),
  mkRental("r3", "Nadia Karim", "+8801912334455", "v6", shift(-20), shift(-15), "completed"),
  mkRental("r4", "Tanvir Hasan", "+8801611778899", "v4", shift(3), shift(9), "booked"),
  mkRental("r5", "Sabbir Ahmed", "+8801511990011", "v3", shift(-9), shift(-9), "completed"),
  mkRental("r6", "Farhana Islam", "+8801722446688", "v5", shift(-2), shift(1), "ongoing"),
  mkRental("r7", "Rakib Uddin", "+8801833557799", "v7", shift(-25), shift(-18), "cancelled"),
  mkRental("r8", "Mahmuda Akter", "+8801955667788", "v8", shift(-12), shift(-6), "completed"),
  mkRental("r9", "Shahriar Kabir", "+8801644332211", "v2", shift(-34), shift(-28), "completed"),
  mkRental("r10", "Priya Das", "+8801799887766", "v6", shift(6), shift(11), "booked"),
  mkRental("r11", "Jubayer Alam", "+8801766554433", "v1", shift(-16), shift(-13), "completed"),
  mkRental("r12", "Rumana Sultana", "+8801888990022", "v3", shift(4), shift(4), "booked"),
];

function mkRental(
  id: string,
  customer_name: string,
  customer_phone: string,
  vehicle_id: string,
  start_date: string,
  end_date: string,
  status: RentalStatus,
): Rental {
  const vehicle = vehicles.find((v) => v.id === vehicle_id)!;
  return {
    id,
    customer_name,
    customer_phone,
    vehicle_id,
    vehicle_name: vehicle.name,
    vehicle_plate_number: vehicle.plate_number,
    start_date,
    end_date,
    total_amount: dayCount(start_date, end_date) * vehicle.daily_rate,
    status,
    created_at: new Date().toISOString(),
  };
}

let seq = 100;
const nextId = (p: string) => `${p}${++seq}`;

function publicVehicle(v: Vehicle & { deleted: boolean }): Vehicle {
  const { deleted: _deleted, ...rest } = v;
  return rest;
}

function requireVehicle(id: string) {
  const v = vehicles.find((x) => x.id === id && !x.deleted);
  if (!v) throw new ApiError("The requested vehicle could not be found.", 404);
  return v;
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

function assertNoConflict(vehicleId: string, start: string, end: string, ignoreId?: string) {
  const clash = rentals.find(
    (r) =>
      r.id !== ignoreId &&
      r.vehicle_id === vehicleId &&
      (r.status === "booked" || r.status === "ongoing") &&
      overlaps(start, end, r.start_date, r.end_date),
  );
  if (clash) {
    throw new ApiError(
      "This vehicle already has an active rental that overlaps the selected dates.",
      409,
    );
  }
}

export const mockApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await latency(700);
    if (email.trim().toLowerCase() !== "staff@rentals.test" || password !== "password123") {
      throw new ApiError("Invalid email or password.", 401);
    }
    return {
      token: `mock.jwt.${Date.now()}`,
      user: { id: "u1", name: "Operations Staff", email: email.trim().toLowerCase() },
    };
  },

  async listVehicles(params: {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
  }): Promise<Paginated<Vehicle>> {
    await latency();
    const page = params.page ?? 1;
    const perPage = params.per_page ?? 8;
    let rows = vehicles.filter((v) => !v.deleted);
    if (params.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (v) => v.name.toLowerCase().includes(q) || v.plate_number.toLowerCase().includes(q),
      );
    }
    if (params.category) rows = rows.filter((v) => v.category === params.category);
    const total = rows.length;
    const slice = rows.slice((page - 1) * perPage, page * perPage).map(publicVehicle);
    return {
      data: slice,
      page,
      per_page: perPage,
      total,
      total_pages: Math.max(1, Math.ceil(total / perPage)),
    };
  },

  async getVehicle(id: string): Promise<Vehicle> {
    await latency(300);
    return publicVehicle(requireVehicle(id));
  },

  async createVehicle(form: FormData): Promise<Vehicle> {
    await latency(700);
    const plate = String(form.get("plate_number") ?? "").trim();
    if (vehicles.some((v) => !v.deleted && v.plate_number.toLowerCase() === plate.toLowerCase())) {
      throw new ApiError("A vehicle with this plate number already exists.", 409, {
        plate_number: "This plate number is already registered.",
      });
    }
    const file = form.get("photo");
    const record = {
      id: nextId("v"),
      name: String(form.get("name") ?? "").trim(),
      plate_number: plate,
      category: String(form.get("category") ?? "sedan") as VehicleCategory,
      daily_rate: Number(form.get("daily_rate") ?? 0),
      photo_url:
        file instanceof File && file.size > 0
          ? URL.createObjectURL(file)
          : photo("photo-1503376780353-7e6692767b70"),
      created_at: new Date().toISOString(),
      deleted: false,
    };
    vehicles = [record, ...vehicles];
    return publicVehicle(record);
  },

  async updateVehicle(id: string, form: FormData): Promise<Vehicle> {
    await latency(700);
    const target = requireVehicle(id);
    const plate = String(form.get("plate_number") ?? target.plate_number).trim();
    if (
      vehicles.some(
        (v) => v.id !== id && !v.deleted && v.plate_number.toLowerCase() === plate.toLowerCase(),
      )
    ) {
      throw new ApiError("A vehicle with this plate number already exists.", 409, {
        plate_number: "This plate number is already registered.",
      });
    }
    const file = form.get("photo");
    target.name = String(form.get("name") ?? target.name);
    target.plate_number = plate;
    target.category = String(form.get("category") ?? target.category) as VehicleCategory;
    target.daily_rate = Number(form.get("daily_rate") ?? target.daily_rate);
    if (file instanceof File && file.size > 0) target.photo_url = URL.createObjectURL(file);
    rentals = rentals.map((r) =>
      r.vehicle_id === id
        ? { ...r, vehicle_name: target.name, vehicle_plate_number: target.plate_number }
        : r,
    );
    return publicVehicle(target);
  },

  async deleteVehicle(id: string): Promise<void> {
    await latency(500);
    requireVehicle(id).deleted = true; // soft delete: rental history preserved
  },

  async listRentals(params: {
    page?: number;
    per_page?: number;
    search?: string;
    vehicle_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Paginated<Rental>> {
    await latency();
    const page = params.page ?? 1;
    const perPage = params.per_page ?? 8;
    let rows = [...rentals].sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
    if (params.search) {
      const q = params.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_phone.includes(q) ||
          (r.vehicle_name ?? "").toLowerCase().includes(q),
      );
    }
    if (params.vehicle_id) rows = rows.filter((r) => r.vehicle_id === params.vehicle_id);
    if (params.status) rows = rows.filter((r) => r.status === params.status);
    if (params.start_date) rows = rows.filter((r) => r.end_date >= params.start_date!);
    if (params.end_date) rows = rows.filter((r) => r.start_date <= params.end_date!);
    const total = rows.length;
    return {
      data: rows.slice((page - 1) * perPage, page * perPage),
      page,
      per_page: perPage,
      total,
      total_pages: Math.max(1, Math.ceil(total / perPage)),
    };
  },

  async getRental(id: string): Promise<Rental> {
    await latency(300);
    const r = rentals.find((x) => x.id === id);
    if (!r) throw new ApiError("The requested rental could not be found.", 404);
    return r;
  },

  async createRental(payload: {
    vehicle_id: string;
    customer_name: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
  }): Promise<Rental> {
    await latency(700);
    const vehicle = requireVehicle(payload.vehicle_id);
    if (payload.end_date < payload.start_date) {
      throw new ApiError("End date must be on or after the start date.", 422, {
        end_date: "End date must be on or after the start date.",
      });
    }
    assertNoConflict(payload.vehicle_id, payload.start_date, payload.end_date);
    const record: Rental = {
      id: nextId("r"),
      ...payload,
      vehicle_name: vehicle.name,
      vehicle_plate_number: vehicle.plate_number,
      total_amount: dayCount(payload.start_date, payload.end_date) * vehicle.daily_rate,
      status: "booked",
      created_at: new Date().toISOString(),
    };
    rentals = [record, ...rentals];
    return record;
  },

  async updateRental(
    id: string,
    payload: {
      vehicle_id: string;
      customer_name: string;
      customer_phone: string;
      start_date: string;
      end_date: string;
      status: RentalStatus;
    },
  ): Promise<Rental> {
    await latency(700);
    const existing = rentals.find((x) => x.id === id);
    if (!existing) throw new ApiError("The requested rental could not be found.", 404);
    const vehicle = requireVehicle(payload.vehicle_id);
    if (payload.end_date < payload.start_date) {
      throw new ApiError("End date must be on or after the start date.", 422, {
        end_date: "End date must be on or after the start date.",
      });
    }
    if (payload.status === "booked" || payload.status === "ongoing") {
      assertNoConflict(payload.vehicle_id, payload.start_date, payload.end_date, id);
    }
    Object.assign(existing, payload, {
      vehicle_name: vehicle.name,
      vehicle_plate_number: vehicle.plate_number,
      total_amount: dayCount(payload.start_date, payload.end_date) * vehicle.daily_rate,
    });
    return existing;
  },

  async deleteRental(id: string): Promise<void> {
    await latency(500);
    rentals = rentals.filter((r) => r.id !== id); // hard delete
  },

  async monthlyReport(month: string, vehicleId?: string): Promise<MonthlyReport> {
    await latency(600);
    const [y, m] = month.split("-").map(Number);
    const monthStart = `${month}-01`;
    const lastDay = new Date(Date.UTC(y!, m!, 0)).getUTCDate();
    const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;

    const byVehicle = new Map<string, ReportRow>();
    rentals
      .filter((r) => r.status !== "cancelled")
      .filter((r) => !vehicleId || r.vehicle_id === vehicleId)
      .filter((r) => overlaps(r.start_date, r.end_date, monthStart, monthEnd))
      .forEach((r) => {
        const vehicle = vehicles.find((v) => v.id === r.vehicle_id);
        if (!vehicle) return;
        const from = r.start_date > monthStart ? r.start_date : monthStart;
        const to = r.end_date < monthEnd ? r.end_date : monthEnd;
        const days = dayCount(from, to); // only days inside the selected month
        const row =
          byVehicle.get(r.vehicle_id) ??
          ({
            vehicle_id: r.vehicle_id,
            vehicle_name: vehicle.name,
            plate_number: vehicle.plate_number,
            total_bookings: 0,
            days_rented: 0,
            revenue: 0,
          } satisfies ReportRow);
        row.total_bookings += 1;
        row.days_rented += days;
        row.revenue += days * vehicle.daily_rate;
        byVehicle.set(r.vehicle_id, row);
      });

    const rows = [...byVehicle.values()].sort((a, b) => b.revenue - a.revenue);
    const top = rows[0];
    return {
      month,
      totals: {
        total_bookings: rows.reduce((s, r) => s + r.total_bookings, 0),
        total_days_rented: rows.reduce((s, r) => s + r.days_rented, 0),
        total_revenue: rows.reduce((s, r) => s + r.revenue, 0),
        highest_revenue_vehicle: top
          ? { vehicle_id: top.vehicle_id, vehicle_name: top.vehicle_name, revenue: top.revenue }
          : null,
      },
      rows,
    };
  },
};
