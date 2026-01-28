// src/hooks/useAuth.ts
import { useMeQuery } from "@/app/api/api";

export function useAuth() {
  const { data, isLoading } = useMeQuery();
  return {
    user: data?.user ?? null,
    isLoading,
    isAdmin: data?.user?.isAdmin ?? false,
  };
}
