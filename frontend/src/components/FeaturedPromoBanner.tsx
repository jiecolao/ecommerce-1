import { Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';

type FeaturedPromoBannerProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  price?: string;
  imageSrc?: string;
};

export default function FeaturedPromoBanner({
  eyebrow = 'Featured',
  title = 'Elden Ring: Shadow of the Erdtree',
  subtitle = 'Experience the new expansion of the award-winning action RPG.',
  price = 'PHP 450.00',
  imageSrc = '/palworld.png',
}: FeaturedPromoBannerProps) {
  return (
    <section className="comic-panel relative mx-auto aspect-[1082/525] w-full max-w-[1082px] overflow-hidden bg-[#09060d]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1082 525"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M94.0514 93L0 272.5L20.446 501.5L956.871 525L1034.16 57L1082 0L94.0514 93Z" fill="#600EA8" />
      </svg>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1082 525"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M403 109L1034.16 57L956.871 525L246 507L403 109Z" fill="#4B087F" opacity="0.42" />
      </svg>

      <div className="absolute left-[2.8%] top-[31%] h-[7.2%] w-[18%] bg-violet-950 [clip-path:polygon(0_0,96%_0,100%_100%,8%_100%)]" />
      <div className="absolute left-[4.8%] top-[32.3%] z-30 flex h-[6.2%] w-[16.5%] items-center bg-amber-300 pl-[4.2%] text-[clamp(5px,1.05vw,10px)] font-black uppercase tracking-normal text-violet-950 [clip-path:polygon(0_0,83%_0,100%_50%,83%_100%,0_100%,8%_50%)]">
        <Sparkles className="mr-[4%] h-[0.8em] w-[0.8em]" />
        {eyebrow}
      </div>

      <div className="absolute left-[11%] top-[43%] z-20 w-[31%] text-white">
        <h1 className="max-w-[250px] text-[clamp(18px,4.05vw,44px)] font-black uppercase leading-[0.82] tracking-normal drop-shadow-[0_2px_0_rgba(45,12,86,0.65)]">
          {title}
        </h1>
        <p className="mt-[5%] max-w-[230px] text-[clamp(5px,1.05vw,11px)] leading-[1.28] text-violet-100">
          {subtitle}
        </p>

        <div className="mt-[6%] flex items-center gap-[6%]">
          <Button className="h-auto rounded-none bg-amber-300 px-[9%] py-[4%] text-[clamp(5px,1vw,10px)] font-black uppercase leading-none text-violet-950 hover:bg-amber-200">
            Buy Now
          </Button>
          <div className="flex items-center gap-[5%] whitespace-nowrap text-[clamp(7px,1.4vw,14px)] font-black uppercase text-white">
            <Zap className="h-[1em] w-[1em] text-amber-300" />
            {price}
          </div>
        </div>
      </div>

      <img
        src={imageSrc}
        alt="Palworld key art"
        className="absolute bottom-[0] right-[3%] z-10 h-[91%] w-auto max-w-none object-contain drop-shadow-[0_9px_4px_rgba(32,13,61,0.35)]"
      />
    </section>
  );
}
