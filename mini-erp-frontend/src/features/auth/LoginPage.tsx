import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useAppDispatch } from "@/hooks/useAuth";
import { setCredentials } from "@/store/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Barcode } from "@/components/ui/Barcode";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await loginRequest(email, password);
      dispatch(setCredentials(result));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f7f4ec]">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-stone-900 p-12 md:flex">
        <Barcode
          className="absolute -right-10 top-1/2 h-64 -translate-y-1/2 text-brand-500 opacity-[0.12]"
          barClassName="rounded-sm"
        />
        <div className="relative flex items-center gap-3">
          <Barcode className="h-7 text-brand-500" />
          <span className="font-display text-lg font-extrabold tracking-wide text-white">
            MINI ERP
          </span>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
            Stock.
            <br />
            Sales.
            <br />
            Sorted.
          </h2>
          <p className="mt-4 max-w-xs text-sm text-stone-400">
            One ledger for inventory and sales — track stock, ring up sales, and catch low
            stock before it runs out.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <Barcode className="h-6 text-brand-600" />
            <span className="font-display text-lg font-extrabold tracking-wide text-stone-900">
              MINI ERP
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="mt-1 text-sm text-stone-500">Sign in to manage inventory and sales.</p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
