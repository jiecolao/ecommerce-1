import { useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, RefreshCw, Search, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SellerLayout from '../../components/seller/SellerLayout';
import api from '../../lib/api';
import { toast } from '../../lib/toast';
import { TableRowSkeleton } from '../../components/ui/skeleton';
import { Select } from '../../components/ui/select';

type ManagedProduct = {
  id: number;
  title: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  isFeatured: boolean;
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: serverProducts, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('/admin/products');
      if (!Array.isArray(res.data)) throw new Error('Invalid products response.');
      return res.data;
    },
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.info('Product listing deleted.');
    },
    onError: () => {
      // api interceptor displays toast
    },
  });

  const products: ManagedProduct[] = useMemo(() => {
    if (!Array.isArray(serverProducts)) return [];
    return serverProducts.map((p: any) => {
      const firstVariant = p.productVariants?.[0];
      const priceNum = Number(firstVariant?.price || 0);
      return {
        id: p.id,
        title: p.title,
        sku: `MK-PRD-${p.id}`,
        category: 'Game Keys',
        price: `₱${priceNum.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        stock: firstVariant?._count?.keys ?? firstVariant?.keys?.length ?? 0,
        status: p.status || 'ACTIVE',
        isFeatured: Boolean(p.isFeatured),
      };
    });
  }, [serverProducts]);

  const stats = [
    { label: 'Total products', value: isError ? '—' : String(products.length), detail: 'all listings' },
    { label: 'Active', value: isError ? '—' : String(products.filter(p => p.status === 'ACTIVE').length), detail: 'published' },
    { label: 'Draft', value: isError ? '—' : String(products.filter(p => p.status === 'DRAFT').length), detail: 'unpublished' },
    { label: 'Inactive', value: isError ? '—' : String(products.filter(p => p.status === 'INACTIVE').length), detail: 'disabled' },
  ];

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.title} ${product.sku}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter;
    return matchesQuery && matchesStatus;
  }), [products, query, statusFilter]);

  const statusClass = (status: ManagedProduct['status']) => {
    if (status === 'ACTIVE') return 'bg-[#f4b72b] text-[#171419]';
    if (status === 'DRAFT') return 'border border-[#5b4767] bg-[#2b2130] text-[#b9adc4]';
    return 'border border-[#74434d] bg-[#2e1d22] text-[#e1a2aa]';
  };

  return (
    <SellerLayout pageName="Products" contentClassName="p-0">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-24 2xl:px-36 3xl:px-48 py-6 sm:py-8 max-w-[1760px]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="comic-kicker mb-4">Store inventory</span>
            <h1 className="comic-title text-3xl font-black">Products</h1>
            <p className="mt-3 text-sm text-[#a99bb5]">Manage products and listings on the MystiKeys store.</p>
          </div>
          <Link
            to="/admin/products/new"
            className="comic-action-btn flex h-11 items-center justify-center gap-2 bg-[#e5a93c] px-5 text-[10px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849]"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="border border-[#49345d] bg-[#252028] p-5">
              <p className="font-display text-[8px] font-bold uppercase text-[#8f8398]">{stat.label}</p>
              <div className="mt-2 flex items-end gap-2">
                <strong className="font-display text-2xl font-black text-white">{stat.value}</strong>
                <span className="pb-1 text-xs text-[#8f8398]">{stat.detail}</span>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-7 border border-[#49345d] bg-[#1c191f]">
          <div className="flex flex-col gap-4 border-b border-[#49345d] p-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex h-11 flex-1 items-center gap-3 border border-[#5b4767] bg-[#211d23] px-4">
              <Search className="h-4 w-4 text-[#8f8398]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by title or SKU..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#756b7b]"
              />
            </label>
            <div className="flex gap-3">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'ALL', label: 'All status' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
                className="w-36"
              />
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[#49345d] bg-[#2b2130] font-display text-[8px] font-bold uppercase text-[#a99bb5]">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#49345d]">
              {isLoading && <TableRowSkeleton columns={5} rows={6} />}
              {!isLoading && isError && (
                <tr>
                  <td colSpan={5} className="px-5 py-12">
                    <div className="mx-auto flex max-w-md flex-col items-center text-center">
                      <AlertTriangle className="h-7 w-7 text-[#ff8b97]" />
                      <p className="mt-3 font-display text-xs font-black uppercase text-white">Could not load products</p>
                      <p className="mt-2 text-sm text-[#a99bb5]">The catalog request failed. Try fetching the list again.</p>
                      <button
                        type="button"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                        className="comic-action-btn mt-5 flex h-10 items-center gap-2 bg-[#e5a93c] px-4 text-[9px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849] disabled:cursor-wait disabled:opacity-60"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filteredProducts.map((product) => (
                <tr key={product.id} className="bg-[#211d23] hover:bg-[#27212a]">
                  <td className="px-5 py-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <span>{product.title}</span>
                      {product.isFeatured && (
                        <span className="inline-flex items-center gap-1 bg-[#e5a93c] px-2 py-1 font-display text-[7px] font-black uppercase text-[#0e0917]">
                          <Star className="h-3 w-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#a99bb5]">{product.sku}</td>
                  <td className="px-5 py-4 font-display font-bold text-white">{product.price}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 font-display text-[8px] font-bold uppercase ${statusClass(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        aria-label={`Edit ${product.title}`}
                        className="grid h-9 w-9 place-items-center border border-[#5b4767] text-[#b9adc4] transition-colors hover:border-[#f4b72b] hover:text-[#f4b72b]"
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete product "${product.title}"?`)) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="grid h-9 w-9 place-items-center border border-[#5b4767] text-[#a99bb5] transition-colors hover:border-[#ff6f7d] hover:text-[#ff6f7d]"
                        title="Delete product"
                        aria-label={`Delete ${product.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !isError && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#8f8398]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </SellerLayout>
  );
}
