import { useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import SellerLayout from '../../components/seller/SellerLayout';
import { Select } from '../../components/ui/select';

type CustomerItem = {
  name: string;
  email: string;
  joinedDate: string;
  totalOrders: string;
  totalSpent: string;
  status: 'Active' | 'Inactive';
};

export default function CustomersPage() {
  const [customers] = useState<CustomerItem[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All status');
  const [sortOrder, setSortOrder] = useState('Latest joined');

  const filtered = useMemo(() => customers.filter((customer) => {
    const matchesSearch = `${customer.name} ${customer.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === 'All status' || customer.status === status;
    return matchesSearch && matchesStatus;
  }), [customers, query, status]);

  return (
    <SellerLayout pageName="Customers" contentClassName="p-0">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-24 2xl:px-36 3xl:px-48 py-6 sm:py-8 max-w-[1760px]">
        <div>
          <span className="comic-kicker mb-4">User base</span>
          <h1 className="comic-title text-3xl font-black">Customers</h1>
          <p className="mt-3 text-sm text-[#a99bb5]">View and manage your registered customer base.</p>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ['Total customers', String(customers.length), 'registered users'],
            ['New (30d)', '0', 'last 30 days'],
            ['Active users', '0', 'online in last 7 days'],
          ].map(([label, value, detail]) => (
            <article key={label} className="border border-[#49345d] bg-[#252028] p-5">
              <p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">{label}</p>
              <p className="font-display mt-2 text-2xl font-black text-white">{value}</p>
              <p className="mt-1 text-xs text-[#8f8398]">{detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="flex h-11 flex-1 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4 sm:max-w-sm">
            <Search className="h-4 w-4 text-[#e5a93c]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
            />
          </label>
          <Select
            value={status}
            onChange={setStatus}
            options={['All status', 'Active', 'Inactive']}
            className="w-36"
          />
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            options={['Latest joined', 'Highest spending']}
            className="w-44 sm:ml-auto"
          />
        </section>

        <section className="mt-5 overflow-hidden border border-[#49345d] bg-[#211d23]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] uppercase text-[#a99bb5]">
                <tr>
                  {['Customer', 'Joined date', 'Total orders', 'Total spent', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-4">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#49345d]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#8f8398]">
                      No customers found. Customer listing is currently unavailable from the backend.
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.email} className="hover:bg-[#29212d]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center bg-[#2b183c] text-[#e5a93c]">
                            <UserRound className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-white">{customer.name}</p>
                            <p className="text-xs text-[#8f8398]">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#a99bb5]">{customer.joinedDate}</td>
                      <td className="px-4 py-4 text-sm text-[#d8cedd]">{customer.totalOrders}</td>
                      <td className="px-4 py-4 font-display text-xs font-bold text-white">{customer.totalSpent}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 font-display text-[8px] font-bold uppercase ${customer.status === 'Active' ? 'bg-[#f4b72b] text-[#171419]' : 'border border-[#5b4767] bg-[#2b2130] text-[#a99bb5]'}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#e5a93c]">View / Edit</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="flex items-center justify-between border-t border-[#49345d] px-4 py-4 text-xs text-[#8f8398]">
            <span>Showing {filtered.length} of {customers.length} customers</span>
            <span className="font-display text-[9px] text-white">1</span>
          </footer>
        </section>
      </div>
    </SellerLayout>
  );
}
