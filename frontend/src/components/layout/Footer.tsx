import { Gamepad2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const socialIcons = [
  { id: 'x-icon', label: 'X' },
  { id: null, label: 'Steam' },
  { id: 'github-icon', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t-[3px] border-black bg-[#120a1d] shadow-[0_-4px_0_#000000] print:hidden">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr]">
        <div>
          <Link to="/catalog" className="flex items-center gap-3 text-white group w-fit">
            <img src="/favicon.svg" alt="" className="h-10 w-10 shadow-[2.5px_2.5px_0_#0e0917] transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[3.5px_3.5px_0_#0e0917]" />
            <span className="font-display text-base font-black uppercase tracking-wider text-[#f2edf7] drop-shadow-[2px_2px_0_#0e0917] group-hover:text-[#f0b849] transition-colors">
              MystiKeys
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#b2a4c4]">
            Your vault for affordable game keys, top-ups, and subscriptions. Fast, secure, and reliable.
          </p>
          <div className="mt-6 flex gap-3">
            {socialIcons.map((social) => (
              <a
                key={social.id}
                href="#"
                aria-label={social.label}
                className="grid h-10 w-10 place-items-center border-2 border-[#0e0917] bg-[#e5a93c] text-[#0e0917] shadow-[2.5px_2.5px_0_#0e0917] transition-all hover:-translate-y-1 hover:bg-[#f0b849] hover:shadow-[4px_4px_0_#0e0917]"
              >
                {social.id ? (
                  <svg className="h-4 w-4" aria-hidden="true">
                    <use href={`/icons.svg#${social.id}`} />
                  </svg>
                ) : (
                  <Gamepad2 className="h-4 w-4 text-[#0e0917]" />
                )}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#f2edf7] drop-shadow-[1px_1px_0_#0e0917]">
            Shop
          </h2>
          <nav className="mt-5 flex flex-col gap-3 text-sm">
            <Link to="/catalog" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              PC Games
            </Link>
            <Link to="/catalog" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              Console Keys
            </Link>
            <Link to="/catalog" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              Gift Cards
            </Link>
            <Link to="/catalog" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              Subscriptions
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#f2edf7] drop-shadow-[1px_1px_0_#0e0917]">
            Support
          </h2>
          <nav className="mt-5 flex flex-col gap-3 text-sm">
            <Link to="/about" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              About MystiKeys
            </Link>
            <Link to="/faq" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              FAQ
            </Link>
            <Link to="/contact" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              Contact Us
            </Link>
            <a href="#" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              Refund Policy
            </a>
            <a href="#" className="font-semibold text-[#b2a4c4] hover:text-[#f0b849] hover:translate-x-1 transition-all">
              How to Activate
            </a>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-xs font-black uppercase tracking-wider text-[#f2edf7] drop-shadow-[1px_1px_0_#0e0917]">
            Get the drops
          </h2>
          <p className="mt-5 text-sm leading-6 text-[#b2a4c4]">
            Get notified about the latest deals and releases.
          </p>
          <form className="mt-4 flex" onSubmit={(event) => event.preventDefault()}>
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 border-2 border-[#0e0917] bg-[#ede7f5] px-3 shadow-[3.5px_3.5px_0_#0e0917] focus-within:shadow-[4.5px_4.5px_0_#e5a93c] transition-all">
              <Mail className="h-4 w-4 text-[#241338]" />
              <input
                type="email"
                aria-label="Email address"
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#170e24] outline-none placeholder:text-[#88789c]"
              />
            </label>
            <button
              type="submit"
              className="comic-action-btn -ml-[2px] h-11 bg-[#e5a93c] px-6 text-[11px] font-black uppercase text-[#0e0917] hover:bg-[#f0b849]"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 border-t-2 border-black px-5 py-6 text-xs text-[#807487] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>&copy; 2026 MystiKeys. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
