import { useEffect, useState, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { toast, type ToastItem, type ToastType } from '../../lib/toast';

function getToastStyles(type: ToastType) {
  switch (type) {
    case 'error':
      return {
        bg: 'bg-[#220c18]/95',
        border: 'border-[#ff4d6d]',
        shadow: 'shadow-[4px_4px_0_#0e0917,6px_6px_0_rgba(255,77,109,0.35)]',
        badgeBg: 'bg-[#ff4d6d] text-[#0e0917]',
        icon: <AlertCircle className="h-5 w-5 text-[#ff4d6d] shrink-0" />,
        kickerText: 'OOPS!',
        barBg: 'bg-[#ff4d6d]',
      };
    case 'success':
      return {
        bg: 'bg-[#102218]/95',
        border: 'border-[#4ade80]',
        shadow: 'shadow-[4px_4px_0_#0e0917,6px_6px_0_rgba(74,222,128,0.35)]',
        badgeBg: 'bg-[#4ade80] text-[#0e0917]',
        icon: <CheckCircle2 className="h-5 w-5 text-[#4ade80] shrink-0" />,
        kickerText: 'SUCCESS!',
        barBg: 'bg-[#4ade80]',
      };
    case 'warning':
      return {
        bg: 'bg-[#281a0e]/95',
        border: 'border-[#f59e0b]',
        shadow: 'shadow-[4px_4px_0_#0e0917,6px_6px_0_rgba(245,158,11,0.35)]',
        badgeBg: 'bg-[#f59e0b] text-[#0e0917]',
        icon: <AlertTriangle className="h-5 w-5 text-[#f59e0b] shrink-0" />,
        kickerText: 'HOLD UP!',
        barBg: 'bg-[#f59e0b]',
      };
    case 'info':
    default:
      return {
        bg: 'bg-[#181126]/95',
        border: 'border-[#a855f7]',
        shadow: 'shadow-[4px_4px_0_#0e0917,6px_6px_0_rgba(168,85,247,0.35)]',
        badgeBg: 'bg-[#e5a93c] text-[#0e0917]',
        icon: <Info className="h-5 w-5 text-[#e5a93c] shrink-0" />,
        kickerText: 'NOTICE',
        barBg: 'bg-[#e5a93c]',
      };
  }
}

function ToastCard({ item }: { item: ToastItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const duration = item.duration ?? 5000;
  const timeLeftRef = useRef(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;

    const interval = window.setInterval(() => {
      if (!isHovered) {
        timeLeftRef.current -= 50;
        const remainingPct = Math.max(0, (timeLeftRef.current / duration) * 100);
        setProgress(remainingPct);

        if (timeLeftRef.current <= 0) {
          window.clearInterval(interval);
          toast.remove(item.id);
        }
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [item.id, duration, isHovered]);

  const styles = getToastStyles(item.type);

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden backdrop-blur-md border-[2.5px] ${styles.border} ${styles.bg} ${styles.shadow} p-4 transition-all duration-200 transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-3 fade-in`}
    >
      {/* Top Comic Angled Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`font-display inline-flex items-center border border-[#0e0917] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${styles.badgeBg}`}
            style={{ transform: 'skewX(-8deg)' }}
          >
            <span style={{ transform: 'skewX(8deg)' }}>{styles.kickerText}</span>
          </span>
          <span className="font-display text-[11px] font-black uppercase tracking-wider text-[#f2edf7] drop-shadow-[1px_1px_0_#0e0917]">
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
        <div className="min-w-0 flex-1">
          <p className="font-sans text-xs font-semibold leading-relaxed text-[#eee8f5]">
            {item.message}
          </p>

          {/* Action button if present */}
          {item.action && (
            <button
              type="button"
              onClick={() => {
                item.action?.onClick();
                toast.remove(item.id);
              }}
              className="mt-3 inline-flex h-8 items-center gap-1.5 border-2 border-[#0e0917] bg-[#e5a93c] px-3 font-display text-[10px] font-black uppercase text-[#0e0917] shadow-[2px_2px_0_#0e0917] hover:bg-[#ffd45e] hover:translate-x-0.5 transition-all cursor-pointer"
            >
              <span>{item.action.label}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* Animated Countdown Progress Bar */}
      {duration > 0 && (
        <div className="mt-3.5 h-1 w-full bg-[#0e0917]/50 overflow-hidden">
          <div
            className={`h-full ${styles.barBg} transition-[width] duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
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
      className="fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-3 pointer-events-none sm:bottom-6 sm:right-6"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default Toaster;
