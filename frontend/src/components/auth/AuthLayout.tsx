import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthLayoutProps = {
  title: string;
  subtitle: string | ReactNode;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <div className="absolute left-0 top-0 h-3 w-1/3 bg-[#f4b72b]" />
      <div className="absolute bottom-0 right-0 h-28 w-40 bg-[#6b2fa2] [clip-path:polygon(100%_0,100%_100%,0_100%)]" />

      <div className="w-full max-w-md">
        <Link to="/catalog" className="mb-6 flex items-center justify-center gap-3 text-white">
          <img src="/favicon.svg" alt="" className="h-11 w-11 shadow-[3px_3px_0_#0e0917]" />
          <span className="font-display text-base font-black uppercase">MystiKeys</span>
        </Link>

        <section className="comic-panel relative overflow-hidden p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-2 w-1/3 bg-[#f4b72b]" />
          <header className="text-center">
            <h1 className="comic-title text-2xl font-black">{title}</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-5 text-[#a99bb5]">{subtitle}</p>
          </header>
          <div className="mt-7">{children}</div>
        </section>

        <Link to="/catalog" className="font-display mx-auto mt-6 flex w-fit items-center gap-2 text-[9px] font-bold uppercase text-[#a99bb5] hover:text-[#f4b72b]"><ArrowLeft className="h-4 w-4" /> Back to store</Link>
      </div>
    </div>
  );
}
