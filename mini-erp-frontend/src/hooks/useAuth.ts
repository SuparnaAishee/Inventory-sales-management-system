import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector<RootState, T>(selector);

export function useAuth() {
  const { token, user } = useAppSelector((state) => state.auth);
  return { token, user, isAuthenticated: Boolean(token && user) };
}
