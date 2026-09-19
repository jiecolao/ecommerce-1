import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, Download, Filter, Info, KeyRound, X } from 'lucide-react';
import AccountSidebar from '../../components/account/AccountSidebar';

type Purchase = {
  id: string;
  date: string;
  title: string;
  platform: string;
  price: number;
  status: 'Completed' | 'Refunded';
  key: string;
};

const purchases: Purchase[] = [
  { id: 'MK-3000', date: 'Oct 24, 2026', title: 'Steam Wallet Code - P250 Global', platform: 'Steam', price: 250, status: 'Completed', key: 'STMW-7K3M-Q9TX-4R2C' },
  { id: 'MK-2984', date: 'Oct 12, 2026', title: 'Elden Ring: Shadow of the Erdtree', platform: 'Steam', price: 2450, status: 'Completed', key: 'ERSE-4F8P-W2KL-9D7M' },
  { id: 'MK-2941', date: 'Sep 30, 2026', title: 'Cyberpunk 2077 - Phantom Liberty', platform: 'PC', price: 1899, status: 'Completed', key: 'CP77-9H2N-R6TX-3K8Q' },
  { id: 'MK-2907', date: 'Sep 15, 2026', title: 'Xbox Game Pass Ultimate - 3 Months', platform: 'Xbox / PC', price: 1250, status: 'Refunded', key: '' },
  { id: 'MK-2866', date: 'Aug 28, 2026', title: 'Palworld', platform: 'Steam', price: 910, status: 'Completed', key: 'PALW-2R7M-K9DX-5Q4T' },
  { id: 'MK-2813', date: 'Aug 10, 2026', title: 'PlayStation Store Gift Card P1,000', platform: 'PlayStation', price: 1000, status: 'Completed', key: 'PSN1-8M4Q-V7KL-3P2X' },
  { id: 'MK-2772', date: 'Jul 22, 2026', title: 'Mobile Legends - 1000 Diamonds', platform: 'Mobile', price: 850, status: 'Completed', key: 'MLBB-4X8P-N2DM-7R5K' },
  { id: 'MK-2701', date: 'Jun 18, 2026', title: 'Apple Gift Card $25', platform: 'Apple', price: 1450, status: 'Completed', key: 'APPL-6T9K-Q3XR-8M2W' },
  { id: 'MK-2644', date: 'May 09, 2026', title: 'Animal Crossing: New Horizons', platform: 'Nintendo', price: 2120, status: 'Completed', key: 'ACNH-5P2R-W8KM-4X7D' },
  { id: 'MK-2588', date: 'Apr 20, 2026', title: 'Genshin Impact - Blessing of the Welkin Moon', platform: 'Mobile', price: 290, status: 'Completed', key: 'GENS-7D3M-T9QK-2R6X' },
  { id: 'MK-2510', date: 'Mar 14, 2026', title: 'Helldivers 2 - Super Citizen Edition', platform: 'Steam', price: 1499, status: 'Completed', key: 'HDV2-3K8R-X5MP-9T2Q' },
  { id: 'MK-2442', date: 'Feb 02, 2026', title: 'PC Game Pass - 1 Month', platform: 'Xbox / PC', price: 589, status: 'Completed', key: 'PCGP-9Q4T-M2XR-6K8D' },
];

const PAGE_SIZE = 4;
const formatPrice = (price: number) => `P${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredPurchases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return purchases;
    return purchases.filter((purchase) =>
      `${purchase.title} ${purchase.platform} ${purchase.id}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filteredPurchases.length / PAGE_SIZE));
  const visiblePurchases = filteredPurchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSpent = purchases.filter((purchase) => purchase.status === 'Completed').reduce((sum, purchase) => sum + purchase.price, 0);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const copyKey = async () => {
    if (!selectedPurchase?.key) return;
    try {
      await navigator.clipboard.writeText(selectedPurchase.key);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid items-start gap-10 pb-10 print:block lg:grid-cols-[270px_1fr]">
      <div className="print:hidden"><AccountSidebar /></div>

      <main className="min-w-0 print:w-full">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="comic-kicker mb-5 print:hidden">Your collection</span>
            <h1 className="comic-title text-3xl font-black">Purchase history</h1>
            <p className="mt-3 text-[#a99bb5]">Manage and view all your previously purchased digital keys.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row print:hidden">
            <label className="flex h-11 min-w-0 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4 sm:w-72">
              <Filter className="h-4 w-4 text-[#f4b72b]" />
              <input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Filter by title..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#756b7b]" />
            </label>
            <button onClick={() => window.print()} className="font-display flex h-11 items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] px-5 text-[9px] font-bold uppercase text-white hover:border-[#f4b72b]">
              <Download className="h-4 w-4" /> Export PDF
            </button>
          </div>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="comic-panel p-5"><p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">Total spent</p><p className="font-display mt-2 text-xl font-black text-[#f4b72b]">{formatPrice(totalSpent)}</p></div>
          <div className="comic-panel p-5"><p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">Total keys</p><p className="font-display mt-2 text-xl font-black text-white">{purchases.length} products</p></div>
          <div className="comic-panel p-5"><p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">Active wishlist</p><p className="font-display mt-2 text-xl font-black text-white">3 games</p></div>
        </section>

        <section className="comic-panel mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] font-bold uppercase text-[#a99bb5]">
                <tr><th className="px-5 py-4">Order date</th><th className="px-5 py-4">Game / Product title</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right print:hidden">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-[#49345d]">
                {visiblePurchases.map((purchase) => (
                  <tr key={purchase.id} className="bg-[#211d23] transition-colors hover:bg-[#29212d]">
                    <td className="whitespace-nowrap px-5 py-5 text-sm text-[#a99bb5]">{purchase.date}</td>
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <img src="/palworld-cover.jpg" alt="" className="h-11 w-11 object-cover" />
                        <div><p className="font-bold text-white">{purchase.title}</p><p className="mt-1 font-display text-[8px] uppercase text-[#8f8398]">{purchase.id} | {purchase.platform}</p></div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-5 font-display text-xs font-bold text-white">{formatPrice(purchase.price)}</td>
                    <td className="px-5 py-5"><span className={`inline-flex px-3 py-1 font-display text-[8px] font-bold uppercase ${purchase.status === 'Completed' ? 'bg-[#f4b72b] text-[#171419]' : 'border border-[#5b4767] bg-[#2b2130] text-[#b9adc4]'}`}>{purchase.status}</span></td>
                    <td className="px-5 py-5 text-right print:hidden">
                      <button disabled={purchase.status === 'Refunded'} onClick={() => { setSelectedPurchase(purchase); setCopied(false); }} className="font-display h-10 min-w-24 bg-[#f4b72b] px-4 text-[8px] font-black uppercase text-[#171419] hover:bg-[#ffd45e] disabled:border disabled:border-[#49345d] disabled:bg-[#252028] disabled:text-[#756b7b]">{purchase.status === 'Refunded' ? 'Disabled' : 'View key'}</button>
                    </td>
                  </tr>
                ))}
                {visiblePurchases.length === 0 && <tr><td colSpan={5} className="px-5 py-14 text-center text-[#a99bb5]">No purchases match that search.</td></tr>}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-4 border-t border-[#49345d] bg-[#1f1b22] px-5 py-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <p className="text-xs text-[#8f8398]">Showing {visiblePurchases.length} of {filteredPurchases.length} purchases</p>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page" className="grid h-9 w-9 place-items-center border border-[#49345d] text-[#a99bb5] disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} onClick={() => setPage(pageNumber)} className={`h-9 w-9 font-display text-[9px] font-bold ${page === pageNumber ? 'bg-[#f4b72b] text-[#171419]' : 'border border-[#49345d] text-white'}`}>{pageNumber}</button>)}
              <button disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} aria-label="Next page" className="grid h-9 w-9 place-items-center border border-[#49345d] text-[#a99bb5] disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </footer>
        </section>

        <div className="mt-8 flex items-center gap-4 border border-dashed border-[#5b4767] bg-[#211d23] p-5 print:hidden">
          <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#2b183c] text-[#f4b72b]"><Info className="h-5 w-5" /></span>
          <div><p className="font-bold text-white">Looking for a specific order?</p><p className="mt-1 text-sm text-[#a99bb5]">It may still be processing. Check your email or contact support if it has taken longer than 15 minutes.</p></div>
        </div>
      </main>

      {selectedPurchase && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#0d0a0f]/80 p-5 print:hidden" role="dialog" aria-modal="true" aria-labelledby="key-dialog-title">
          <section className="comic-panel w-full max-w-lg p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><span className="comic-kicker mb-4">Verified key</span><h2 id="key-dialog-title" className="font-display text-xl font-black uppercase text-white">{selectedPurchase.title}</h2><p className="mt-2 text-sm text-[#a99bb5]">{selectedPurchase.platform} activation key</p></div>
              <button onClick={() => setSelectedPurchase(null)} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center border border-[#5b4767] text-[#a99bb5] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-7 flex min-h-16 items-center gap-3 border border-dashed border-[#f4b72b] bg-[#2b183c] px-4">
              <KeyRound className="h-5 w-5 shrink-0 text-[#f4b72b]" />
              <code className="min-w-0 flex-1 break-all font-display text-sm font-bold text-white">{selectedPurchase.key}</code>
            </div>
            <button onClick={copyKey} className="font-display mt-5 flex h-12 w-full items-center justify-center gap-2 bg-[#f4b72b] text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy activation key'}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
