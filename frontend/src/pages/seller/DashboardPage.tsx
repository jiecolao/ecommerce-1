import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { SellerReport } from 'shared';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign, ShoppingBag, Package } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchReport = async () => {
  const { data } = await axios.get<SellerReport>(`${API_URL}/seller/reports`, {
    headers: { 'x-actor-id': 'demo-seller' }
  });
  return data;
};

export default function DashboardPage() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['seller-report'],
    queryFn: fetchReport,
  });

  if (isLoading) return <div className="font-display py-16 text-center text-[#f4b72b]">Loading dashboard...</div>;
  if (!report) return <div className="font-display py-16 text-center text-[#ff5c80]">Failed to load reports.</div>;

  return (
    <div className="space-y-8">
      <div>
        <span className="comic-kicker mb-5">Seller command</span>
        <h1 className="comic-title text-4xl font-black">Seller Dashboard</h1>
        <p className="mt-3 text-lg text-[#a99bb5]">Overview of your store performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-[#67e8f9]">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-[#f4b72b]" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold text-white">${(report.totalRevenueCents / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-[#67e8f9]">Total Orders</CardTitle>
            <ShoppingBag className="h-5 w-5 text-[#f4b72b]" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold text-white">+{report.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="comic-title mb-5 text-xl font-bold">Top Selling Games</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-[#382548]">
              {report.topSellingProducts.length === 0 ? (
                <div className="p-6 text-center text-[#8f819b]">No sales yet.</div>
              ) : (
                report.topSellingProducts.map(p => (
                  <div key={p.productId} className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#7115c4] p-2">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-medium text-white">{p.title}</div>
                    </div>
                    <div className="font-display text-xs font-semibold uppercase text-[#f4b72b]">{p.quantitySold} sold</div>
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
