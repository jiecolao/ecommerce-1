import { useMemo, useState } from 'react';
import { LockKeyhole, ShieldCheck, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from '../../lib/toast';
import { CartPageSkeleton } from '../../components/ui/skeleton';

const paymentMethods = [
  { id: 'gcash', label: 'GCash', img: 'https://www.google.com/s2/favicons?domain=gcash.com&sz=128' },
  { id: 'maya', label: 'Maya', img: 'https://www.google.com/s2/favicons?domain=maya.ph&sz=128' },
  { id: 'card', label: 'Credit / Debit Card', img: 'https://www.google.com/s2/favicons?domain=visa.com&sz=128' },
  { id: 'paypal', label: 'PayPal', img: 'https://www.google.com/s2/favicons?domain=paypal.com&sz=128' },
];

const formatPrice = (price: number) => `P${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [checkingOut, setCheckingOut] = useState(false);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/buyer/cart');
      return res.data;
    },
  });

  const orderLines = useMemo(() => cartData?.orderLines || [], [cartData?.orderLines]);

  const subtotal = useMemo(() => {
    return orderLines.reduce((acc: number, line: any) => {
      const price = Number(line.unitPrice ?? line.productVariant?.price ?? 0);
      const qty = line.quantity || 1;
      return acc + price * qty;
    }, 0);
  }, [orderLines]);

  const platformFee = orderLines.length > 0 ? 12 : 0;
  const total = subtotal + platformFee;

  const removeMutation = useMutation({
    mutationFn: async (lineId: number) => {
      await api.delete(`/buyer/cart/items/${lineId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.info('Item removed from cart');
    },
    onError: () => {
      // api interceptor displays toast
    },
  });

  const handleCompletePurchase = async () => {
    if (orderLines.length === 0) return;
    setCheckingOut(true);

    try {
      // Complete checkout on available backend checkout endpoint
      for (const line of orderLines) {
        const variantId = line.productVariantId || line.productVariant?.id;
        if (variantId) {
          const itemTotal = Math.round(Number(line.unitPrice || line.productVariant?.price || 0) * (line.quantity || 1));
          await api.post('/buyer/checkout', {
            productId: variantId,
            totalAmount: itemTotal,
          });
          // Remove from cart once checked out
          await api.delete(`/buyer/cart/items/${line.id}`).catch(() => {});
        }
      }

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      navigate('/checkout/success');
    } catch {
      // api interceptor displays toast
    } finally {
      setCheckingOut(false);
    }
  };

  if (isLoading) {
    return <CartPageSkeleton />;
  }

  return (
    <div className="pb-8">
      <div className="mb-10">
        <span className="comic-kicker mb-5">Final checkpoint</span>
        <h1 className="comic-title text-4xl font-black">Checkout & Cart</h1>
        <p className="mt-3 text-[#b2a4c4]">Review your items and proceed with your order.</p>
      </div>

      {orderLines.length === 0 ? (
        <div className="comic-panel p-12 text-center">
          <p className="font-display text-xl font-black text-[#f2edf7]">Your cart is empty.</p>
          <p className="mt-2 text-sm text-[#b2a4c4]">Browse our vault to add games and top-ups.</p>
          <Link
            to="/catalog"
            className="comic-action-btn mt-6 inline-flex h-12 items-center gap-2 bg-[#e5a93c] px-6 text-xs font-black uppercase text-[#0e0917] hover:bg-[#f0b849]"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Catalog
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">
          <section className="comic-panel overflow-hidden">
            <header className="border-b-2 border-[#0e0917] bg-[#241338] px-6 py-5">
              <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#f2edf7]">
                Order Items ({orderLines.length})
              </h2>
            </header>

            <div className="divide-y-2 divide-[#0e0917]">
              {orderLines.map((line: any) => {
                const variant = line.productVariant;
                const product = variant?.product;
                const title = product?.title || variant?.name || 'Digital Game Key';
                const price = Number(line.unitPrice ?? variant?.price ?? 0);
                const image = product?.media?.[0] || '/palworld-cover.jpg';

                return (
                  <article key={line.id} className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                    <img
                      src={image}
                      alt={title}
                      className="h-20 w-20 shrink-0 border-2 border-[#0e0917] object-cover shadow-[2px_2px_0_#0e0917]"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-[#f2edf7] text-base">{title}</h3>
                      <p className="mt-1 text-xs text-[#a99bb5]">
                        {variant?.name || 'Standard Edition'} (Qty: {line.quantity})
                      </p>
                      {line.targetAccount && (
                        <p className="text-[11px] font-bold text-[#e5a93c]">
                          Account: {line.targetAccount}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                      <span className="font-display text-lg font-black text-[#f2edf7] drop-shadow-[1px_1px_0_#0e0917]">
                        {formatPrice(price * (line.quantity || 1))}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate(line.id)}
                        disabled={removeMutation.isPending}
                        className="text-[#a99bb5] transition-colors hover:text-[#e05275]"
                        aria-label={`Remove ${title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="comic-panel p-6">
              <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#f2edf7]">
                Select payment method
              </h2>
              <div className="mt-4 space-y-3">
                {paymentMethods.map(({ id, label, img }) => {
                  const isSelected = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`flex h-14 w-full items-center gap-4 border-2 border-[#0e0917] px-4 text-left font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#2d1544] shadow-[4px_4px_0_#e5a93c] -translate-y-0.5'
                          : 'bg-[#180e25] text-[#f2edf7] shadow-[3px_3px_0_#0e0917] hover:bg-[#231438] hover:-translate-y-0.5'
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 place-items-center border-2 border-[#0e0917] ${
                          isSelected ? 'bg-[#e5a93c]' : 'bg-[#120a1c]'
                        }`}
                      >
                        {isSelected && <span className="h-2 w-2 bg-[#0e0917]" />}
                      </span>
                      <span className="flex-1 text-sm font-bold text-[#f2edf7]">{label}</span>
                      {img && (
                        <img
                          src={img}
                          alt={label}
                          className="h-5 w-5 rounded-sm object-contain"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="comic-panel p-6">
              <h2 className="font-display text-center text-xs font-black uppercase tracking-wider text-[#f2edf7]">
                Order summary
              </h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-[#a99bb5]">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-[#f2edf7]">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-[#a99bb5]">
                  <dt>Platform fee</dt>
                  <dd className="font-semibold text-[#f2edf7]">{formatPrice(platformFee)}</dd>
                </div>
              </dl>
              <div className="mt-5 flex items-end justify-between border-t-2 border-[#0e0917] pt-5">
                <span className="font-display text-xs font-black uppercase text-[#f2edf7]">Total</span>
                <span className="font-display text-2xl font-black text-[#e5a93c] drop-shadow-[1.5px_1.5px_0_#0e0917]">
                  {formatPrice(total)}
                </span>
              </div>
              <button
                onClick={handleCompletePurchase}
                disabled={orderLines.length === 0 || checkingOut}
                className="comic-action-btn mt-6 flex h-13 w-full items-center justify-center gap-3 bg-[#e5a93c] px-5 text-[11px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checkingOut ? 'Processing checkout...' : 'Complete purchase'}{' '}
                <LockKeyhole className="h-4 w-4 stroke-[2.5]" />
              </button>
              <p className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] text-[#84788c]">
                <ShieldCheck className="h-3.5 w-3.5" /> Secured with encrypted checkout.
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
