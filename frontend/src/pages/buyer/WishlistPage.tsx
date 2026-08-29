import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Product } from 'shared';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { API_URL } from '../../lib/api';
import { Trash2, KeyRound } from 'lucide-react';

const fetchWishlist = async () => {
  const { data } = await axios.get<Product[]>(`${API_URL}/buyer/wishlist`, {
    headers: { 'x-actor-id': '11111111-1111-1111-1111-111111111111' }
  });
  return data;
};

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      await axios.delete(`${API_URL}/buyer/wishlist/${productId}`, {
        headers: { 'x-actor-id': '11111111-1111-1111-1111-111111111111' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading wishlist...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Failed to load wishlist.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">My Wishlist</h1>
        <p className="mt-2 text-lg text-slate-600">Keep track of the games you want to buy.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlistItems?.map((product) => (
          <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold truncate pr-2">{product.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => removeMutation.mutate(product.id)}
                disabled={removeMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="aspect-video w-full bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                {product.media && product.media.length > 0 ? (
                  <img src={product.media[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <KeyRound className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  ${product.productVariants?.[0]?.price ? (product.productVariants[0].price / 100).toFixed(2) : 'N/A'}
                </span>
                {product.rating && (
                  <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded">
                    ★ {product.rating}
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/product/${product.id}`} className="w-full">
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {wishlistItems?.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            Your wishlist is empty. Browse the storefront and add games!
          </div>
        )}
      </div>
    </div>
  );
}
