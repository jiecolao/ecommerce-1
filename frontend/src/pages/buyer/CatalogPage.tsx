import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Product } from 'shared';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { API_URL } from '../../lib/api';

const fetchProducts = async () => {
  const { data } = await axios.get<Product[]>(`${API_URL}/catalog/products`);
  return data;
};

export default function CatalogPage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  if (isLoading) return <div className="text-center py-10">Loading game keys...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Failed to load catalog. Is the backend running?</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Featured Games</h1>
        <p className="mt-2 text-lg text-slate-600">Discover the best game keys at unbeatable prices.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <Card key={product.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">${(product.priceCents / 100).toFixed(2)}</span>
                <span className={`text-sm ${product.inventoryCount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.inventoryCount > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/product/${product.id}`} className="w-full">
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {products?.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No games available right now. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
