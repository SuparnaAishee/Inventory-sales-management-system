import { axiosClient } from "./axiosClient";
import type { ApiSuccess, DashboardStats } from "@/types";

export async function fetchDashboardStats() {
  const { data } = await axiosClient.get<ApiSuccess<DashboardStats>>("/dashboard/stats");
  return data.data;
}
