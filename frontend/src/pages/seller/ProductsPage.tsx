import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Product } from 'shared';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchSellerProducts = async () => {
  const { data } = await axios.get<Product[]>(`${API_URL}/seller/products`, {
    headers: { 'x-actor-id': 'demo-seller' }
  });
  return data;
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: fetchSellerProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/seller/products/${id}`, {
        headers: { 'x-actor-id': 'demo-seller' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    }
  });

  if (isLoading) return <div className="font-display py-16 text-center text-[#f4b72b]">Loading products...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="comic-kicker mb-5">Inventory</span>
          <h1 className="comic-title text-4xl font-black">Manage Keys</h1>
          <p className="mt-3 text-lg text-[#a99bb5]">Add, edit, or remove game keys.</p>
        </div>
        <Link to="/seller/products/new">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Game Key</span>
          </Button>
        </Link>
      </div>

      <div className="comic-panel overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm text-[#b9adc4]">
          <thead className="font-display border-b border-[#49345d] bg-[#22112f] text-[10px] uppercase text-[#67e8f9]">
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Stock</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map(product => (
              <tr key={product.id} className="border-b border-[#382548] bg-[#130d1b] hover:bg-[#1c1226]">
                <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-white">
                  {product.title}
                </th>
                <td className="px-6 py-4">${(product.priceCents / 100).toFixed(2)}</td>
                <td className="px-6 py-4">{product.inventoryCount}</td>
                <td className="px-6 py-4">
                  <span className={`font-display border px-2 py-1 text-[9px] font-semibold ${
                    product.status === 'PUBLISHED' ? 'border-[#22d3ee] bg-[#10252a] text-[#67e8f9]' : 'border-[#72558a] bg-[#1c1226] text-[#b9adc4]'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="sm" className="text-[#67e8f9]">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#ff5c80] hover:bg-[#2c0d18]"
                    onClick={() => {
                      if (window.confirm('Are you sure?')) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">No game keys uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
