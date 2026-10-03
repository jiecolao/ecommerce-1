import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, CheckCircle2, CircleHelp, Copy, Eye, Headphones, Mail, RefreshCw, ShieldCheck } from 'lucide-react';

const purchasedKeys = [
  { id: 'palworld', title: 'Palworld', platform: 'Steam', key: 'PALW-7K3M-Q9TX-4R2C' },
  { id: 'game-pass', title: 'Xbox Game Pass Ultimate', platform: 'Xbox / PC', key: 'XGPU-9D4F-W7KL-2M8P' },
];

export default function OrderCompletePage() {
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const revealAndCopy = async (id: string, key: string) => {
    if (!revealedKeys[id]) {
      setRevealedKeys((current) => ({ ...current, [id]: true }));
      return;
    }

    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(id);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-10">
      <header className="py-8 text-center sm:py-12">
        <span className="mx-auto grid h-18 w-18 place-items-center border-2 border-[#f4b72b] bg-[#2b183c] text-[#f4b72b] shadow-[5px_5px_0_#2c0c46]">
          <Check className="h-8 w-8" strokeWidth={3} />
        </span>
        <h1 className="comic-title mt-8 text-3xl font-black sm:text-4xl">Order #MK-3000 Complete</h1>
        <p className="mt-3 text-[#a99bb5]">Thank you for your purchase. Your activation keys are ready.</p>
      </header>

      <section className="comic-panel flex items-center gap-4 p-5 sm:p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center border border-[#5b4767] bg-[#1c191f] text-[#f4b72b]">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold text-white">Keys sent to john@example.com</p>
          <p className="mt-1 text-sm text-[#a99bb5]">Your activation keys and receipt have also been delivered to your inbox.</p>
        </div>
      </section>

      <div className="mt-8 space-y-5">
        {purchasedKeys.map((product) => {
          const isRevealed = Boolean(revealedKeys[product.id]);
          const isCopied = copiedKey === product.id;

          return (
            <article key={product.id} className="comic-panel overflow-hidden">
              <div className="grid gap-5 p-5 sm:grid-cols-[88px_1fr_auto] sm:items-center sm:p-6">
                <img src="/palworld-cover.jpg" alt="" className="h-22 w-22 object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-black text-white">{product.title}</h2>
                    <span className="bg-[#f4b72b] px-3 py-1 font-display text-[8px] font-black uppercase text-[#171419]">Instant delivery</span>
                  </div>
                  <p className="mt-1 font-display text-[9px] font-semibold uppercase text-[#918596]">Activation key | {product.platform}</p>
                  <div className={`mt-4 flex min-h-13 items-center border border-dashed px-4 font-display text-sm font-bold tracking-[0.12em] ${isRevealed ? 'border-[#f4b72b] bg-[#2b183c] text-white' : 'border-[#5b4767] bg-[#1c191f] text-[#746b79]'}`}>
                    {isRevealed ? product.key : 'XXXX-XXXX-XXXX-XXXX'}
                  </div>
                </div>
                <button
                  onClick={() => revealAndCopy(product.id, product.key)}
                  className="font-display flex h-12 min-w-40 items-center justify-center gap-2 bg-[#f4b72b] px-5 text-[10px] font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e]"
                >
                  {isCopied ? <CheckCircle2 className="h-4 w-4" /> : isRevealed ? <Copy className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isCopied ? 'Copied' : isRevealed ? 'Copy key' : 'Reveal key'}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 border-t border-[#49345d] bg-[#211d23] px-5 py-4 text-xs text-[#9f939f]">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#f4b72b]" /> Verified key</span>
                <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-[#f4b72b]" /> One-time use</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_290px]">
        <section>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#f4b72b]" />
            <h2 className="font-display text-lg font-black uppercase text-white">How to redeem your key</h2>
          </div>
          <ol className="mt-7 space-y-7">
            {[
              ['Open the platform app', 'Launch the matching platform on your device and sign in to your account.'],
              ['Find the activation menu', 'Open the store or games menu and choose the option to activate or redeem a product.'],
              ['Enter your code', 'Copy the revealed key above, paste it into the activation field, and confirm.'],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-[#f4b72b] font-display text-xs font-black text-[#f4b72b]">{index + 1}</span>
                <div>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#a99bb5]">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="comic-panel p-6">
          <h2 className="font-display text-xs font-black uppercase text-white">Need help with your key?</h2>
          <p className="mt-4 text-sm leading-6 text-[#a99bb5]">If a code does not work, our support team can verify your order and help with activation.</p>
          <div className="mt-6 space-y-3">
            <button className="flex h-11 w-full items-center justify-center gap-2 border border-[#5b4767] bg-[#1c191f] text-sm font-bold text-white hover:border-[#f4b72b]">
              <Headphones className="h-4 w-4" /> Contact support
            </button>
            <button className="flex h-11 w-full items-center justify-center gap-2 border border-[#5b4767] bg-[#1c191f] text-sm font-bold text-white hover:border-[#f4b72b]">
              <CircleHelp className="h-4 w-4" /> Help center
            </button>
          </div>
          <Link to="/catalog" className="font-display mt-7 flex h-11 w-full items-center justify-center gap-2 bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>
        </aside>
      </div>
    </div>
  );
}
