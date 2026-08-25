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

export default function ProductDetailsPage() {
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
          {product.media && product.media.length > 0 ? (
             <img src={product.media[0]} alt={product.title} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <KeyRound className="w-32 h-32 text-slate-400" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{product.title}</h1>
          <p className="mt-4 text-3xl text-slate-900 font-bold">
            ${((product.productVariants?.[0]?.price ?? 1000) / 100).toFixed(2)}
          </p>
          
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-900">Description</h3>
            <div className="mt-2 prose prose-sm text-slate-500">
              <p>{product.description}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="flex flex-col space-y-2">
              {product.developer && <span className="text-sm">Developer: <span className="font-semibold">{product.developer}</span></span>}
              {product.publisher && <span className="text-sm">Publisher: <span className="font-semibold">{product.publisher}</span></span>}
            </div>
          </div>

          <div className="mt-10 flex space-x-4">
            <Link to={`/checkout/${product.id}`} className="flex-1">
              <Button size="lg" className="w-full flex items-center justify-center space-x-2">
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

