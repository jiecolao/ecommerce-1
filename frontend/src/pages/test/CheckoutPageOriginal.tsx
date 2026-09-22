import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product, CheckoutDto } from 'shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { API_URL } from '../../lib/api';

export default function CheckoutPageOriginal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [notes, setNotes] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await axios.get<Product>(`${API_URL}/catalog/products/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData: CheckoutDto) => {
      const { data } = await axios.post(`${API_URL}/buyer/checkout`, checkoutData, {
        headers: {
          'x-actor-id': 'demo-buyer',
        },
      });
      return data;
    },
    onSuccess: () => {
      navigate('/test/orders');
    },
    onError: (error) => {
      alert('Checkout failed: ' + (error as any).message);
    },
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    checkoutMutation.mutate({
      billingName: name,
      billingEmail: email,
      notes,
      items: [
        {
          productId: product.id,
          quantity: 1,
        },
      ],
    });
  };

  if (isLoading) return <div className="text-center py-10">Preparing checkout...</div>;
  if (!product) return <div className="text-center py-10">Product not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Review your order and enter billing details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center py-4 border-b border-slate-200 mb-6">
            <div className="font-semibold text-slate-900">{product.title}</div>
            <div className="font-bold">${(product.priceCents / 100).toFixed(2)}</div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full" size="lg" disabled={checkoutMutation.isPending}>
                {checkoutMutation.isPending ? 'Processing...' : `Pay ${(product.priceCents / 100).toFixed(2)}`}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
