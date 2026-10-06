import { Gamepad2, KeyRound, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const socialIcons = [
  { id: 'x-icon', label: 'X' },
  { id: null, label: 'Steam' },
  { id: 'github-icon', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#49345d] bg-[#171419] print:hidden">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.8fr_1.4fr]">
        <div>
          <Link to="/catalog" className="flex items-center gap-3 text-white">
            <KeyRound className="h-6 w-6 text-[#f4b72b]" />
            <span className="font-display text-base font-black uppercase">MystiKeys</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#a99bb5]">
            Your vault for affordable game keys, top-ups, and subscriptions. Fast, secure, and reliable.
          </p>
          <div className="mt-6 flex gap-3">
            {socialIcons.map((social) => (
              <a key={social.id} href="#" aria-label={social.label} className="grid h-9 w-9 place-items-center bg-[#f4b72b] transition-transform hover:-translate-y-1">
                {social.id ? <svg className="h-4 w-4" aria-hidden="true"><use href={`/icons.svg#${social.id}`} /></svg> : <Gamepad2 className="h-4 w-4 text-[#171419]" />}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xs font-bold uppercase text-white">Shop</h2>
          <nav className="mt-5 flex flex-col gap-3 text-sm text-[#a99bb5]">
            <Link to="/catalog" className="hover:text-[#f4b72b]">PC Games</Link>
            <Link to="/catalog" className="hover:text-[#f4b72b]">Console Keys</Link>
            <Link to="/catalog" className="hover:text-[#f4b72b]">Gift Cards</Link>
            <Link to="/catalog" className="hover:text-[#f4b72b]">Subscriptions</Link>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-xs font-bold uppercase text-white">Support</h2>
          <nav className="mt-5 flex flex-col gap-3 text-sm text-[#a99bb5]">
            <Link to="/about" className="hover:text-[#f4b72b]">About MystiKeys</Link>
            <Link to="/faq" className="hover:text-[#f4b72b]">FAQ</Link>
            <Link to="/contact" className="hover:text-[#f4b72b]">Contact Us</Link>
            <a href="#" className="hover:text-[#f4b72b]">Refund Policy</a>
            <a href="#" className="hover:text-[#f4b72b]">How to Activate</a>
          </nav>
        </div>

        <div>
          <h2 className="font-display text-xs font-bold uppercase text-white">Get the drops</h2>
          <p className="mt-5 text-sm leading-6 text-[#a99bb5]">Get notified about the latest deals and releases.</p>
          <form className="mt-4 flex" onSubmit={(event) => event.preventDefault()}>
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 bg-[#f7f4f8] px-3">
              <Mail className="h-4 w-4 text-[#756681]" />
              <input type="email" aria-label="Email address" placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-sm text-[#2b2430] outline-none placeholder:text-[#9c92a3]" />
            </label>
            <button className="font-display h-11 bg-[#f4b72b] px-5 text-[10px] font-black uppercase text-[#171419] hover:bg-[#ffd45e]">Join</button>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 border-t border-[#34293c] px-5 py-6 text-xs text-[#807487] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>&copy; 2026 MystiKeys. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
