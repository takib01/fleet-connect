import { apiRequest, buildQuery, USE_MOCK_API } from "./client";
import { mockApi } from "./mock";
import type { Paginated, Rental, RentalStatus } from "@/types";

export interface RentalListParams {
  page?: number;
  per_page?: number;
  search?: string;
  vehicle_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface RentalPayload {
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export function listRentals(params: RentalListParams): Promise<Paginated<Rental>> {
  if (USE_MOCK_API) return mockApi.listRentals(params);
  return apiRequest<Paginated<Rental>>(`/rentals${buildQuery({ ...params })}`);
}

export function getRental(id: string): Promise<Rental> {
  if (USE_MOCK_API) return mockApi.getRental(id);
  return apiRequest<Rental>(`/rentals/${id}`);
}

export function createRental(payload: RentalPayload): Promise<Rental> {
  if (USE_MOCK_API) return mockApi.createRental(payload);
  return apiRequest<Rental>("/rentals", { method: "POST", body: payload });
}

export function updateRental(
  id: string,
  payload: RentalPayload & { status: RentalStatus },
): Promise<Rental> {
  if (USE_MOCK_API) return mockApi.updateRental(id, payload);
  return apiRequest<Rental>(`/rentals/${id}`, { method: "PUT", body: payload });
}

export function deleteRental(id: string): Promise<void> {
  if (USE_MOCK_API) return mockApi.deleteRental(id);
  return apiRequest<void>(`/rentals/${id}`, { method: "DELETE" });
}
