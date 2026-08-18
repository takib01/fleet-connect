import { apiRequest, buildQuery, USE_MOCK_API } from "./client";
import { mockApi } from "./mock";
import type { MonthlyReport } from "@/types";

export function getMonthlyReport(month: string, vehicleId?: string): Promise<MonthlyReport> {
  if (USE_MOCK_API) return mockApi.monthlyReport(month, vehicleId);
  return apiRequest<MonthlyReport>(
    `/reports/rentals${buildQuery({ month, vehicle_id: vehicleId })}`,
  );
}
