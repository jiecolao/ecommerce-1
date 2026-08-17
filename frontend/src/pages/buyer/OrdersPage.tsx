import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Order } from 'shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { KeyRound } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchOrders = async () => {
  const { data } = await axios.get<Order[]>(`${API_URL}/buyer/orders`, {
    headers: { 'x-actor-id': '11111111-1111-1111-1111-111111111111' }
  });
  return data;
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) return <div className="text-center py-10">Loading your games...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Failed to load orders.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">My Games Library</h1>
        <p className="mt-2 text-lg text-slate-600">Access your purchased game keys here.</p>
      </div>

      <div className="space-y-6">
        {orders?.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
            You haven't bought any games yet.
          </div>
        ) : (
          orders?.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.createdAt).toLocaleDateString()} • Total: ${(order.totalAmount / 100).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-200 p-3 rounded-md">
                        <KeyRound className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{order.product?.title || 'Unknown Game'}</div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => alert(`Your Game Key for ${order.product?.title}:\nXXXX-XXXX-XXXX-XXXX`)}>
                      Reveal Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
