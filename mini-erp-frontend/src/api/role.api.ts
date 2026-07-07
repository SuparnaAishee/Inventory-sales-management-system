import { axiosClient } from "./axiosClient";
import type { ApiSuccess, Permission, Role } from "@/types";

export async function fetchRoles() {
  const { data } = await axiosClient.get<ApiSuccess<Role[]>>("/roles");
  return data.data;
}

export async function fetchPermissions() {
  const { data } = await axiosClient.get<ApiSuccess<Permission[]>>("/roles/permissions");
  return data.data;
}

export async function updateRolePermissions(name: string, permissions: string[]) {
  const { data } = await axiosClient.put<ApiSuccess<Role>>(`/roles/${name}`, { permissions });
  return data.data;
}
