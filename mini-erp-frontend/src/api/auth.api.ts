import { axiosClient } from "./axiosClient";
import type { ApiSuccess, User } from "@/types";

export interface LoginResponse {
  token: string;
  user: User;
}

export async function loginRequest(email: string, password: string) {
  const { data } = await axiosClient.post<ApiSuccess<LoginResponse>>("/auth/login", {
    email,
    password,
  });
  return data.data;
}

export async function getMeRequest() {
  const { data } = await axiosClient.get<ApiSuccess<User>>("/auth/me");
  return data.data;
}
