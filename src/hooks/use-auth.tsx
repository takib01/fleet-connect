import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { logout as apiLogout } from "@/api/auth.api";
import { getStoredUser, getToken } from "@/api/client";
import type { StaffUser } from "@/types";

/** Reads the demo JWT session from localStorage (client-side only). */
export function useAuth() {
  const [status, setStatus] = useState<"loading" | "authenticated" | "anonymous">("loading");
  const [user, setUser] = useState<StaffUser | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    setUser(getStoredUser<StaffUser>());
    setStatus(token ? "authenticated" : "anonymous");
  }, []);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    apiLogout();
    setStatus("anonymous");
    setUser(null);
    navigate({ to: "/login", replace: true });
  }, [navigate, queryClient]);

  return { status, user, signOut };
}
