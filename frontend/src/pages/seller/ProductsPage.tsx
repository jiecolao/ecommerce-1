import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { Select } from '../../components/ui/select';

type ManagedProduct = {
  id: number;
  title: string;
  sku: string;
  category: 'Game Keys' | 'Top-Ups' | 'Subscriptions' | 'Gift Cards';
  price: string;
  stock: number;
  status: 'Active' | 'Low stock' | 'Out of stock' | 'Draft';
};

const products: ManagedProduct[] = [
  { id: 1, title: 'Helldivers 2 - Super Citizen Edition', sku: 'MK-GK-001', category: 'Game Keys', price: 'P1,499.00', stock: 84, status: 'Active' },
  { id: 2, title: 'PSN Gift Card P1,000 (Philippines)', sku: 'MK-TU-014', category: 'Top-Ups', price: 'P910.00', stock: 156, status: 'Active' },
  { id: 3, title: 'Xbox Game Pass Ultimate - 3 Months', sku: 'MK-SB-008', category: 'Subscriptions', price: 'P1,250.00', stock: 9, status: 'Low stock' },
  { id: 4, title: 'Mobile Legends: 1000 Diamonds', sku: 'MK-TU-027', category: 'Top-Ups', price: 'P850.00', stock: 0, status: 'Out of stock' },
  { id: 5, title: 'Cyberpunk 2077: Phantom Liberty', sku: 'MK-GK-032', category: 'Game Keys', price: 'P1,899.00', stock: 41, status: 'Active' },
  { id: 6, title: 'Apple Gift Card $25 (US Region)', sku: 'MK-GC-019', category: 'Gift Cards', price: 'P1,450.00', stock: 22, status: 'Draft' },
];

const stats = [
  { label: 'Total products', value: '240', detail: 'all listings' },
  { label: 'Active', value: '218', detail: 'published' },
  { label: 'Low stock', value: '12', detail: 'needs attention' },
  { label: 'Out of stock', value: '10', detail: 'unavailable' },
];

export default function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState('All status');

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.title} ${product.sku}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All categories' || product.category === category;
    const matchesStatus = status === 'All status' || product.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  }), [query, category, status]);

  const statusClass = (productStatus: ManagedProduct['status']) => {
    if (productStatus === 'Active') return 'bg-[#f4b72b] text-[#171419]';
    if (productStatus === 'Low stock') return 'border border-[#f4b72b] bg-[#30271a] text-[#ffe29a]';
    if (productStatus === 'Out of stock') return 'border border-[#74434d] bg-[#2e1d22] text-[#e1a2aa]';
    return 'border border-[#5b4767] bg-[#2b2130] text-[#b9adc4]';
  };

  return (
    <SellerLayout pageName="Products" contentClassName="p-0">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-24 2xl:px-36 3xl:px-48 py-6 sm:py-8 max-w-[1760px]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="comic-kicker mb-4">Store inventory</span><h1 className="comic-title text-3xl font-black">Products</h1><p className="mt-3 text-sm text-[#a99bb5]">Manage every product available on the MystiKeys store.</p></div>
          <Link to="/seller/products/new" className="comic-action-btn flex h-11 items-center justify-center gap-2 bg-[#e5a93c] px-5 text-[10px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849]"><Plus className="h-4 w-4" /> Add product</Link>
        </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <article key={stat.label} className="border border-[#49345d] bg-[#252028] p-5"><p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">{stat.label}</p><div className="mt-2 flex items-end gap-2"><strong className="font-display text-2xl font-black text-white">{stat.value}</strong><span className="pb-1 text-xs text-[#8f8398]">{stat.detail}</span></div></article>)}
      </section>

      <section className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4 xl:max-w-sm"><Search className="h-4 w-4 text-[#e5a93c]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name or SKU..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#756b7b]" /></label>
        <Select
          value={category}
          onChange={(val) => setCategory(val)}
          options={['All categories', 'Game Keys', 'Top-Ups', 'Subscriptions', 'Gift Cards']}
          className="min-w-44"
        />
        <Select
          value={status}
          onChange={(val) => setStatus(val)}
          options={['All status', 'Active', 'Low stock', 'Out of stock', 'Draft']}
          className="min-w-36"
        />
        <Select
          defaultValue="Newest first"
          options={['Newest first', 'Oldest first', 'Stock: Low to high']}
          ariaLabel="Sort products"
          className="min-w-44 xl:ml-auto"
        />
      </section>

      <section className="mt-5 overflow-hidden border border-[#49345d] bg-[#211d23]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] font-bold uppercase text-[#a99bb5]"><tr><th className="px-4 py-4">Product</th><th className="px-4 py-4">SKU</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Price</th><th className="px-4 py-4">Stock</th><th className="px-4 py-4">Status</th><th className="px-4 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#49345d]">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#29212d]"><td className="px-4 py-5 font-semibold text-white">{product.title}</td><td className="px-4 py-5 text-sm text-[#a99bb5]">{product.sku}</td><td className="px-4 py-5 text-sm text-[#a99bb5]">{product.category}</td><td className="px-4 py-5 font-display text-xs font-bold text-white">{product.price}</td><td className="px-4 py-5 text-sm text-[#d8cedd]">{product.stock}</td><td className="px-4 py-5"><span className={`inline-flex px-3 py-1 font-display text-[8px] font-bold uppercase ${statusClass(product.status)}`}>{product.status}</span></td><td className="px-4 py-5"><div className="flex justify-end gap-2"><Link to={`/seller/products/${product.id}/edit`} aria-label={`Edit ${product.title}`} className="grid h-9 w-9 place-items-center border border-[#5b4767] text-[#b9adc4] hover:border-[#f4b72b] hover:text-[#f4b72b]"><Pencil className="h-4 w-4" /></Link><button aria-label={`More actions for ${product.title}`} className="grid h-9 w-9 place-items-center border border-[#5b4767] text-[#b9adc4] hover:border-[#f4b72b] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></div></td></tr>
              ))}
              {filteredProducts.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-[#a99bb5]">No products match those filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-col gap-4 border-t border-[#49345d] bg-[#1f1b22] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#8f8398]">Showing {filteredProducts.length} of 240 products</p><div className="flex items-center gap-2"><button className="grid h-8 w-8 place-items-center border border-[#49345d] text-[#756b7b]"><ChevronLeft className="h-4 w-4" /></button><button className="h-8 w-8 bg-[#f4b72b] font-display text-[9px] font-black text-[#171419]">1</button><button className="h-8 w-8 border border-[#49345d] font-display text-[9px] text-white">2</button><button className="h-8 w-8 border border-[#49345d] font-display text-[9px] text-white">3</button><span className="px-1 text-[#8f8398]">...</span><button className="h-8 w-8 border border-[#49345d] font-display text-[9px] text-white">40</button><button className="grid h-8 w-8 place-items-center border border-[#49345d] text-white"><ChevronRight className="h-4 w-4" /></button></div></footer>
      </section>
      </div>
    </SellerLayout>
  );
}
