import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import type { Product } from 'shared';
import { Button } from '../../components/ui/button';
import { ShoppingCart, KeyRound, Heart } from 'lucide-react';
import { API_URL } from '../../lib/api';

const fetchProduct = async (id: string) => {
  const { data } = await axios.get<Product>(`${API_URL}/catalog/products/${id}`);
  return data;
};

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id as string),
    enabled: !!id,
  });

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await axios.get<Product[]>(`${API_URL}/buyer/wishlist`, {
        headers: { 'x-actor-id': '11111111-1111-1111-1111-111111111111' }
      });
      return data;
    }
  });

  const isWishlisted = wishlist?.some(item => item.id === product?.id);

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      if (isWishlisted) {
        await axios.delete(`${API_URL}/buyer/wishlist/${product.id}`, {
          headers: { 'x-actor-id': '11111111-1111-1111-1111-111111111111' }
        });
      } else {
        await axios.post(`${API_URL}/buyer/wishlist`, { productId: product.id }, {
          headers: { 'x-actor-id': '11111111-1111-1111-1111-111111111111' }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
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
          
          {product.rating && (
            <div className="flex items-center space-x-1 mt-2">
              <span className="text-yellow-500 text-lg">★</span>
              <span className="text-sm text-slate-600 font-semibold">{product.rating}</span>
            </div>
          )}

          <p className="mt-4 text-3xl text-slate-900 font-bold">
            ${((product.productVariants?.[0]?.price ?? 1000) / 100).toFixed(2)}
          </p>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-900">Description</h3>
            <div className="mt-2 prose prose-sm text-slate-500">
              <p>{product.description}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex flex-col space-y-2">
              {product.developer && <span className="text-sm text-slate-600">Developer: <span className="font-semibold text-slate-900">{product.developer}</span></span>}
              {product.publisher && <span className="text-sm text-slate-600">Publisher: <span className="font-semibold text-slate-900">{product.publisher}</span></span>}
            </div>
          </div>

          {product.systemRequirements && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-900">System Requirements</h3>
              <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-line font-mono leading-relaxed">
                {product.systemRequirements}
              </div>
            </div>
          )}

          <div className="mt-10 flex space-x-4">
            <Link to={`/checkout/${product.id}`} className="flex-1">
              <Button size="lg" className="w-full flex items-center justify-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Buy Now</span>
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="lg"
              className={`flex items-center justify-center ${isWishlisted ? 'text-red-500 hover:text-red-600 border-red-200 bg-red-50' : 'text-slate-500 hover:text-slate-600'}`}
              onClick={() => wishlistMutation.mutate()}
              disabled={wishlistMutation.isPending}
            >
              <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
