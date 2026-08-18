import { apiRequest, buildQuery, USE_MOCK_API } from "./client";
import { mockApi } from "./mock";
import type { Paginated, Vehicle } from "@/types";

export interface VehicleListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
}

export function listVehicles(params: VehicleListParams): Promise<Paginated<Vehicle>> {
  if (USE_MOCK_API) return mockApi.listVehicles(params);
  return apiRequest<Paginated<Vehicle>>(`/vehicles${buildQuery({ ...params })}`);
}

export function getVehicle(id: string): Promise<Vehicle> {
  if (USE_MOCK_API) return mockApi.getVehicle(id);
  return apiRequest<Vehicle>(`/vehicles/${id}`);
}

export function createVehicle(form: FormData): Promise<Vehicle> {
  if (USE_MOCK_API) return mockApi.createVehicle(form);
  return apiRequest<Vehicle>("/vehicles", { method: "POST", body: form });
}

export function updateVehicle(id: string, form: FormData): Promise<Vehicle> {
  if (USE_MOCK_API) return mockApi.updateVehicle(id, form);
  return apiRequest<Vehicle>(`/vehicles/${id}`, { method: "PUT", body: form });
}

export function deleteVehicle(id: string): Promise<void> {
  if (USE_MOCK_API) return mockApi.deleteVehicle(id);
  return apiRequest<void>(`/vehicles/${id}`, { method: "DELETE" });
}
