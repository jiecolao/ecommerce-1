import { useState } from 'react';
import { Monitor, ShoppingCart, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import FeaturedPromoBanner from '../../components/FeaturedPromoBanner';

interface CatalogItem {
  id: number;
  title: string;
  media?: string[];
  region?: string;
  priceLabel: string;
  price: number;
  variantId?: number;
}

function ProductCard({ product, highlighted }: { product: CatalogItem; highlighted?: boolean }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product.variantId) return;
      await api.post('/buyer/cart/items', {
        productVariantId: product.variantId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAdding(true);
      setTimeout(() => setAdding(false), 1500);
    },
    onError: (err: any) => {
      alert('Failed to add to cart: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card group block border border-[#49345d] bg-[#100c15]">
      <div className="relative block h-[280px] overflow-hidden border-b border-[#382548]">
        <img
          src={product.media?.[0] || '/palworld-cover.jpg'}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[#23182d]/10" />
        <div className="absolute bottom-0 left-0 h-1 w-2/3 bg-[#f4b72b] [clip-path:polygon(0_0,96%_0,100%_100%,0_100%)]" />
        <span
          className={`font-display absolute left-4 top-10 border bg-[#171019]/95 px-3 py-2 text-[10px] font-bold uppercase ${
            product.region === 'GLOBAL'
              ? 'border-[#f4b72b] text-[#ffe29a]'
              : 'border-[#4d3b63] bg-[#22162f] text-[#a79ab5]'
          }`}
        >
          {product.region || 'GLOBAL'}
        </span>
      </div>
      <div className="bg-[#241333] p-5">
        <Monitor className="h-4 w-4 text-[#9a94aa]" />
        <h3 className="mt-4 min-h-[44px] text-[15px] font-bold leading-tight text-[#ddd6e8] group-hover:text-white">{product.title}</h3>
        <p className="font-display mt-8 text-[20px] font-bold text-white">{product.priceLabel}</p>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          className={`font-display mt-4 flex h-[42px] w-full items-center justify-center border text-[12px] font-bold transition-[transform,background-color,color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-[#f4b72b] hover:bg-[#ffd45e] hover:text-[#171019] hover:shadow-[3px_3px_0_#0d0912] ${
            highlighted || adding
              ? 'border-[#e0ad34] bg-[#e0ad34] text-[#0b0710]'
              : 'border-[#6e5324] bg-transparent text-[#efe9f6]'
          }`}
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2 h-4 w-4" />
          )}
          {adding ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: serverProducts, isLoading, error } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const res = await api.get('/catalog/products');
      return res.data;
    },
  });

  const products: CatalogItem[] = (serverProducts || []).map((p: any) => {
    const rawPrice = p.productVariants?.[0]?.price ?? 0;
    const priceNum = Number(rawPrice);
    return {
      id: p.id,
      title: p.title,
      media: p.media,
      region: 'GLOBAL',
      price: priceNum,
      priceLabel: `P${priceNum.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
      variantId: p.productVariants?.[0]?.id,
    };
  });

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1c191f] px-5 pb-16 font-sans text-[#f3edf8] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <FeaturedPromoBanner />

        <div className="mt-10 border-b border-[#49345d] pb-8">
          <div className="mb-5 flex items-center gap-3">
            <Zap className="h-5 w-5 fill-[#f4b72b] text-[#f4b72b]" />
            <h2 className="comic-title text-xl font-black sm:text-2xl">Browse the vault</h2>
            <span className="h-px flex-1 bg-[#49345d]" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <button className="catalog-tab catalog-tab-active">All</button>
              {['Game Keys', 'Top-Ups', 'Subscriptions'].map((tab) => (
                <button key={tab} className="catalog-tab">
                  {tab}
                </button>
              ))}
            </div>
            <label className="flex h-[47px] w-[202px] items-center border border-[#49345d] bg-[#191221] px-3 text-sm font-bold text-[#91879f]">
              Filter:
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="ml-3 min-w-0 flex-1 bg-transparent text-[#f4eef9] outline-none"
              />
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center font-display text-lg text-[#f4b72b]">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" />
            Loading catalog...
          </div>
        ) : error ? (
          <div className="py-20 text-center font-display text-[#ff8c98]">
            Failed to load products from server. Make sure the backend is running.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center font-display text-[#8f8398]">
            No products found in the catalog.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} highlighted={index === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
