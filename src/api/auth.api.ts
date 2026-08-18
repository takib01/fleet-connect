import { apiRequest, clearSession, setSession, USE_MOCK_API } from "./client";
import { mockApi } from "./mock";
import type { LoginResponse } from "@/types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const result = USE_MOCK_API
    ? await mockApi.login(email, password)
    : await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
        anonymous: true,
      });
  setSession(result.token, result.user);
  return result;
}

export function logout() {
  clearSession();
}
