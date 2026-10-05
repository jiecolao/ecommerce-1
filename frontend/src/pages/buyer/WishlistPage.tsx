import { useNavigate } from 'react-router-dom';
import { HeartOff, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AccountSidebar from '../../components/account/AccountSidebar';
import api from '../../lib/api';

const formatPrice = (price: number) => `P${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function WishlistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: serverWishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/buyer/wishlist');
      return res.data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (variantId: number) => {
      await api.delete(`/buyer/wishlist/${variantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err: any) => {
      alert('Failed to remove item: ' + (err.response?.data?.message || err.message));
    },
  });

  const moveToCartMutation = useMutation({
    mutationFn: async (variantId: number) => {
      await api.post('/buyer/cart/items', { productVariantId: variantId, quantity: 1 });
      await api.delete(`/buyer/wishlist/${variantId}`).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      navigate('/checkout/cart');
    },
    onError: (err: any) => {
      alert('Failed to move item to cart: ' + (err.response?.data?.message || err.message));
    },
  });

  const moveAllToCart = async () => {
    if (!Array.isArray(serverWishlist) || serverWishlist.length === 0) return;
    for (const item of serverWishlist) {
      await api.post('/buyer/cart/items', { productVariantId: item.id, quantity: 1 }).catch(() => {});
      await api.delete(`/buyer/wishlist/${item.id}`).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    navigate('/checkout/cart');
  };

  const items = Array.isArray(serverWishlist) ? serverWishlist : [];

  return (
    <div className="grid items-start gap-10 pb-10 lg:grid-cols-[270px_1fr]">
      <AccountSidebar />

      <main className="min-w-0">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="comic-kicker mb-5">Saved drops</span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="comic-title text-3xl font-black">My wishlist</h1>
              <span className="border border-[#5b4767] bg-[#211d23] px-3 py-1 font-display text-[9px] font-bold uppercase text-[#f4b72b]">{items.length} items</span>
            </div>
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={moveAllToCart} className="font-display flex h-11 items-center gap-2 bg-[#f4b72b] px-5 text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">
                <ShoppingCart className="h-4 w-4" /> Move all to cart
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 text-center font-display text-lg text-[#f4b72b]">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />
            Loading your saved drops...
          </div>
        ) : items.length > 0 ? (
          <div className="mt-9 space-y-5">
            {items.map((item: any) => {
              const product = item.product || {};
              const title = product.title || item.name || 'Digital Key';
              const price = Number(item.price || 0);
              const image = product.media?.[0] || '/palworld-cover.jpg';

              return (
                <article key={item.id} className="comic-panel grid gap-5 p-5 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:p-6">
                  <img src={image} alt={title} className="h-30 w-30 object-cover border border-[#49345d]" />
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-white">{title}</h2>
                    <p className="mt-2 text-sm text-[#a99bb5]">{item.name || 'Digital Edition'}</p>
                    <p className="font-display mt-5 text-xl font-black text-white">{formatPrice(price)}</p>
                  </div>
                  <div className="flex gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(item.id)}
                      disabled={removeMutation.isPending}
                      aria-label={`Remove ${title}`}
                      className="grid h-12 w-12 place-items-center border border-[#5b4767] bg-[#1c191f] text-[#a99bb5] hover:border-[#f4b72b] hover:text-[#f4b72b]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveToCartMutation.mutate(item.id)}
                      disabled={moveToCartMutation.isPending}
                      className="font-display h-12 min-w-40 bg-[#f4b72b] px-5 text-[9px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]"
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="comic-panel mt-9 p-12 text-center text-[#8f8398]">
            <HeartOff className="mx-auto mb-3 h-10 w-10 text-[#5b4767]" />
            Your wishlist is empty. Save games from the catalog to keep track of them.
          </div>
        )}
      </main>
    </div>
  );
}
