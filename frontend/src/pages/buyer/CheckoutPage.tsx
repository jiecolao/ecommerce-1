import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Product, CheckoutDto } from 'shared';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import api from '../../lib/api';
import { CheckoutPageSkeleton } from '../../components/ui/skeleton';

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in cents
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/catalog/products/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const basePrice = product?.productVariants?.[0]?.price ?? 1000;
  const finalPrice = Math.max(0, basePrice - appliedDiscount);

  const checkoutMutation = useMutation({
    mutationFn: async (checkoutData: CheckoutDto) => {
      const { data } = await api.post(`/buyer/checkout`, checkoutData);
      return data;
    },
    onSuccess: () => {
      navigate('/buyer/orders');
    },
    onError: (error) => {
      alert('Checkout failed: ' + ((error as any).response?.data?.message || (error as any).message));
    },
  });

  const handleApplyPromo = (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!product) return;

    if (promoCode.trim().toUpperCase() === 'SAVE10') {
      const discount = Math.round(basePrice * 0.1);
      setAppliedDiscount(discount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid promo code.');
      setAppliedDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const variantId = product.productVariants?.[0]?.id ?? product.id;

    checkoutMutation.mutate({
      productId: variantId,
      totalAmount: finalPrice,
      discountCode: couponApplied ? 'SAVE10' : undefined,
    });
  };

  if (isLoading) return <CheckoutPageSkeleton />;
  if (!product) return <div className="font-display py-16 text-center text-[#ff5c80]">Product not found.</div>;

  const originalPrice = basePrice;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <span className="comic-kicker mb-7">Secure checkout</span>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Confirm your order details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between border-y border-[#49345d] bg-[#0d0912] px-4 py-5">
            <div className="font-semibold text-white">{product.title}</div>
            <div className="flex flex-col items-end">
              {couponApplied ? (
                <>
                  <span className="line-through text-slate-400 text-sm">${(originalPrice / 100).toFixed(2)}</span>
                  <span className="font-bold text-green-600 text-lg">${(finalPrice / 100).toFixed(2)}</span>
                </>
              ) : (
                <span className="font-display font-bold text-[#f4b72b]">${(originalPrice / 100).toFixed(2)}</span>
              )}
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo">Promo Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="promo"
                  placeholder="Enter SAVE10 for 10% off"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={couponApplied}
                />
                <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={couponApplied || !promoCode}>
                  Apply
                </Button>
              </div>
              {couponApplied && <p className="text-sm text-green-600 font-semibold">10% discount applied successfully!</p>}
              {couponError && <p className="text-sm text-red-500 font-semibold">{couponError}</p>}
            </div>

            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full text-white bg-purple-600 hover:bg-purple-700" size="lg" disabled={checkoutMutation.isPending}>
                {checkoutMutation.isPending ? 'Processing...' : `Pay $${(finalPrice / 100).toFixed(2)}`}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
