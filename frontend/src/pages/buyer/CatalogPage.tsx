import { Monitor, ShoppingCart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogProducts, type CatalogProduct } from '../../data/catalog';

function CatalogHero() {
  return (
    <section className="relative flex h-[clamp(360px,43vw,660px)] items-center overflow-hidden">
      <img
        src="/image.png"
        alt="Featured game promotion"
        className="mx-auto h-full w-auto max-w-full object-contain"
      />
    </section>
  );
}

function ProductCard({ product, highlighted }: { product: CatalogProduct; highlighted?: boolean }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card group block border border-[#49345d] bg-[#100c15]">
      <div className="relative block h-[280px] overflow-hidden border-b border-[#382548]">
        <img
          src="/palworld-cover.jpg"
          alt="Palworld cover art"
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
          {product.region}
        </span>
      </div>
      <div className="bg-[#241333] p-5">
        <Monitor className="h-4 w-4 text-[#9a94aa]" />
        <h3 className="mt-4 min-h-[44px] text-[15px] font-bold leading-tight text-[#ddd6e8] group-hover:text-white">{product.title}</h3>
        <p className="font-display mt-8 text-[20px] font-bold text-white">{product.priceLabel}</p>
        <span
          className={`font-display mt-4 flex h-[42px] w-full items-center justify-center border text-[12px] font-bold transition-[transform,background-color,color,box-shadow] duration-150 group-hover:-translate-y-0.5 group-hover:border-[#f4b72b] group-hover:bg-[#ffd45e] group-hover:text-[#171019] group-hover:shadow-[3px_3px_0_#0d0912] ${
            highlighted
              ? 'border-[#e0ad34] bg-[#e0ad34] text-[#0b0710]'
              : 'border-[#6e5324] bg-transparent text-[#efe9f6]'
          }`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </span>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-[#1c191f] px-5 pb-16 font-sans text-[#f3edf8] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <CatalogHero />

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
              Sort by:
              <select className="ml-3 min-w-0 flex-1 bg-transparent text-[#f4eef9] outline-none">
                <option>Popularity</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {catalogProducts.map((product, index) => (
            <ProductCard key={product.title} product={product} highlighted={index === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
