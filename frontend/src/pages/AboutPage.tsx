import { Apple, BadgeCheck, Clock3, CreditCard, Gamepad2, Globe2, LockKeyhole, QrCode, ShieldCheck, Smartphone, Tag, Zap } from 'lucide-react';

const missionPoints = [
  { icon: Zap, title: 'Instant access', text: 'No waiting periods. Get your codes delivered directly to your inbox within seconds of payment.' },
  { icon: BadgeCheck, title: '100% verified', text: 'We source directly from trusted distributors so every key is authentic and functional.' },
  { icon: Tag, title: 'Zero hidden fees', text: 'What you see is what you pay, with transparent pricing across every catalog item.' },
  { icon: LockKeyhole, title: 'Privacy first', text: 'No complicated registration is required for basic top-ups and key purchases.' },
];

const features = [
  { icon: Clock3, title: 'Instant key delivery', text: 'Automated systems deliver your digital goods by email within seconds, around the clock.' },
  { icon: ShieldCheck, title: 'Verified and private', text: 'Official sourcing only. We never ask for game-account passwords during a transaction.' },
  { icon: Globe2, title: 'Cross-platform access', text: 'Support for PC, Xbox, PlayStation, Nintendo, Apple, and mobile gaming ecosystems.' },
];

const platforms = [
  { icon: Gamepad2, label: 'Steam' },
  { icon: Gamepad2, label: 'Xbox' },
  { icon: Gamepad2, label: 'PlayStation' },
  { icon: Gamepad2, label: 'Nintendo' },
  { icon: Apple, label: 'Apple' },
  { icon: Smartphone, label: 'Mobile' },
  { icon: CreditCard, label: 'Cards' },
  { icon: QrCode, label: 'QR Pay' },
];

const team = [
  { initials: 'JA', name: 'Lao, Jieco Andres A.', role: 'Team Leader' },
  { initials: 'RJ', name: 'Catacutan, Raphael James', role: 'Scrum Master' },
  { initials: 'JM', name: 'Iwag, John Michael', role: 'Member' },
  { initials: 'JP', name: 'Rapiz, Joseph Prince', role: 'Member' },
  { initials: 'FR', name: 'Robante, Floyd', role: 'Member' },
  { initials: 'HT', name: 'Tan, Hezron', role: 'Member' },
];

export default function AboutPage() {
  return (
    <div className="pb-10">
      <header className="relative overflow-hidden border border-[#49345d] bg-[#241333] px-6 py-16 text-center shadow-[7px_7px_0_#2c0c46] sm:py-20">
        <div className="absolute left-0 top-0 h-3 w-1/3 bg-[#f4b72b]" />
        <div className="absolute bottom-0 right-0 h-16 w-24 bg-[#6b2fa2] [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        <span className="comic-kicker mb-6">Behind the vault</span>
        <h1 className="comic-title text-4xl font-black sm:text-5xl">About MystiKeys</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[#b9adc4]">Authentic game keys, top-ups, and subscriptions delivered in seconds.</p>
      </header>

      <section className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-14">
        <div className="relative min-h-[420px] overflow-hidden border border-[#49345d] bg-[#211d23] shadow-[7px_7px_0_#2c0c46]">
          <img src="/palworld-cover.jpg" alt="Digital game delivery" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-[#241333]/95 p-6">
            <p className="font-display text-xs font-black uppercase text-[#f4b72b]">Games without the wait</p>
            <p className="mt-2 text-sm text-[#d7cfdd]">Buy, receive, redeem, and play.</p>
          </div>
        </div>

        <div>
          <span className="comic-kicker mb-5">Why we exist</span>
          <h2 className="comic-title text-3xl font-black">Our mission</h2>
          <div className="mt-8 space-y-6">
            {missionPoints.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#f4b72b] text-[#171419]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm leading-6 text-[#a99bb5]"><strong className="text-white">{title}:</strong> {text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <article key={title} className="comic-panel p-7 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center bg-[#f4b72b] text-[#171419] shadow-[4px_4px_0_#6b2fa2]">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-display mt-6 text-sm font-black uppercase text-white">{title}</h3>
            <p className="mt-4 text-sm leading-6 text-[#a99bb5]">{text}</p>
          </article>
        ))}
      </section>

      <section className="my-16 border-y border-[#49345d] bg-[#211d23] px-5 py-9">
        <h2 className="text-center font-display text-[10px] font-black uppercase text-[#a99bb5]">Supported platforms and payment channels</h2>
        <div className="mt-7 flex flex-wrap justify-center gap-4 sm:gap-7">
          {platforms.map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-w-20 flex-col items-center gap-2 text-[#d3cad9]">
              <Icon className="h-7 w-7 text-[#f4b72b]" />
              <span className="text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-6 text-center">
        <span className="comic-kicker mb-5">The party</span>
        <h2 className="comic-title text-3xl font-black">Meet the team behind MystiKeys</h2>
        <p className="mt-3 text-[#a99bb5]">Developed under CISTM - Pamantasan ng Lungsod ng Maynila (PLM)</p>

        <div className="mt-12 grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-6">
          {team.map((member, index) => (
            <article key={member.name} className="text-center">
              <div className={`mx-auto grid h-24 w-24 place-items-center border-2 border-[#f4b72b] font-display text-xl font-black text-white shadow-[5px_5px_0_#2c0c46] ${index % 2 === 0 ? 'bg-[#6b2fa2]' : 'bg-[#352043]'}`}>
                {member.initials}
              </div>
              <h3 className="mt-5 text-sm font-bold leading-5 text-white">{member.name}</h3>
              <p className="mt-1 font-display text-[9px] font-bold uppercase text-[#f4b72b]">{member.role}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
