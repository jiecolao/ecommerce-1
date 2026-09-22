import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import type { Product } from 'shared';
import { Button } from '../../components/ui/button';
import { ShoppingCart, KeyRound } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchProduct = async (id: string) => {
  const { data } = await axios.get<Product>(`${API_URL}/catalog/products/${id}`);
  return data;
};

export default function ProductDetailsPageOriginal() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center py-10">Loading game details...</div>;
  if (error || !product) return <div className="text-center py-10 text-red-500">Failed to load product.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-slate-200 rounded-xl aspect-square flex items-center justify-center p-8">
          <KeyRound className="w-32 h-32 text-slate-400" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{product.title}</h1>
          <p className="mt-4 text-3xl text-slate-900 font-bold">${(product.priceCents / 100).toFixed(2)}</p>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-900">Description</h3>
            <div className="mt-2 prose prose-sm text-slate-500">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.inventoryCount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {product.inventoryCount > 0 ? `${product.inventoryCount} keys in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="mt-10 flex space-x-4">
            <Link to={`/test/checkout/${product.id}`} className="flex-1">
              <Button
                size="lg"
                className="w-full flex items-center justify-center space-x-2"
                disabled={product.inventoryCount <= 0}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Buy Now</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
