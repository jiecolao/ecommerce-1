import { useMemo, useState } from 'react';
import { CircleDollarSign, CreditCard, LockKeyhole, Minus, Plus, ShieldCheck, Trash2, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type CartItem = {
  id: string;
  title: string;
  details: string;
  price: number;
  quantity: number;
};

const initialItems: CartItem[] = [
  { id: 'palworld', title: 'Palworld', details: 'REGION: GLOBAL | PC GAME KEY', price: 550, quantity: 1 },
  { id: 'game-pass', title: 'Xbox Game Pass Ultimate', details: 'REGION: GLOBAL | 1 MONTH', price: 1250, quantity: 1 },
];

const paymentMethods = [
  { id: 'gcash', label: 'GCash', icon: WalletCards },
  { id: 'maya', label: 'Maya', icon: WalletCards },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'paypal', label: 'PayPal', icon: CircleDollarSign },
] as const;

const formatPrice = (price: number) => `P${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialItems);
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const platformFee = items.length > 0 ? 12 : 0;
  const total = subtotal + platformFee;

  const updateQuantity = (id: string, amount: number) => {
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
    )));
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="pb-8">
      <div className="mb-10">
        <span className="comic-kicker mb-5">Final checkpoint</span>
        <h1 className="comic-title text-4xl font-black">Checkout</h1>
        <p className="mt-3 text-[#a99bb5]">Review your order and select a payment method to proceed.</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">
        <section className="comic-panel overflow-hidden">
          <header className="border-b border-[#49345d] bg-[#2b2130] px-6 py-5">
            <h2 className="font-display text-xs font-black uppercase text-white">Your cart ({items.length} items)</h2>
          </header>

          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="font-display text-sm font-bold uppercase text-white">Your cart is empty</p>
              <p className="mt-2 text-sm text-[#a99bb5]">Add a game from the catalog to continue.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#49345d]">
              {items.map((item) => (
                <article key={item.id} className="grid gap-5 p-5 sm:grid-cols-[112px_1fr_auto] sm:items-center sm:p-6">
                  <img src="/palworld-cover.jpg" alt="" className="h-28 w-28 object-cover" />
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1 font-display text-[9px] font-semibold text-[#a99bb5]">{item.details}</p>
                    <div className="mt-5 inline-flex h-9 border border-[#5b4767] bg-[#1c191f]">
                      <button aria-label={`Decrease ${item.title} quantity`} onClick={() => updateQuantity(item.id, -1)} className="grid w-9 place-items-center text-[#a99bb5] hover:bg-[#33253b] hover:text-white">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="grid w-11 place-items-center border-x border-[#5b4767] font-display text-xs font-bold text-white">{item.quantity}</span>
                      <button aria-label={`Increase ${item.title} quantity`} onClick={() => updateQuantity(item.id, 1)} className="grid w-9 place-items-center text-[#a99bb5] hover:bg-[#33253b] hover:text-white">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:h-full sm:flex-col sm:items-end">
                    <p className="font-display text-lg font-black text-white">{formatPrice(item.price * item.quantity)}</p>
                    <button onClick={() => removeItem(item.id)} className="flex items-center gap-2 font-display text-[9px] font-bold uppercase text-[#9f929f] hover:text-[#f4b72b]">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-7 lg:sticky lg:top-28">
          <section className="comic-panel p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center bg-[#f4b72b] font-display text-[10px] font-black text-[#171419]">1</span>
              <h2 className="font-display text-xs font-black uppercase text-white">Guest details</h2>
            </div>
            <label className="mt-6 block">
              <span className="font-display text-[9px] font-bold uppercase text-[#b9adc4]">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="john@example.com"
                className="mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 text-sm text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]"
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-[#84788c]">Your keys and digital receipts will be sent to this email address.</p>
          </section>

          <section className="comic-panel p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center bg-[#f4b72b] font-display text-[10px] font-black text-[#171419]">2</span>
              <h2 className="font-display text-xs font-black uppercase text-white">Payment channel</h2>
            </div>
            <div className="mt-6 space-y-3">
              {paymentMethods.map(({ id, label, icon: PaymentIcon }) => {
                const isSelected = paymentMethod === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex h-15 w-full items-center gap-4 border px-4 text-left transition-transform hover:-translate-y-0.5 ${
                      isSelected ? 'border-[#f4b72b] bg-[#2b183c]' : 'border-[#51405b] bg-[#211d23]'
                    }`}
                  >
                    <span className={`grid h-5 w-5 place-items-center border ${isSelected ? 'border-[#f4b72b]' : 'border-[#74677b]'}`}>
                      {isSelected && <span className="h-2.5 w-2.5 bg-[#f4b72b]" />}
                    </span>
                    <span className="flex-1 text-sm font-bold text-white">{label}</span>
                    <PaymentIcon className="h-5 w-5 text-[#f4b72b]" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="comic-panel p-6">
            <h2 className="text-center font-display text-xs font-black uppercase text-white">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-[#a99bb5]"><dt>Subtotal</dt><dd className="font-semibold text-white">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between text-[#a99bb5]"><dt>Platform fee</dt><dd className="font-semibold text-white">{formatPrice(platformFee)}</dd></div>
              <div className="flex justify-between text-[#a99bb5]"><dt>Discount code</dt><dd>None</dd></div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-[#49345d] pt-5">
              <span className="font-display text-xs font-black uppercase text-white">Total</span>
              <span className="font-display text-2xl font-black text-[#f4b72b]">{formatPrice(total)}</span>
            </div>
            <button onClick={() => navigate('/checkout/success')} disabled={items.length === 0} className="font-display mt-6 flex h-13 w-full items-center justify-center gap-3 bg-[#f4b72b] px-5 text-[11px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e] disabled:cursor-not-allowed disabled:opacity-40">
              Complete purchase <LockKeyhole className="h-4 w-4" />
            </button>
            <p className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] text-[#84788c]">
              <ShieldCheck className="h-3.5 w-3.5" /> Secured with encrypted checkout.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
