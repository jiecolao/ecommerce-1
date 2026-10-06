import FeaturedPromoBanner from '../components/FeaturedPromoBanner';

export default function PromoTestPage() {
  return (
    <div className="space-y-8">
      <div>
        <span className="comic-kicker mb-5">Style preview</span>
        <h1 className="comic-title text-3xl font-black">Promo Banner Test</h1>
        <p className="mt-3 text-[#a99bb5]">Arcade-style featured game hero using the Palworld key art.</p>
      </div>

      <FeaturedPromoBanner
        title="Palworld"
        subtitle="Explore, craft, collect, and battle through a bright creature-filled survival adventure."
        price="PHP 450.00"
      />
    </div>
  );
}
