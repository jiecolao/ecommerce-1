import { useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import SellerLayout from '../../components/seller/SellerLayout';

const customers = [
  ['Juan Dela Cruz','juan.dc@email.com','Oct 24, 2026','12 orders','P18,450.00','Active'],
  ['Maria Santos','m.santos@email.com','Oct 20, 2026','4 orders','P3,210.00','Active'],
  ['Mark Thompson','mark.t@provider.net','Oct 15, 2026','1 order','P850.00','Inactive'],
  ['Elena Rossi','e.rossi@service.it','Sep 28, 2026','28 orders','P42,100.00','Active'],
  ['Kevin Durant','k.d@pro.com','Sep 22, 2026','0 orders','P0.00','Inactive'],
  ['Sarah Connor','s.connor@sky.net','Sep 18, 2026','7 orders','P8,120.00','Active'],
] as const;

export default function CustomersPage() {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('All status');
  const filtered = useMemo(() => customers.filter((customer) => `${customer[0]} ${customer[1]}`.toLowerCase().includes(query.toLowerCase()) && (status === 'All status' || customer[5] === status)), [query,status]);
  return <SellerLayout pageName="Customers">
    <div><span className="comic-kicker mb-4">User base</span><h1 className="comic-title text-3xl font-black">Customers</h1><p className="mt-3 text-sm text-[#a99bb5]">View and manage your registered customer base.</p></div>
    <section className="mt-7 grid gap-4 sm:grid-cols-3">{[['Total customers','12,482','registered users'],['New (30d)','842','+12% from last month'],['Active users','4,210','online in last 7 days']].map(([label,value,detail]) => <article key={label} className="border border-[#49345d] bg-[#252028] p-5"><p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">{label}</p><p className="font-display mt-2 text-2xl font-black text-white">{value}</p><p className="mt-1 text-xs text-[#8f8398]">{detail}</p></article>)}</section>
    <section className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="flex h-11 flex-1 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4 sm:max-w-sm"><Search className="h-4 w-4 text-[#f4b72b]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 border border-[#5b4767] bg-[#211d23] px-4 text-sm text-white"><option>All status</option><option>Active</option><option>Inactive</option></select><select className="h-11 border border-[#5b4767] bg-[#211d23] px-4 text-sm text-white sm:ml-auto"><option>Latest joined</option><option>Highest spending</option></select></section>
    <section className="mt-5 overflow-hidden border border-[#49345d] bg-[#211d23]"><div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left"><thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] uppercase text-[#a99bb5]"><tr>{['Customer','Joined date','Total orders','Total spent','Status','Actions'].map((heading) => <th key={heading} className="px-4 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#49345d]">{filtered.map((customer) => <tr key={customer[1]} className="hover:bg-[#29212d]"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center bg-[#2b183c] text-[#f4b72b]"><UserRound className="h-4 w-4" /></span><div><p className="font-semibold text-white">{customer[0]}</p><p className="text-xs text-[#8f8398]">{customer[1]}</p></div></div></td><td className="px-4 py-4 text-sm text-[#a99bb5]">{customer[2]}</td><td className="px-4 py-4 text-sm text-[#d8cedd]">{customer[3]}</td><td className="px-4 py-4 font-display text-xs font-bold text-white">{customer[4]}</td><td className="px-4 py-4"><span className={`px-3 py-1 font-display text-[8px] font-bold uppercase ${customer[5] === 'Active' ? 'bg-[#f4b72b] text-[#171419]' : 'border border-[#5b4767] bg-[#2b2130] text-[#a99bb5]'}`}>{customer[5]}</span></td><td className="px-4 py-4 text-sm font-bold text-[#f4b72b]">View / Edit</td></tr>)}</tbody></table></div><footer className="flex items-center justify-between border-t border-[#49345d] px-4 py-4 text-xs text-[#8f8398]"><span>Showing {filtered.length} of 12,482 customers</span><span className="font-display text-[9px] text-white">1 &nbsp; 2 &nbsp; 3 &nbsp; ... &nbsp; 2081</span></footer></section>
  </SellerLayout>;
}
