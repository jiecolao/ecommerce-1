import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeaturedPromoBanner.css';
import {
  BANNER_PURPLE_SHADOW,
  BANNER_PURPLE_MAIN,
  BANNER_PURPLE_FACET,
  RIBBON_SHADOW,
  RIBBON_GOLD,
  RIBBON_FOLD_SHADOW,
  RIBBON_FOLD_GOLD,
} from './bannerPaths';

export interface FeaturedPromoBannerProps {
  badge?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  imageSrc?: string;
  buttonText?: string;
  buyHref?: string;
  onBuyNow?: () => void;
  className?: string;
}

const DEFAULT_TITLE = 'Elden Ring: Shadow of the Erdtree';
const DEFAULT_SUBTITLE =
  'Experience the new expansion of the award-winning action RPG. Pre-order now for exclusive bonuses.';
const DEFAULT_BADGE = 'FEATURED';
const DEFAULT_PRICE = '₱2,450.00';
const DEFAULT_BUTTON_TEXT = 'Buy Now';
const DEFAULT_IMAGE = '/palworld.png';
const DEFAULT_BUY_HREF = '/product/helldivers-2';

export default function FeaturedPromoBanner({
  badge,
  eyebrow,
  title = DEFAULT_TITLE,
  subtitle,
  description,
  price = DEFAULT_PRICE,
  imageSrc = DEFAULT_IMAGE,
  buttonText = DEFAULT_BUTTON_TEXT,
  buyHref = DEFAULT_BUY_HREF,
  onBuyNow,
  className = '',
}: FeaturedPromoBannerProps) {
  const navigate = useNavigate();
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const shadowFilterId = `one-sided-yellow-shadow-${id}`;

  const badgeText = badge ?? eyebrow ?? DEFAULT_BADGE;
  const descText = subtitle ?? description ?? DEFAULT_SUBTITLE;

  const handleBuy = () => {
    if (onBuyNow) {
      onBuyNow();
    } else if (buyHref) {
      navigate(buyHref);
    }
  };

  // Format title into emphasized, balanced lines
  const renderTitleLines = () => {
    if (title === DEFAULT_TITLE) {
      return (
        <>
          <span>Elden Ring:</span>
          <br />
          <span>Shadow of</span>
          <br />
          <span>the Erdtree</span>
        </>
      );
    }

    if (title.includes(':')) {
      const [main, rest] = title.split(':');
      const restWords = rest?.trim().split(' ') ?? [];
      if (restWords.length >= 3) {
        const mid = Math.ceil(restWords.length / 2);
        return (
          <>
            <span>{main}:</span>
            <br />
            <span>{restWords.slice(0, mid).join(' ')}</span>
            <br />
            <span>{restWords.slice(mid).join(' ')}</span>
          </>
        );
      }
      return (
        <>
          <span>{main}:</span>
          <br />
          <span>{rest?.trim()}</span>
        </>
      );
    }

    const words = title.split(' ');
    if (words.length > 2) {
      const mid = Math.ceil(words.length / 2);
      return (
        <>
          <span>{words.slice(0, mid).join(' ')}</span>
          <br />
          <span>{words.slice(mid).join(' ')}</span>
        </>
      );
    }

    return title;
  };

  return (
    <section className={`featured-promo relative mx-auto w-full max-w-[1243px] overflow-visible py-2 sm:py-4 ${className}`}>
      <div className="featured-promo__frame">
        {/* SVG Graphic Layer: Polygons, ribbon geometry, and artwork with one-sided shadow */}
        <svg
          viewBox="0 0 1243 697"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className="featured-promo__desktop-art absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_16px_32px_rgba(13,9,18,0.55)]"
          aria-hidden="true"
        >
          <defs>
            {/* One-sided yellow cast shadow: thinner outline (dx=6, dy=5, radius=1) */}
            <filter
              id={shadowFilterId}
              x="-20%"
              y="-20%"
              width="150%"
              height="150%"
              colorInterpolationFilters="sRGB"
            >
              {/* Thinner 1px dilation for sharp silhouette */}
              <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="dilated" />
              {/* Shifted down and right (dx=6, dy=5) for a refined one-sided cast shadow */}
              <feOffset in="dilated" dx="6" dy="5" result="shifted" />
              {/* Gold / yellow accent flood (#F5B829) matching Figma */}
              <feFlood floodColor="#F5B829" floodOpacity="1" result="yellowFlood" />
              {/* Composite flood with the shifted silhouette */}
              <feComposite in="yellowFlood" in2="shifted" operator="in" result="yellowShadow" />
              {/* Draw original graphic on top so shadow peaks out only on the cast side */}
              <feMerge>
                <feMergeNode in="yellowShadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Layer 1: Background polygon shadow - NO yellow outline */}
          <path d={BANNER_PURPLE_SHADOW} fill="#892AC9" />

          {/* Layer 2: Main purple banner polygon - NO yellow outline */}
          <path d={BANNER_PURPLE_MAIN} fill="#600EA8" />

          {/* Layer 3: Dark facet overlay polygon - NO yellow outline */}
          <path d={BANNER_PURPLE_FACET} fill="#4F2B75" fillOpacity={0.6} />

          {/* Layer 4: Dynamic Character Artwork PNG with refined one-sided yellow cast shadow */}
          <image
            href={imageSrc}
            xlinkHref={imageSrc}
            x="568"
            y="-12.7955"
            width="647"
            height="647"
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${shadowFilterId})`}
          />

          {/* Layer 5: Ribbon polygon shapes in top-left */}
          <path d={RIBBON_SHADOW} fill="#460055" />
          <path d={RIBBON_GOLD} fill="#C99C40" />
          <path d={RIBBON_FOLD_SHADOW} fill="#460055" />
          <path d={RIBBON_FOLD_GOLD} fill="#C99C40" />
        </svg>

        {/* The mobile panel stretches with the copy; the artwork keeps its own proportions. */}
        <svg
          className="featured-promo__mobile-panel"
          viewBox="0 0 360 600"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path d="M38 58L358 14L338 134L356 550L314 598L22 574L8 202L38 58Z" fill="#892AC9" />
          <path d="M28 44L348 0L328 120L346 536L304 584L12 560L0 188L28 44Z" fill="#600EA8" />
          <path d="M348 0L238 100L216 210L252 580L304 584L346 536L328 120L348 0Z" fill="#4F2B75" fillOpacity={0.6} />
        </svg>

        <img className="featured-promo__mobile-art" src={imageSrc} alt="" />

        <div className="featured-promo__overlay">
          <div className="featured-promo__badge font-display font-black uppercase text-[#060608]">
            <svg
              className="featured-promo__mobile-ribbon"
              viewBox="0 178 230 60"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path d={RIBBON_SHADOW} fill="#460055" />
              <path d={RIBBON_GOLD} fill="#C99C40" />
              <path d={RIBBON_FOLD_SHADOW} fill="#460055" />
              <path d={RIBBON_FOLD_GOLD} fill="#C99C40" />
            </svg>
            <span className="select-text">{badgeText}</span>
          </div>

          <div className="featured-promo__content">
            <h2 className="featured-promo__title font-display font-black text-[#F5F2FA] select-text">
              {renderTitleLines()}
            </h2>

            <p className="featured-promo__description font-sans font-normal text-[#FAF2D9] select-text">
              {descText}
            </p>

            <div className="featured-promo__actions">
              <button
                type="button"
                onClick={handleBuy}
                aria-label={buttonText}
                className="featured-promo__button font-display font-black uppercase text-[#060608] bg-[#F5B829] border border-[#3D3347] transition-all duration-150 motion-reduce:transition-none hover:bg-[#ffd45e] hover:shadow-[3px_3px_0_#2c0c46] active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#f4b72b] cursor-pointer"
              >
                {buttonText}
              </button>

              <span className="featured-promo__price font-display font-extrabold text-[#F5F2FA] select-text">
                {price}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
