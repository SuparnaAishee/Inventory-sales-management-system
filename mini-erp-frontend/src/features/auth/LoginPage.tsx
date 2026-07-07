import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useAppDispatch } from "@/hooks/useAuth";
import { setCredentials } from "@/store/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@example.com", password: "Admin@12345" },
  { role: "Manager", email: "manager@example.com", password: "Manager@12345" },
  { role: "Employee", email: "employee@example.com", password: "Employee@12345" },
];

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function performLogin(loginEmail: string, loginPassword: string) {
    setError(null);
    try {
      const result = await loginRequest(loginEmail, loginPassword);
      dispatch(setCredentials(result));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed"));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await performLogin(email, password);
    setIsLoading(false);
  }

  async function handleDemoLogin(demoEmail: string, demoPassword: string, role: string) {
    setLoadingDemo(role);
    setEmail(demoEmail);
    setPassword(demoPassword);
    await performLogin(demoEmail, demoPassword);
    setLoadingDemo(null);
  }

  return (
    <div className="flex min-h-screen bg-app-gradient">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-gradient p-12 md:flex">
        <div
          className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="animate-blob absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent-400/30 blur-3xl"
          style={{ animationDelay: "2s" }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-3">
          <Logo className="h-9 w-9 bg-white/15 text-lg shadow-none" />
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Mini ERP
          </span>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
            Inventory &amp; sales,
            <br />
            finally in sync.
          </h2>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Track stock, ring up sales, and catch low inventory in real time — all from one
            dashboard.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <Logo className="h-8 w-8 text-base" />
            <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
              Mini ERP
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage inventory and sales.</p>

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
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
              Sign in
            </Button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Quick demo access
              </p>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              One click, no typing — try any role instantly.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  disabled={loadingDemo !== null}
                  onClick={() => handleDemoLogin(account.email, account.password, account.role)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-md disabled:opacity-50"
                >
                  {loadingDemo === account.role ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    account.role
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
