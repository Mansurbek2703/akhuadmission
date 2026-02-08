'use client';

import useSWR from "swr";
import { useCallback } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface AuthUser {
  id: string;
  email: string;
  role: "applicant" | "admin" | "superadmin";
  program?: string;
  email_verified: boolean;
}

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/auth/session",
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await mutate();
      return data;
    },
    [mutate]
  );

  const register = useCallback(
    async (email: string, password: string, program: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, program }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate({ user: null }, false);
  }, [mutate]);

  return {
    user: data?.user as AuthUser | null,
    isLoading,
    error,
    login,
    register,
    logout,
    mutate,
  };
}
