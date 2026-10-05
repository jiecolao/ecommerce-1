import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SellerLayout from '../../components/seller/SellerLayout';
import api from '../../lib/api';
import { TableRowSkeleton } from '../../components/ui/skeleton';

type LogItem = {
  id: number;
  date: string;
  time: string;
  user: string;
  email: string;
  action: string;
  module: string;
  details: string;
  ip: string;
};

export default function ActivityLogsPage() {
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('All events');
  const [date, setDate] = useState('');

  const { data: serverLogs, isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/logs');
      return res.data;
    },
  });

  const logs: LogItem[] = useMemo(() => {
    if (!Array.isArray(serverLogs)) return [];
    return serverLogs.map((l: any) => {
      const created = l.createdAt ? new Date(l.createdAt) : new Date();
      return {
        id: l.id,
        date: created.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: created.toLocaleTimeString('en-US', { hour12: false }),
        user: l.admin?.name || 'Administrator',
        email: l.admin?.email || 'admin@mystikeys.com',
        action: l.updateAction || 'MUTATE',
        module: l.tableName || 'PRODUCT',
        details: l.description || `Action on record #${l.recordId}`,
        ip: '127.0.0.1',
      };
    });
  }, [serverLogs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = `${log.user} ${log.action} ${log.module} ${log.details}`.toLowerCase().includes(query.toLowerCase());
      const matchesModule = eventType === 'All events' || log.module.toLowerCase() === eventType.toLowerCase();
      const matchesDate = !date || log.date === new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      return matchesSearch && matchesModule && matchesDate;
    });
  }, [logs, query, eventType, date]);

  return (
    <SellerLayout pageName="Activity Logs">
      <div>
        <span className="comic-kicker mb-4">Audit trail</span>
        <h1 className="comic-title text-3xl font-black">Activity logs</h1>
        <p className="mt-3 text-sm text-[#a99bb5]">Monitor audit trails and administrative database actions.</p>
      </div>

      <section className="mt-7 flex flex-col gap-3 sm:flex-row">
        <label className="flex h-11 flex-1 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4 sm:max-w-sm">
          <Search className="h-4 w-4 text-[#f4b72b]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by action or details..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
          />
        </label>
        <select
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
          className="h-11 border border-[#5b4767] bg-[#211d23] px-4 text-sm text-white"
        >
          <option>All events</option>
          <option value="PRODUCT">Products</option>
          <option value="ORDER">Orders</option>
          <option value="SHOPPER">Shoppers</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-11 border border-[#5b4767] bg-[#211d23] px-4 text-sm text-white [color-scheme:dark] sm:ml-auto"
        />
      </section>

      <section className="mt-5 overflow-hidden border border-[#49345d] bg-[#211d23]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] uppercase text-[#a99bb5]">
              <tr>
                {['Timestamp', 'User', 'Action', 'Module', 'Details', 'Source'].map((heading) => (
                  <th key={heading} className="px-4 py-4">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#49345d]">
              {isLoading && <TableRowSkeleton columns={6} rows={6} />}
              {!isLoading && filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#29212d]">
                  <td className="px-4 py-4">
                    <p className="text-sm text-white">{log.date}</p>
                    <p className="text-[10px] text-[#8f8398]">{log.time}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{log.user}</p>
                    <p className="text-[10px] text-[#8f8398]">{log.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="bg-[#2b183c] px-3 py-1 font-display text-[8px] font-bold uppercase text-[#f4b72b]">{log.action}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#a99bb5]">{log.module}</td>
                  <td className="max-w-md px-4 py-4 text-sm text-[#b9adc4]">{log.details}</td>
                  <td className="px-4 py-4 font-mono text-xs text-[#8f8398]">{log.ip}</td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-[#a99bb5]">No activity logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-[#49345d] px-4 py-4 text-xs text-[#8f8398]">
          <span>Total events: {filtered.length}</span>
        </footer>
      </section>
    </SellerLayout>
  );
}
