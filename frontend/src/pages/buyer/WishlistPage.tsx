import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartOff, ShoppingCart, Trash2 } from 'lucide-react';
import AccountSidebar from '../../components/account/AccountSidebar';

const initialWishlist = [
  { id: 'palworld', title: 'Palworld', details: 'Steam | Global', price: 'P910.00', action: 'Add to cart' },
  { id: 'robux', title: 'Robux - 1,000 R$', details: 'Roblox top-up', price: 'P680.00', action: 'Select amount / Buy', hot: true },
  { id: 'xbox-game-pass', title: 'Xbox PC Game Pass', details: 'Xbox / PC | 300+ Games', price: 'P1,250.00', action: 'Add to cart' },
];

export default function WishlistPage() {
  const [items, setItems] = useState(initialWishlist);
  const navigate = useNavigate();

  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const moveToCart = () => navigate('/checkout/cart');

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
              <button onClick={() => setItems([])} className="h-11 px-3 text-sm font-bold text-[#a99bb5] underline underline-offset-4 hover:text-[#f4b72b]">Clear wishlist</button>
              <button onClick={moveToCart} className="font-display flex h-11 items-center gap-2 bg-[#f4b72b] px-5 text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">
                <ShoppingCart className="h-4 w-4" /> Move all to cart
              </button>
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-9 space-y-5">
            {items.map((item) => (
              <article key={item.id} className="comic-panel grid gap-5 p-5 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:p-6">
                <img src="/palworld-cover.jpg" alt="" className="h-30 w-30 object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-white">{item.title}</h2>
                    {item.hot && <span className="bg-[#f4b72b] px-2 py-1 font-display text-[8px] font-black uppercase text-[#171419]">Hot</span>}
                  </div>
                  <p className="mt-2 text-sm text-[#a99bb5]">{item.details}</p>
                  <p className="font-display mt-5 text-xl font-black text-white">{item.price}</p>
                </div>
                <div className="flex gap-3 sm:justify-end">
                  <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.title}`} className="grid h-12 w-12 place-items-center border border-[#5b4767] bg-[#1c191f] text-[#a99bb5] hover:border-[#f4b72b] hover:text-[#f4b72b]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button onClick={moveToCart} className="font-display h-12 min-w-40 bg-[#f4b72b] px-5 text-[9px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">{item.action}</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="mt-9 border border-dashed border-[#5b4767] bg-[#211d23] px-6 py-20 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center bg-[#2b183c] text-[#f4b72b]"><HeartOff className="h-7 w-7" /></span>
            <h2 className="font-display mt-7 text-xl font-black uppercase text-white">Your wishlist is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#a99bb5]">Explore the catalog and save the games, subscriptions, and top-ups you want to revisit.</p>
            <Link to="/catalog" className="font-display mt-7 inline-flex h-11 items-center bg-[#f4b72b] px-6 text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">Explore catalog</Link>
          </section>
        )}
      </main>
    </div>
  );
}
