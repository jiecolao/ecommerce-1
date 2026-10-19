import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authSession } from '../../lib/auth';

export default function AdminAccountMenu({ children, className }: { children: ReactNode; className: string }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const result = await authSession.logout();
      navigate('/login', { replace: true });
      if (!result.serverConfirmed) window.alert('Signed out in this browser. Server-side sign out could not be confirmed.');
    } catch { window.alert('Sign out could not be completed. Please try again.'); }
    finally { setSigningOut(false); }
  };

  return (
    <div
      ref={container}
      className="relative shrink-0"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label="Administrator account options"
        aria-expanded={open}
        aria-controls={panelId}
        className={`${className} text-left`}
        onClick={() => setOpen(current => !current)}
      >
        {children}
      </button>
      {open && (
        <nav id={panelId} aria-label="Administrator account" className="absolute right-0 top-full z-50 mt-2 w-48 border-2 border-[#0e0917] bg-[#1c1427] p-2 shadow-[4px_4px_0_#0e0917]">
          <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="flex h-10 w-full items-center gap-2 px-3 text-sm font-bold text-[#d6c9e5] hover:bg-[#e5a93c] hover:text-[#0e0917]">
            <ShieldCheck className="h-4 w-4" /> Admin dashboard
          </Link>
          <button type="button" disabled={signingOut} onClick={handleLogout} className="flex h-10 w-full items-center gap-2 px-3 text-left text-sm font-bold text-[#d6c9e5] hover:bg-[#e5a93c] hover:text-[#0e0917]">
            <LogOut className="h-4 w-4" /> {signingOut ? 'Signing out...' : 'Logout'}
          </button>
        </nav>
      )}
    </div>
  );
}
