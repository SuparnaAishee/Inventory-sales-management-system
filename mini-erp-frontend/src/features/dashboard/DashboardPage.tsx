import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/api/dashboard.api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-xl text-white shadow-md shadow-brand-600/25">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-slate-900">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-rose-600">Failed to load dashboard stats.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of inventory and sales</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Products" value={data.totalProducts} icon="📦" />
        <StatCard label="Total Sales" value={data.totalSales} icon="💳" />
        <StatCard label="Low Stock Products" value={data.lowStockProducts.length} icon="⚠️" />
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 font-display text-lg font-bold text-slate-900">
            Low Stock <span className="text-slate-400">(below 5 units)</span>
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No low stock products.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">SKU</th>
                    <th className="py-2 pr-4 font-semibold">Category</th>
                    <th className="py-2 pr-4 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                    >
                      <td className="py-2 pr-4 font-medium text-slate-900">{product.name}</td>
                      <td className="py-2 pr-4 font-mono text-slate-500">{product.sku}</td>
                      <td className="py-2 pr-4 text-slate-500">{product.category}</td>
                      <td className="py-2 pr-4">
                        <Badge tone="danger">{product.stockQuantity} left</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
