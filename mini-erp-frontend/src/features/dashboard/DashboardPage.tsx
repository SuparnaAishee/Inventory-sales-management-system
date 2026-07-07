import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/api/dashboard.api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-t-2 border-t-brand-500">
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</p>
        <p className="mt-2 font-display text-4xl font-extrabold tabular-nums text-stone-900">
          {value}
        </p>
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
        <Spinner className="h-8" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">Failed to load dashboard stats.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500">Overview of inventory and sales</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Products" value={data.totalProducts} />
        <StatCard label="Total Sales" value={data.totalSales} />
        <StatCard label="Low Stock Products" value={data.lowStockProducts.length} />
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 font-display text-lg font-bold text-stone-900">
            Low Stock Manifest <span className="text-stone-400">(below 5 units)</span>
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-stone-500">No low stock products.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-stone-200 text-xs uppercase tracking-widest text-stone-500">
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
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <td className="py-2 pr-4 font-medium text-stone-900">{product.name}</td>
                      <td className="py-2 pr-4 font-mono text-stone-600">{product.sku}</td>
                      <td className="py-2 pr-4 text-stone-600">{product.category}</td>
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
