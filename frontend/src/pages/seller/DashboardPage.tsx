import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { SellerReport } from 'shared';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign, ShoppingBag, Package } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchReport = async () => {
  const { data } = await axios.get<SellerReport>(`${API_URL}/seller/reports`, {
    headers: { 'x-actor-id': '22222222-2222-2222-2222-222222222222' }
  });
  return data;
};

export default function DashboardPage() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['seller-report'],
    queryFn: fetchReport,
  });

  if (isLoading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (!report) return <div className="text-center py-10 text-red-500">Failed to load reports.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Seller Dashboard</h1>
        <p className="mt-2 text-lg text-slate-600">Overview of your store performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(report.totalRevenueCents / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{report.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Top Selling Games</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {report.topSellingProducts.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No sales yet.</div>
              ) : (
                report.topSellingProducts.map(p => (
                  <div key={p.productId} className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <Package className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="font-medium text-slate-900">{p.title}</div>
                    </div>
                    <div className="font-semibold">{p.quantitySold} sold</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
