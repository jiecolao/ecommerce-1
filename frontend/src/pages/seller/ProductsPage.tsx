import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Product } from 'shared';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchSellerProducts = async () => {
  const { data } = await axios.get<Product[]>(`${API_URL}/seller/products`, {
    headers: { 'x-actor-id': '22222222-2222-2222-2222-222222222222' }
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
    mutationFn: async (id: number) => {
      await axios.delete(`${API_URL}/seller/products/${id}`, {
        headers: { 'x-actor-id': '22222222-2222-2222-2222-222222222222' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading products...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Manage Products</h1>
          <p className="mt-2 text-lg text-slate-600">Add, edit, or remove your products.</p>
        </div>
        <Link to="/seller/products/new">
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Developer</th>
              <th scope="col" className="px-6 py-3">Publisher</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map(product => (
              <tr key={product.id} className="bg-white border-b hover:bg-slate-50">
                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                  {product.title}
                </th>
                <td className="px-6 py-4">{product.developer || '-'}</td>
                <td className="px-6 py-4">{product.publisher || '-'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                <td colSpan={5} className="px-6 py-8 text-center">No products uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
