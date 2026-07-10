import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { UserProfile } from "../types";

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me/profile");
      return data;
    },
    staleTime: 30_000,
  });
}
