import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Order } from 'shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { KeyRound } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchOrders = async () => {
  const { data } = await axios.get<Order[]>(`${API_URL}/buyer/orders`, {
    headers: { 'x-actor-id': 'demo-buyer' }
  });
  return data;
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) return <div className="font-display py-16 text-center text-[#f4b72b]">Loading your games...</div>;
  if (error) return <div className="font-display py-16 text-center text-[#ff5c80]">Failed to load orders.</div>;

  return (
    <div className="space-y-8">
      <div>
        <span className="comic-kicker mb-5">Player vault</span>
        <h1 className="comic-title text-4xl font-black">My Games Library</h1>
        <p className="mt-3 text-lg text-[#a99bb5]">Access your purchased game keys here.</p>
      </div>

      <div className="space-y-6">
        {orders?.length === 0 ? (
          <div className="comic-panel py-12 text-center text-[#a99bb5]">
            You haven't bought any games yet.
          </div>
        ) : (
          orders?.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.createdAt).toLocaleDateString()} | Total: ${(order.totalCents / 100).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between border border-[#382548] bg-[#0d0912] p-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-[#7115c4] p-3">
                          <KeyRound className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{item.product?.title || 'Unknown Game'}</div>
                          <div className="text-sm text-[#8f819b]">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => alert(`Your Game Key for ${item.product?.title}:\nXXXX-XXXX-XXXX-XXXX`)}>
                        Reveal Key
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
