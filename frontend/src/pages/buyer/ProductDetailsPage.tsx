import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, CircleDollarSign, CreditCard, Heart, MailCheck, Plus, QrCode, ShieldCheck, Star, WalletCards, Zap, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { catalogProducts } from '../../data/catalog';

const formatPrice = (price: number) => `P${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const paymentMethods = [
  { name: 'GCash', icon: WalletCards },
  { name: 'Maya', icon: WalletCards },
  { name: 'PayPal', icon: CircleDollarSign },
  { name: 'Visa', icon: CreditCard },
  { name: 'QR PH', icon: QrCode },
];

const initialReviews = [
  { id: 1, name: 'AlexTheGamer', rating: 5, date: '2 days ago', text: 'Amazing game! The graphics and gameplay are top tier. Highly recommend picking this up.' },
  { id: 2, name: 'S***r', rating: 4, date: '1 week ago', text: 'Really good, but had some minor bugs on launch. Still very enjoyable and worth the price.' },
  { id: 3, name: 'NoobMaster69', rating: 1, date: '2 weeks ago', text: 'Could not get it to run on my machine. Very disappointed.' }
];

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const product = catalogProducts.find((item) => item.id === id) ?? catalogProducts[0];
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  const sortedReviews = [...initialReviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0; // recent
  });

  const galleryImages = [
    "/palworld-cover.jpg",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80"
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryImages.length : null));
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null));
  };

  const packages = [
    { label: 'Standard Package', price: product.price, badge: 'Popular' },
    { label: 'Plus Package', price: Math.round(product.price * 2.75) },
    { label: 'Ultimate Package', price: Math.round(product.price * 5.4) },
  ];
  const activePackage = packages[selectedPackage];

  return (
    <div className="pb-10">
      <nav className="font-display mb-9 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase text-[#8f8398]">
        <Link to="/catalog" className="hover:text-[#f4b72b]">Home</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-[#f4b72b]">Game Keys</Link>
        <span>/</span>
        <span className="text-white">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(300px,430px)_1fr] xl:gap-14">
        <aside className="space-y-7">
          <div className="relative min-h-[560px] overflow-hidden border border-[#49345d] bg-[#241333] shadow-[7px_7px_0_#2c0c46]">
            <img src="/palworld-cover.jpg" alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-[#241333]/95 p-7">
              <span className="font-display text-[10px] font-bold uppercase text-[#f4b72b]">{product.platform}</span>
              <h2 className="font-display mt-3 text-xl font-black uppercase leading-tight text-white">{product.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => openLightbox(idx)}
                className="relative aspect-video overflow-hidden border border-[#49345d] transition-transform hover:-translate-y-1 hover:border-[#f4b72b]"
              >
                <img src={img} alt={`Gallery ${idx + 1}`} className="absolute inset-0 h-full w-full object-cover" />
              </button>
            ))}
          </div>

          <section className="comic-panel p-6">
            <h2 className="font-display text-sm font-black uppercase text-white">How to redeem</h2>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-[#b9adc4]">
              <li className="flex gap-3"><strong className="text-[#f4b72b]">1.</strong><span>Sign in to your account on the supported platform.</span></li>
              <li className="flex gap-3"><strong className="text-[#f4b72b]">2.</strong><span>Open the store and select the redeem code option.</span></li>
              <li className="flex gap-3"><strong className="text-[#f4b72b]">3.</strong><span>Enter the digital key sent by MystiKeys.</span></li>
              <li className="flex gap-3"><strong className="text-[#f4b72b]">4.</strong><span>Confirm and start playing immediately.</span></li>
            </ol>
          </section>

          <div className="flex items-center gap-4 border border-[#49345d] bg-[#252028] p-5">
            <ShieldCheck className="h-7 w-7 shrink-0 text-[#f4b72b]" />
            <div>
              <p className="font-display text-xs font-bold uppercase text-white">Instant delivery</p>
              <p className="mt-1 text-sm text-[#a99bb5]">Keys and top-ups are processed in seconds.</p>
            </div>
          </div>
        </aside>

        <section>
          <div className="flex items-start gap-5">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="bg-[#f4b72b] px-3 py-2 font-display text-[9px] font-black uppercase text-[#171419]">{product.region}</span>
                <span className="border border-[#675376] bg-[#252028] px-3 py-2 font-display text-[9px] font-bold uppercase text-white">{product.platform}</span>
              </div>
              <h1 className="comic-title text-3xl font-black leading-tight sm:text-4xl">{product.title}</h1>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#b9adc4]">
                <Star className="h-4 w-4 fill-[#f4b72b] text-[#f4b72b]" />
                <span className="font-bold text-white">4.8/5</span>
                <span>(124 reviews)</span>
              </div>
            </div>
            <button aria-label="Add to wishlist" className="grid h-12 w-12 shrink-0 place-items-center border border-[#675376] bg-[#252028] text-[#b9adc4] transition-transform hover:-translate-y-0.5 hover:text-[#f4b72b]">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-[#b9adc4]">
            Get instant access to the complete digital experience. Your key is delivered by email and ready to redeem on {product.platform}.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center bg-[#f4b72b] font-display text-xs font-black text-[#171419]">1</span>
            <h2 className="font-display text-sm font-black uppercase text-white">Select package</h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {packages.map((item, index) => (
              <button
                key={item.label}
                onClick={() => setSelectedPackage(index)}
                className={`relative min-h-28 border p-5 text-left transition-transform hover:-translate-y-0.5 ${
                  selectedPackage === index
                    ? 'border-[#f4b72b] bg-[#2b183c] shadow-[4px_4px_0_#f4b72b]'
                    : 'border-[#554260] bg-[#252028]'
                }`}
              >
                {item.badge && <span className="absolute -top-3 left-4 bg-[#f4b72b] px-3 py-1 font-display text-[8px] font-black uppercase text-[#171419]">{item.badge}</span>}
                <span className="block text-sm font-semibold text-[#b9adc4]">{item.label}</span>
                <span className="font-display mt-2 block text-xl font-black text-white">{formatPrice(item.price)}</span>
                {selectedPackage === index && <Check className="absolute right-4 top-4 h-5 w-5 text-[#f4b72b]" />}
              </button>
            ))}
            <button className="flex min-h-28 items-center justify-center gap-2 border border-dashed border-[#675376] bg-[#211d23] font-display text-[10px] font-bold uppercase text-[#8f8398] hover:text-white">
              <Plus className="h-4 w-4" /> More options
            </button>
          </div>

          <div className="comic-panel mt-10 p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#a99bb5]">Subtotal</p>
                <p className="font-display mt-2 text-3xl font-black text-white">{formatPrice(activePackage.price)}</p>
              </div>
              <div className="sm:text-right">
                <p className="mb-3 flex items-center gap-2 text-xs text-[#a99bb5] sm:justify-end"><Zap className="h-4 w-4 text-[#f4b72b]" /> Guest checkout enabled</p>
                <Link to={`/checkout/${product.id}`} className="font-display inline-flex h-13 items-center gap-3 bg-[#f4b72b] px-8 text-xs font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e]">
                  Buy now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-8 border-t border-[#49345d] pt-7">
              <p className="font-display text-center text-[9px] font-bold uppercase text-[#8f8398]">Supported payment methods</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {paymentMethods.map(({ name, icon: PaymentIcon }) => (
                  <span key={name} className="flex min-w-20 flex-col items-center gap-2 border border-[#49345d] bg-[#1c191f] px-4 py-3 text-[10px] font-bold text-[#b9adc4]">
                    <PaymentIcon className="h-5 w-5 text-[#f4b72b]" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-7 flex items-center justify-center gap-3 text-center text-sm text-[#8f8398]">
            <MailCheck className="h-5 w-5" /> No account required. Confirmation and keys are sent to your email.
          </p>
        </section>
      </div>

      <section className="mt-16 border-t border-[#49345d] pt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="comic-title text-2xl font-black text-white">Player Reviews</h2>
          <div className="flex flex-wrap items-center gap-4">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#252028] border border-[#49345d] text-[#b9adc4] px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#f4b72b] transition-colors"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="font-display bg-[#f4b72b] px-6 py-2.5 text-xs font-black uppercase text-[#171419] transition-transform hover:-translate-y-0.5 hover:bg-[#ffd45e] shadow-[4px_4px_0_#49345d]"
            >
              Review Now
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedReviews.map(review => (
            <div key={review.id} className="border border-[#49345d] bg-[#252028] p-6 shadow-[4px_4px_0_#1c191f]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-white">{review.name}</p>
                  <p className="text-xs text-[#a99bb5] mt-0.5">{review.date}</p>
                </div>
                <div className="flex text-[#f4b72b] gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-[#49345d]'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#b9adc4] leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="comic-panel w-full max-w-4xl bg-[#1c191f] flex flex-col md:flex-row overflow-hidden max-h-[90vh] overflow-y-auto relative shadow-[10px_10px_0_#f4b72b]">
            <button className="absolute right-4 top-4 text-[#a99bb5] hover:text-[#f4b72b] z-10 transition-colors" onClick={() => setIsReviewModalOpen(false)}>
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[#49345d]">
              <h2 className="font-display text-2xl font-black uppercase text-white mb-3">Write a Review</h2>
              <p className="text-sm text-[#a99bb5] mb-8 leading-relaxed">
                Share your thoughts! Detail your experience with the game's mechanics, visuals, audio, and narrative to help fellow players decide.
              </p>
              
              <div className="mb-7">
                <label className="block font-display text-xs font-bold uppercase text-[#8f8398] mb-3 tracking-wider">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 ${star <= reviewRating ? 'fill-[#f4b72b] text-[#f4b72b]' : 'text-[#49345d]'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-7">
                <label className="block font-display text-xs font-bold uppercase text-[#8f8398] mb-3 tracking-wider">Your Review</label>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-[#241333] border border-[#49345d] text-white p-4 h-36 resize-none focus:outline-none focus:border-[#f4b72b] transition-colors"
                  placeholder="What did you think about the game?"
                ></textarea>
              </div>
              
              <div className="flex items-center gap-3 mb-8">
                <button 
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`flex h-5 w-5 items-center justify-center border transition-colors ${isAnonymous ? 'border-[#f4b72b] bg-[#f4b72b]' : 'border-[#49345d] bg-[#241333]'}`}
                >
                  {isAnonymous && <Check className="h-4 w-4 text-[#171419]" />}
                </button>
                <span className="text-sm text-[#b9adc4] font-medium cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>Post anonymously (e.g. J***n)</span>
              </div>
              
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="font-display w-full bg-[#f4b72b] py-4 text-sm font-black uppercase text-[#171419] transition-transform hover:-translate-y-1 hover:bg-[#ffd45e] shadow-[4px_4px_0_#49345d]"
              >
                Submit Review
              </button>
            </div>
            
            <div className="w-full md:w-80 bg-[#252028] p-8 flex flex-col items-center justify-center text-center">
              <div className="w-48 aspect-[3/4] relative border border-[#49345d] mb-6 shadow-[5px_5px_0_#1c191f]">
                <img src="/palworld-cover.jpg" alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <h3 className="font-display text-xl font-black uppercase text-white mb-2 leading-tight">{product.title}</h3>
              <p className="text-sm font-bold text-[#f4b72b] bg-[#f4b72b]/10 px-3 py-1 rounded-full">{product.platform}</p>
            </div>
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeLightbox}>
          <button className="absolute right-6 top-6 text-white hover:text-[#f4b72b]" onClick={closeLightbox}>
            <X className="h-8 w-8" />
          </button>
          
          <button className="absolute left-6 text-white hover:text-[#f4b72b]" onClick={prevImage}>
            <ChevronLeft className="h-12 w-12" />
          </button>
          
          <img 
            src={galleryImages[lightboxIndex]} 
            alt="Lightbox" 
            className="max-h-[90vh] max-w-[90vw] object-contain border border-[#49345d] shadow-[7px_7px_0_#f4b72b]" 
            onClick={(e) => e.stopPropagation()}
          />
          
          <button className="absolute right-6 text-white hover:text-[#f4b72b]" onClick={nextImage}>
            <ChevronRight className="h-12 w-12" />
          </button>
        </div>
      )}
    </div>
  );
}
