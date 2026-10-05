import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import SellerLayout from '../../components/seller/SellerLayout';
import { Select } from '../../components/ui/select';

const orders = [
  { id: '#MK-1001', customer: 'Juan Dela Cruz', email: 'juan.dc@email.com', date: '2026-10-24', total: 'P1,499.00', status: 'Processing' },
  { id: '#MK-1002', customer: 'Maria Santos', email: 'm.santos@email.com', date: '2026-10-23', total: 'P910.00', status: 'Completed' },
  { id: '#MK-1003', customer: 'Mark Thompson', email: 'mark.t@provider.net', date: '2026-10-22', total: 'P2,500.00', status: 'Refunded' },
  { id: '#MK-1004', customer: 'Elena Rossi', email: 'e.rossi@service.it', date: '2026-10-22', total: 'P850.00', status: 'Completed' },
  { id: '#MK-1005', customer: 'Kevin Durant', email: 'k.d@pro.com', date: '2026-10-21', total: 'P1,200.00', status: 'Processing' },
  { id: '#MK-1006', customer: 'Sarah Connor', email: 's.connor@sky.net', date: '2026-10-21', total: 'P1,450.00', status: 'Completed' },
];

export default function SellerOrdersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All status');
  const [date, setDate] = useState('');
  const filtered = useMemo(() => orders.filter((order) => {
    const searchMatch = `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase());
    return searchMatch && (status === 'All status' || order.status === status) && (!date || order.date === date);
  }), [query, status, date]);

  const exportCsv = () => {
    const rows = [['Order ID', 'Customer', 'Email', 'Date', 'Total', 'Status'], ...filtered.map((order) => [order.id, order.customer, order.email, order.date, order.total, order.status])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mystikeys-orders.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  const badge = (value: string) => value === 'Completed' ? 'bg-[#f4b72b] text-[#171419]' : value === 'Processing' ? 'border border-[#f4b72b] bg-[#30271a] text-[#ffe29a]' : 'border border-[#74434d] bg-[#2e1d22] text-[#e1a2aa]';

  return <SellerLayout pageName="Orders">
    <div><span className="comic-kicker mb-4">Sales queue</span><h1 className="comic-title text-3xl font-black">Orders</h1><p className="mt-3 text-sm text-[#a99bb5]">Manage and track all customer purchases.</p></div>
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Total orders','1,482','lifetime'],['Pending','24','processing'],['Completed','1,390','delivered'],['Cancelled','68','refunded']].map(([label,value,detail]) => <article key={label} className="border border-[#49345d] bg-[#252028] p-5"><p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">{label}</p><p className="font-display mt-2 text-2xl font-black text-white">{value} <span className="font-sans text-xs font-normal text-[#8f8398]">{detail}</span></p></article>)}</section>
    <section className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
      <label className="flex h-11 flex-1 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4 xl:max-w-sm"><Search className="h-4 w-4 text-[#e5a93c]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by order ID or customer..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /></label>
      <Select
        value={status}
        onChange={(val) => setStatus(val)}
        options={['All status', 'Processing', 'Completed', 'Refunded']}
        className="min-w-40"
      />
      <input aria-label="Order date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 border border-[#5b4767] bg-[#211d23] px-4 text-sm text-white [color-scheme:dark]" />
      <button onClick={exportCsv} className="font-display flex h-11 items-center justify-center gap-2 border border-[#5b4767] bg-[#211d23] px-5 text-[9px] font-bold uppercase text-white hover:border-[#e5a93c] xl:ml-auto"><Download className="h-4 w-4" /> Export CSV</button>
    </section>
    <section className="mt-5 overflow-hidden border border-[#49345d] bg-[#211d23]"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] uppercase text-[#a99bb5]"><tr>{['Order ID','Customer','Date','Total','Status','Actions'].map((heading) => <th key={heading} className="px-4 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#49345d]">{filtered.map((order) => <tr key={order.id} className="hover:bg-[#29212d]"><td className="px-4 py-5 font-display text-xs font-bold text-white">{order.id}</td><td className="px-4 py-5"><p className="font-semibold text-white">{order.customer}</p><p className="mt-1 text-xs text-[#8f8398]">{order.email}</p></td><td className="px-4 py-5 text-sm text-[#a99bb5]">{order.date}</td><td className="px-4 py-5 font-display text-xs font-bold text-white">{order.total}</td><td className="px-4 py-5"><span className={`px-3 py-1 font-display text-[8px] font-bold uppercase ${badge(order.status)}`}>{order.status}</span></td><td className="px-4 py-5 text-sm font-bold text-[#f4b72b]">View / Edit</td></tr>)}{filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-[#a99bb5]">No orders match those filters.</td></tr>}</tbody></table></div><footer className="flex items-center justify-between border-t border-[#49345d] px-4 py-4 text-xs text-[#8f8398]"><span>Showing {filtered.length} of 1,482 orders</span><span className="font-display text-[9px] text-white">1 &nbsp; 2 &nbsp; 3 &nbsp; ... &nbsp; 248</span></footer></section>
  </SellerLayout>;
}
