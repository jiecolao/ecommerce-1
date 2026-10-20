import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { toast, type ToastItem, type ToastType } from '../../lib/toast';

function getToastStyles(type: ToastType) {
  switch (type) {
    case 'error':
      return {
        bg: 'bg-[#25101b]',
        border: 'border-[#ff4d6d]',
        shadow: 'shadow-[5px_5px_0_#0e0917,7px_7px_0_rgba(255,77,109,0.35)]',
        badgeBg: 'bg-[#ff4d6d] text-[#0e0917]',
        icon: <AlertCircle className="h-5 w-5 text-[#ff4d6d] shrink-0" />,
        kickerText: 'OOPS!',
        barBg: 'bg-[#ff4d6d]',
      };
    case 'success':
      return {
        bg: 'bg-[#15231c]',
        border: 'border-[#4ade80]',
        shadow: 'shadow-[5px_5px_0_#0e0917,7px_7px_0_rgba(74,222,128,0.35)]',
        badgeBg: 'bg-[#e5a93c] text-[#0e0917]',
        icon: <CheckCircle2 className="h-5 w-5 text-[#4ade80] shrink-0" />,
        kickerText: 'AWESOME!',
        barBg: 'bg-[#4ade80]',
      };
    case 'warning':
      return {
        bg: 'bg-[#291e13]',
        border: 'border-[#f59e0b]',
        shadow: 'shadow-[5px_5px_0_#0e0917,7px_7px_0_rgba(245,158,11,0.35)]',
        badgeBg: 'bg-[#f59e0b] text-[#0e0917]',
        icon: <AlertTriangle className="h-5 w-5 text-[#f59e0b] shrink-0" />,
        kickerText: 'WAIT!',
        barBg: 'bg-[#f59e0b]',
      };
    case 'info':
    default:
      return {
        bg: 'bg-[#1a1426]',
        border: 'border-[#a855f7]',
        shadow: 'shadow-[5px_5px_0_#0e0917,7px_7px_0_rgba(168,85,247,0.35)]',
        badgeBg: 'bg-[#e5a93c] text-[#0e0917]',
        icon: <Info className="h-5 w-5 text-[#e5a93c] shrink-0" />,
        kickerText: 'NOTICE',
        barBg: 'bg-[#e5a93c]',
      };
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe((updated) => {
      setToasts(updated);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-3 pointer-events-none sm:bottom-6 sm:right-6"
    >
      {toasts.map((item) => {
        const styles = getToastStyles(item.type);

        return (
          <div
            key={item.id}
            role="alert"
            className={`pointer-events-auto relative overflow-hidden border-2 ${styles.border} ${styles.bg} ${styles.shadow} p-4 transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in`}
          >
            {/* Top Comic Angled Header */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`font-display inline-flex items-center border border-[#0e0917] px-2 py-0.5 text-[9px] font-black uppercase ${styles.badgeBg}`}
                  style={{ transform: 'skewX(-8deg)' }}
                >
                  <span style={{ transform: 'skewX(8deg)' }}>{styles.kickerText}</span>
                </span>
                <span className="font-display text-[11px] font-black uppercase tracking-wider text-[#f2edf7]">
                  {item.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toast.remove(item.id)}
                aria-label="Dismiss notification"
                className="grid h-6 w-6 place-items-center border border-[#0e0917] bg-[#160d22] text-[#bdaecf] transition-all hover:border-[#e5a93c] hover:text-[#f4b72b] hover:shadow-[1.5px_1.5px_0_#0e0917]"
              >
                <X className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Message Body */}
            <div className="flex items-start gap-3">
              {styles.icon}
              <p className="min-w-0 flex-1 font-sans text-xs font-semibold leading-relaxed text-[#eee8f5]">
                {item.message}
              </p>
            </div>

            {/* Decorative comic bottom bar */}
            <div className={`mt-3 h-1 w-full ${styles.barBg} opacity-80`} />
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;
