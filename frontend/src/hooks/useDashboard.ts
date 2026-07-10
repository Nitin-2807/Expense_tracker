import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { DashboardStats, TimeRange } from "../types";

export function useDashboard(timeRange: TimeRange) {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", timeRange],
    queryFn: async () => {
      const { data } = await api.get("/dashboard", {
        params: { time_range: timeRange },
      });
      return data;
    },
  });
}
