import { NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAuth } from "@/hooks/useAuth";
import { logout } from "@/store/authSlice";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { useStockAlerts } from "@/hooks/useStockAlerts";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/sales/new", label: "Create Sale" },
];

export function AppLayout() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const canManageRoles = user?.permissions?.includes("roles:manage") ?? false;
  useStockAlerts();

  return (
    <div className="flex min-h-screen bg-app-gradient">
      <aside className="flex w-64 flex-col bg-white/70 backdrop-blur-xl border-r border-slate-100">
        <div className="flex items-center gap-3 px-5 py-6">
          <Logo className="h-9 w-9 text-base" />
          <div>
            <h1 className="font-display text-base font-extrabold tracking-tight text-slate-900">
              Mini ERP
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Inventory &amp; Sales
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900",
                  isActive && "bg-brand-gradient text-white shadow-md shadow-brand-600/25 hover:text-white"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {canManageRoles && (
            <NavLink
              to="/roles"
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900",
                  isActive && "bg-brand-gradient text-white shadow-md shadow-brand-600/25 hover:text-white"
                )
              }
            >
              Roles
            </NavLink>
          )}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-600">
            {user?.role}
          </p>
          <button
            onClick={() => dispatch(logout())}
            className="mt-3 text-sm font-semibold text-slate-400 hover:text-rose-500"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
