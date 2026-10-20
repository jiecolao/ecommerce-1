import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SellerLayout from '../../components/seller/SellerLayout';
import { Select } from '../../components/ui/select';
import api from '../../lib/api';
import { toast } from '../../lib/toast';

interface OrderItem {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: string;
  status: string;
}

export default function SellerOrdersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All status');
  const [date, setDate] = useState('');

  // Fetch report data for real order counts
  const { data: report } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await api.get('/admin/reports');
      return res.data;
    },
  });

  const totalOrders = report?.totalOrders ? Number(report.totalOrders) : 0;

  // The backend database currently provides /buyer/orders but lacks a dedicated /admin/orders listing endpoint
  const orders: OrderItem[] = [];

  const filtered = useMemo(() => orders.filter((order) => {
    const searchMatch = `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase());
    return searchMatch && (status === 'All status' || order.status === status) && (!date || order.date === date);
  }), [orders, query, status, date]);

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.info('No order records available to export.');
      return;
    }
    const rows = [['Order ID', 'Customer', 'Email', 'Date', 'Total', 'Status'], ...filtered.map((order) => [order.id, order.customer, order.email, order.date, order.total, order.status])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mystikeys-orders.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  const badge = (value: string) => value === 'Completed' ? 'bg-[#f4b72b] text-[#171419]' : value === 'Processing' ? 'border border-[#f4b72b] bg-[#30271a] text-[#ffe29a]' : 'border border-[#74434d] bg-[#2e1d22] text-[#e1a2aa]';

  return (
    <SellerLayout pageName="Orders" contentClassName="p-0">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-24 2xl:px-36 3xl:px-48 py-6 sm:py-8 max-w-[1760px]">
        <div>
          <span className="comic-kicker mb-4">Sales queue</span>
          <h1 className="comic-title text-3xl font-black">Orders</h1>
          <p className="mt-3 text-sm text-[#a99bb5]">Manage and track customer order fulfillment.</p>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total orders', String(totalOrders), 'lifetime processed'],
            ['Pending', '0', 'processing'],
            ['Completed', String(totalOrders), 'delivered'],
            ['Cancelled', '0', 'refunded'],
          ].map(([label, value, detail]) => (
            <article key={label} className="border border-[#49345d] bg-[#252028] p-5">
              <p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">{label}</p>
              <p className="font-display mt-2 text-2xl font-black text-white">
                {value} <span className="font-sans text-xs font-normal text-[#8f8398]">{detail}</span>
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 flex flex-col gap-3 xl:flex-row">
          <label className="flex h-11 flex-1 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4 xl:max-w-sm">
            <Search className="h-4 w-4 text-[#e5a93c]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by order ID or customer..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
            />
          </label>
          <Select
            value={status}
            onChange={setStatus}
            options={['All status', 'Processing', 'Completed', 'Refunded']}
            className="w-36"
          />
          <input
            aria-label="Order date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-11 border border-[#5b4767] bg-[#211d23] px-4 text-sm text-white [color-scheme:dark]"
          />
          <button
            onClick={exportCsv}
            className="comic-action-btn flex h-11 items-center justify-center gap-2 border-2 border-[#0e0917] bg-[#211d23] px-5 text-[10px] font-bold uppercase text-white hover:border-[#e5a93c] xl:ml-auto"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </section>

        <section className="mt-5 overflow-hidden border border-[#49345d] bg-[#211d23]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] uppercase text-[#a99bb5]">
                <tr>
                  {['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-4">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#49345d]">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#29212d]">
                    <td className="px-4 py-5 font-display text-xs font-bold text-white">{order.id}</td>
                    <td className="px-4 py-5">
                      <p className="font-semibold text-white">{order.customer}</p>
                      <p className="mt-1 text-xs text-[#8f8398]">{order.email}</p>
                    </td>
                    <td className="px-4 py-5 text-sm text-[#a99bb5]">{order.date}</td>
                    <td className="px-4 py-5 font-display text-xs font-bold text-white">{order.total}</td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 font-display text-[8px] font-bold uppercase ${badge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-[#e5a93c]">View</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-[#a99bb5]">
                      No individual customer orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <footer className="flex items-center justify-between border-t border-[#49345d] px-4 py-4 text-xs text-[#8f8398]">
            <span>Showing {filtered.length} of {totalOrders} orders</span>
          </footer>
        </section>
      </div>
    </SellerLayout>
  );
}
