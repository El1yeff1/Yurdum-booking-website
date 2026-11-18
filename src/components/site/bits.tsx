import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import { photoFallback } from '@/lib/data';

export function Photo({ alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      alt={alt}
      referrerPolicy="no-referrer"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.dataset.fb) return;
        el.dataset.fb = '1';
        el.src = photoFallback(alt);
      }}
      {...rest}
    />
  );
}

export function ToastHost() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      setShow(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShow(false), 2100);
    };
    window.addEventListener('am-toast', on);
    return () => window.removeEventListener('am-toast', on);
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="status-toast"
      className="glass-strong fixed bottom-6 left-1/2 z-[95] flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium"
      style={{
        transform: `translateX(-50%) translateY(${show ? 0 : 24}px)`,
        opacity: show ? 1 : 0,
        transition: 'transform .5s var(--ease-film), opacity .4s',
        pointerEvents: 'none',
      }}
    >
      <span className="h-2 w-2 rounded-full bg-ember" />
      {msg}
    </div>
  );
}

export function Chapter({ n, label }: { n: string; label: string }) {
  return (
    <div className="js-chapter mono flex items-center gap-3 text-mist/70">
      <span className="text-ember">{n}</span>
      <span className="h-px w-10 bg-mist/30" />
      <span>{label}</span>
    </div>
  );
}
