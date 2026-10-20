import { useState } from 'react';
import {
  Monitor,
  Gamepad2,
  Smartphone,
  ShoppingCart,
  Zap,
  Loader2,
  Flame,
  Check,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthSession } from '../../lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from '../../lib/toast';
import FeaturedPromoBanner from '../../components/FeaturedPromoBanner';
import { ProductCardSkeleton } from '../../components/ui/skeleton';

interface CatalogItem {
  id: number | string;
  title: string;
  media?: string[];
  image?: string;
  region?: string;
  platform?: string;
  priceLabel: string;
  price: number;
  originalPrice?: string;
  tag?: string;
  badgeType?: 'yellow' | 'purple' | 'white';
  variantId?: number;
  isTopUp?: boolean;
}

function getPlatformIcon(platform?: string) {
  if (!platform) return <Monitor className="h-3.5 w-3.5 text-[#e5a93c]" />;
  const p = platform.toUpperCase();
  if (p.includes('MOBILE') || p.includes('APPLE')) {
    return <Smartphone className="h-3.5 w-3.5 text-[#e5a93c]" />;
  }
  if (p.includes('PLAYSTATION') || p.includes('XBOX') || p.includes('NINTENDO')) {
    return <Gamepad2 className="h-3.5 w-3.5 text-[#e5a93c]" />;
  }
  return <Monitor className="h-3.5 w-3.5 text-[#e5a93c]" />;
}

function getBadgeHalftoneClass(type?: string) {
  if (type === 'purple') return 'comic-halftone-purple text-[#f2edf7]';
  if (type === 'white') return 'comic-halftone-white text-[#0e0917]';
  return 'comic-halftone-yellow text-[#0e0917]';
}

function ProductCard({ product, highlighted }: { product: CatalogItem; highlighted?: boolean }) {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [adding, setAdding] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product.variantId) {
        throw new Error('This product does not have an active edition variant to purchase.');
      }
      await api.post('/buyer/cart/items', {
        productVariantId: product.variantId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setAdding(true);
      toast.success(`"${product.title}" added to cart!`);
      setTimeout(() => setAdding(false), 1500);
    },
    onError: () => {
      setAdding(false);
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.isBuyer) {
      toast.warning('Please sign in to your account to add games to your cart.', 'SIGN IN REQUIRED');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    addToCartMutation.mutate();
  };

  const coverImage = product.image || product.media?.[0] || '/palworld-cover.jpg';
  const badgeClass = getBadgeHalftoneClass(product.badgeType);

  return (
    <Link
      to={`/product/${product.id}`}
      className={`product-card group block ${highlighted ? 'is-featured' : ''}`}
    >
      {/* Comic light streak sweep across card on hover */}
      <div className="comic-card-sheen" />

      {/* Cover Art Comic Panel */}
      <div className="relative block h-[260px] overflow-hidden border-b-[2.5px] border-black bg-[#0d0716]">
        <img
          src={coverImage}
          alt={product.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/palworld-cover.jpg';
          }}
          className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-108 group-hover:contrast-105"
        />

        {/* Cel-shaded darkening gradient for comic mood */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#140d22] via-transparent to-black/40" />

        {/* Left-top comic angled banner */}
        <div className="absolute left-3 top-3 z-10">
          <span className={`comic-angled-badge ${badgeClass}`}>
            <span>{product.region || 'GLOBAL KEY'}</span>
          </span>
        </div>

        {/* Right-top comic sticker */}
        <div className="absolute right-3 top-3 z-10">
          {product.tag ? (
            <span className="inline-flex items-center gap-1 border-2 border-[#0e0917] bg-[#e5a93c] px-2 py-0.5 text-[10px] font-black uppercase text-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917] transform rotate-2">
              <Flame className="h-3 w-3 fill-[#0e0917] text-[#0e0917]" />
              {product.tag}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 border-2 border-[#0e0917] bg-[#211730] px-2 py-0.5 text-[10px] font-black uppercase text-[#e5a93c] shadow-[2.5px_2.5px_0_#0e0917] transform -rotate-1">
              <Zap className="h-3 w-3 fill-[#e5a93c] text-[#e5a93c]" />
              INSTANT
            </span>
          )}
        </div>

        {/* Comic Energy Slashed Stripe along bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex h-1.5">
          <div className="h-full w-3/4 bg-[#e5a93c]" />
          <div className="h-full w-1/4 bg-[#581c87]" />
        </div>
      </div>

      {/* Card Body - Comic Details Panel */}
      <div className="comic-halftone-purple flex flex-1 flex-col justify-between p-5 border-t border-[#0e0917]">
        <div>
          {/* Platform and Delivery Pill Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 border-2 border-[#0e0917] bg-[#161022] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#e5a93c] shadow-[2px_2px_0_#0e0917]">
              {getPlatformIcon(product.platform)}
              <span>{product.platform || 'PC / STEAM'}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#b2a4c4]">
              <Zap className="h-3 w-3 text-[#e5a93c] fill-[#e5a93c]" />
              <span>Verified Key</span>
            </span>
          </div>

          {/* Title with Comic Typography and Responsive Hover Glow */}
          <h3 className="font-display mt-3.5 min-h-[44px] text-[15px] font-black leading-tight text-[#f2edf7] transition-colors duration-200 group-hover:text-[#f0b849] line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* Price Section & Comic Action Button */}
        <div className="mt-5">
          <div className="flex items-end justify-between gap-2">
            {/* Comic Price Bubble / Sticker */}
            <div className="comic-price-sticker comic-halftone-yellow">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#0e0917]/75">PRICE</span>
              <span className="font-display text-[19px] sm:text-[20px] font-black leading-none text-[#0e0917]">
                {product.priceLabel}
              </span>
            </div>

            {/* Original Price / Savings Tag */}
            {product.originalPrice && (
              <div className="mb-1 text-right">
                <span className="block text-[11px] font-bold text-[#9c8ea8] line-through">
                  {product.originalPrice}
                </span>
                <span className="inline-block border border-[#0e0917] bg-[#581c87] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#ede3c8] shadow-[1px_1px_0_#0e0917]">
                  SAVE
                </span>
              </div>
            )}
          </div>

          {/* Comic Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className={`comic-action-btn mt-4 flex h-[44px] w-full items-center justify-center gap-2 ${
              adding
                ? 'bg-[#10b981] text-[#0e0917] shadow-[3px_3px_0_#0e0917]'
                : highlighted
                ? 'bg-[#e5a93c] text-[#0e0917] hover:bg-[#f0b849]'
                : 'bg-[#e5a93c] text-[#0e0917] hover:bg-[#f0b849]'
            }`}
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : adding ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 stroke-[2.5]" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

const TABS = ['All', 'Game Keys', 'Top-Ups', 'Subscriptions'] as const;
type TabType = (typeof TABS)[number];

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: serverProducts, isLoading } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const res = await api.get('/catalog/products');
      return res.data;
    },
    retry: 1,
  });

  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const res = await api.get('/buyer/featured');
      return res.data;
    },
    retry: 1,
  });

  const featuredItem = (featuredProducts && featuredProducts[0]) || (serverProducts && serverProducts[0]);

  // Map server data directly, no fake fallback
  const rawProducts: CatalogItem[] =
    Array.isArray(serverProducts)
      ? serverProducts.map((p: any) => {
          const firstVariant = p.productVariants?.[0];
          const rawPrice = firstVariant?.price ?? 0;
          const priceNum = Number(rawPrice);
          return {
            id: p.id,
            title: p.title,
            media: p.media,
            image: p.media?.[0],
            region: 'GLOBAL',
            platform: 'PC',
            price: priceNum,
            priceLabel: `₱${priceNum.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            variantId: firstVariant?.id,
            badgeType: 'yellow' as const,
          };
        })
      : [];

  const filteredProducts = rawProducts
    .filter((p) => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Game Keys') {
        return (
          !p.isTopUp &&
          !p.title.toLowerCase().includes('pass') &&
          !p.title.toLowerCase().includes('subscription')
        );
      }
      if (activeTab === 'Top-Ups') {
        return (
          p.isTopUp ||
          p.title.toLowerCase().includes('top-up') ||
          p.title.toLowerCase().includes('diamonds')
        );
      }
      if (activeTab === 'Subscriptions') {
        return (
          p.title.toLowerCase().includes('pass') ||
          p.title.toLowerCase().includes('subscription') ||
          p.title.toLowerCase().includes('months')
        );
      }
      return true;
    })
    .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-transparent px-5 pb-16 font-sans text-[#eee8f5] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {featuredItem && (
          <FeaturedPromoBanner
            title={featuredItem.title}
            subtitle={featuredItem.description}
            price={
              featuredItem.productVariants?.[0]?.price
                ? `₱${Number(featuredItem.productVariants[0].price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                : undefined
            }
            imageSrc={featuredItem.media?.[0]}
            buyHref={`/product/${featuredItem.id}`}
          />
        )}

        <div className="mt-10 border-b border-[#372648] pb-8">
          <div className="mb-5 flex items-center gap-3">
            <Zap className="h-5 w-5 fill-[#e5a93c] text-[#e5a93c]" />
            <h2 className="comic-title text-xl font-black sm:text-2xl">Browse the vault</h2>
            <span className="h-px flex-1 bg-[#372648]" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`catalog-tab ${activeTab === tab ? 'catalog-tab-active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <label className="flex h-[47px] w-[240px] items-center border-2 border-[#0e0917] bg-[#191221] px-3 text-sm font-bold text-[#91879f] shadow-[3px_3px_0_#0e0917] focus-within:border-[#e5a93c] focus-within:shadow-[3px_3px_0_#e5a93c]">
              <span className="font-display text-[11px] font-black uppercase text-[#e5a93c]">
                Filter:
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search games..."
                className="ml-3 min-w-0 flex-1 bg-transparent font-bold text-[#eee8f5] outline-none placeholder:text-[#6a5e78]"
              />
            </label>
          </div>
        </div>

        {isLoading && !serverProducts ? (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto max-w-md border-2 border-[#0e0917] bg-[#1e1529] p-8 shadow-[6px_6px_0_#0e0917]">
              <p className="font-display text-lg font-bold text-[#e5a93c]">No games found</p>
              <p className="mt-2 text-sm text-[#b2a4c4]">
                Try adjusting your search terms or selecting a different category tab.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                highlighted={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

