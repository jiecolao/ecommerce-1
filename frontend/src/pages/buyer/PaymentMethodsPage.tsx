import { useState } from 'react';
import { Check, CircleDollarSign, CreditCard, Info, Plus, QrCode, ShieldCheck, Smartphone, Trash2, WalletCards, X } from 'lucide-react';
import AccountSidebar from '../../components/account/AccountSidebar';

type PaymentMethod = {
  id: number;
  name: string;
  details: string;
  type: 'wallet' | 'card';
  isDefault: boolean;
};

const initialMethods: PaymentMethod[] = [
  { id: 1, name: 'GCash', details: 'Phone number: **** 1234', type: 'wallet', isDefault: true },
  { id: 2, name: 'Visa card', details: '**** **** **** 5678 | Expires 12/28', type: 'card', isDefault: false },
  { id: 3, name: 'Maya', details: 'Phone number: **** 5678', type: 'wallet', isDefault: false },
];

const channels = [
  { name: 'GCash', icon: WalletCards },
  { name: 'Maya', icon: Smartphone },
  { name: 'PayPal', icon: CircleDollarSign },
  { name: 'Visa / MC', icon: CreditCard },
  { name: 'QR PH', icon: QrCode },
  { name: 'G / A Pay', icon: Smartphone },
];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState(initialMethods);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [methodType, setMethodType] = useState<'GCash' | 'Maya' | 'Visa card'>('GCash');
  const [accountEnding, setAccountEnding] = useState('');

  const setDefault = (id: number) => {
    setMethods((current) => current.map((method) => ({ ...method, isDefault: method.id === id })));
  };

  const removeMethod = (id: number) => {
    setMethods((current) => {
      const next = current.filter((method) => method.id !== id);
      if (next.length > 0 && !next.some((method) => method.isDefault)) next[0] = { ...next[0], isDefault: true };
      return next;
    });
  };

  const addMethod = (event: React.FormEvent) => {
    event.preventDefault();
    const digits = accountEnding.replace(/\D/g, '').slice(-4).padStart(4, '0');
    const isCard = methodType === 'Visa card';
    setMethods((current) => [
      ...current,
      {
        id: Date.now(),
        name: methodType,
        details: isCard ? `**** **** **** ${digits} | Expires 12/28` : `Phone number: **** ${digits}`,
        type: isCard ? 'card' : 'wallet',
        isDefault: current.length === 0,
      },
    ]);
    setAccountEnding('');
    setShowAddMethod(false);
  };

  return (
    <div className="grid items-start gap-10 pb-10 lg:grid-cols-[270px_1fr]">
      <AccountSidebar />

      <main className="min-w-0">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="comic-kicker mb-5">Fast checkout</span>
            <h1 className="comic-title text-3xl font-black">Payment methods</h1>
            <p className="mt-3 text-[#a99bb5]">Manage saved payment channels for faster checkout.</p>
          </div>
          <button onClick={() => setShowAddMethod(true)} className="font-display flex h-12 items-center justify-center gap-2 border border-[#f4b72b] bg-[#211d23] px-5 text-[10px] font-black uppercase text-white hover:bg-[#f4b72b] hover:text-[#171419]">
            <Plus className="h-4 w-4" /> Add payment method
          </button>
        </div>

        <section className="mt-9 space-y-5">
          {methods.length === 0 ? (
            <div className="border border-dashed border-[#5b4767] bg-[#211d23] px-6 py-14 text-center text-[#a99bb5]">No saved payment methods.</div>
          ) : methods.map((method) => {
            const MethodIcon = method.type === 'card' ? CreditCard : WalletCards;
            return (
              <article key={method.id} className="comic-panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center bg-[#2b183c] text-[#f4b72b]"><MethodIcon className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-black text-white">{method.name}</h2>
                    {method.isDefault && <span className="flex items-center gap-1 bg-[#f4b72b] px-3 py-1 font-display text-[8px] font-black uppercase text-[#171419]"><Check className="h-3 w-3" /> Default</span>}
                  </div>
                  <p className="mt-2 text-sm text-[#a99bb5]">{method.details}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!method.isDefault && <button onClick={() => setDefault(method.id)} className="h-10 px-3 text-sm font-bold text-[#d8cedd] underline underline-offset-4 hover:text-[#f4b72b]">Set as default</button>}
                  <button onClick={() => removeMethod(method.id)} aria-label={`Remove ${method.name}`} className="grid h-10 w-10 place-items-center border border-[#5b4767] bg-[#1c191f] text-[#a99bb5] hover:border-[#f4b72b] hover:text-[#f4b72b]"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-[10px] font-black uppercase text-[#a99bb5]">Supported payment channels at checkout</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {channels.map(({ name, icon: ChannelIcon }) => (
              <div key={name} className="flex min-h-28 flex-col items-center justify-center gap-3 border border-[#49345d] bg-[#211d23] text-center">
                <ChannelIcon className="h-6 w-6 text-[#f4b72b]" />
                <span className="text-xs font-bold text-[#b9adc4]">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 space-y-5">
          <div className="flex items-center gap-4 border border-dashed border-[#5b4767] bg-[#211d23] p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-[#2b183c] text-[#f4b72b]"><ShieldCheck className="h-5 w-5" /></span>
            <div><p className="font-bold text-white">Encrypted and secure payments</p><p className="mt-1 text-sm text-[#a99bb5]">Payment credentials are represented here for the prototype and are never sent to a backend.</p></div>
          </div>
          <div className="flex items-center gap-4 border border-[#49345d] bg-[#252028] p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-[#2b183c] text-[#f4b72b]"><Info className="h-5 w-5" /></span>
            <div><p className="font-bold text-white">Need help updating your account?</p><p className="mt-1 text-sm text-[#a99bb5]">Contact support@mystikeys.example</p></div>
          </div>
        </div>
      </main>

      {showAddMethod && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#0d0a0f]/80 p-5" role="dialog" aria-modal="true" aria-labelledby="add-payment-title">
          <form onSubmit={addMethod} className="comic-panel w-full max-w-md p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><span className="comic-kicker mb-4">New channel</span><h2 id="add-payment-title" className="font-display text-xl font-black uppercase text-white">Add payment method</h2></div>
              <button type="button" onClick={() => setShowAddMethod(false)} aria-label="Close" className="grid h-10 w-10 place-items-center border border-[#5b4767] text-[#a99bb5] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <label className="mt-7 block font-display text-[10px] font-bold uppercase text-[#b9adc4]">
              Method
              <select value={methodType} onChange={(event) => setMethodType(event.target.value as typeof methodType)} className="mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 text-sm text-white outline-none focus:border-[#f4b72b]">
                <option>GCash</option><option>Maya</option><option>Visa card</option>
              </select>
            </label>
            <label className="mt-5 block font-display text-[10px] font-bold uppercase text-[#b9adc4]">
              Last four digits
              <input value={accountEnding} onChange={(event) => setAccountEnding(event.target.value)} inputMode="numeric" maxLength={4} required placeholder="1234" className="mt-2 h-12 w-full border border-[#5b4767] bg-[#1c191f] px-4 text-sm text-white outline-none placeholder:text-[#756b7b] focus:border-[#f4b72b]" />
            </label>
            <button className="font-display mt-7 h-12 w-full bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">Save payment method</button>
          </form>
        </div>
      )}
    </div>
  );
}
