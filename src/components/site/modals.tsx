import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { CalendarHeart, Check, Heart, Home as HomeIcon, ListChecks, Settings, Star, X } from 'lucide-react';
import { Photo } from './bits';
import type { SearchForm, ToolType } from './sections';
import { AMENITY_EN, CITIES, HOMES, TYPES, TYPE_EN, getNights, img, toast, todayStr, type Filters, type Home, type Plan } from '@/lib/data';
import { useLang } from '@/lib/i18n';

export type ModalState =
  | { kind: 'detail'; id: number }
  | { kind: 'booked'; id: number; a: string; b: string; g: number; total: number }
  | { kind: 'favs' }
  | { kind: 'tool'; type: ToolType };

function Shell({ children, onClose, wide, focusKey }: { children: ReactNode; onClose: () => void; wide?: boolean; focusKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { tr } = useLang();
  useLayoutEffect(() => {
    ref.current?.focus({ preventScroll: true });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tween = gsap.fromTo(ref.current, { y: 40, opacity: 0, scale: 0.98 }, {
      y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out',
      clearProps: 'transform,opacity',
    });
    return () => { tween.kill(); };
  }, []);
  useLayoutEffect(() => {
    const dialog = ref.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? dialog)?.focus({ preventScroll: true });
  }, [focusKey]);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const dialog = ref.current;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
        .filter((item) =>
          item.tabIndex >= 0 &&
          !item.hidden &&
          !item.closest('[inert], [aria-hidden="true"]') &&
          item.getClientRects().length > 0,
        );
      if (!items.length) {
        e.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || active === dialog || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const o = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = o;
    };
  }, [onClose]);
  return (
    <div data-testid="modal-backdrop" className="fixed left-0 top-0 z-[80] flex h-dvh w-screen items-end justify-center bg-[hsl(168_25%_3%/.6)] p-0 backdrop-blur-md sm:items-center sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); onClose(); } }}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`glass-strong modal-scroll relative max-h-[92dvh] w-full overflow-auto rounded-t-[32px] p-5 sm:rounded-[32px] sm:p-8 ${wide ? 'max-w-[860px]' : 'max-w-[620px]'}`}>
        <button type="button" onClick={onClose} aria-label={tr('Bağla', 'Close')} className="btn-ghost sticky top-0 z-10 float-right grid h-10 w-10 place-items-center" data-testid="button-close-modal"><X className="h-4 w-4" /></button>
        {children}
      </div>
    </div>
  );
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const H = ({ children }: { children: ReactNode }) => <h2 id="dialog-title" className="display mb-2 mr-12 mt-1 text-[clamp(32px,5vw,52px)] text-mist">{children}</h2>;
const Eyebrow = ({ children }: { children: ReactNode }) => <div className="mono mb-3 text-ember">{children}</div>;
const Lbl = ({ t, children }: { t: string; children: ReactNode }) => <label className="block min-w-0 flex-1"><span className="mono mb-1.5 block !text-[10px] text-mist/60">{t}</span>{children}</label>;
const Row = ({ l, r, strong }: { l: ReactNode; r: ReactNode; strong?: boolean }) => (
  <div className={`flex justify-between py-1.5 ${strong ? 'mt-1 border-t border-white/10 pt-3 font-bold' : ''}`}><span>{l}</span><span>{r}</span></div>
);
const Box = ({ children }: { children: ReactNode }) => <div className="my-4 rounded-[20px] border border-white/10 bg-white/[.04] p-4 text-sm">{children}</div>;
const Primary = (p: { onClick: () => void; children: ReactNode; dark?: boolean; disabled?: boolean; testid: string }) => (
  <button type="button" onClick={p.onClick} disabled={p.disabled} data-testid={p.testid} className={`mt-2 w-full py-4 ${p.dark ? 'btn-ghost font-semibold' : 'btn-ember'} ${p.disabled ? 'pointer-events-none opacity-40' : ''}`}>{p.children}</button>
);

/* ---------------- detail ---------------- */
function Detail({ h, form, onBooked }: { h: Home; form: SearchForm; onBooked: (m: ModalState) => void }) {
  const { tr } = useLang();
  const [a, setA] = useState(form.checkin);
  const [b, setB] = useState(form.checkout);
  const [g, setG] = useState(Math.min(form.guests, h.capacity));
  const [shown, setShown] = useState(!!(form.checkin && form.checkout));
  const n = getNights(a, b);
  const valid = a && b && n >= 1;
  const sub = n * h.price, fee = Math.round(sub * 0.08);
  const confirm = () => {
    if (!a || !b || n < 1 || a < todayStr() || g > h.capacity) { toast(tr('Tarix və qonaq sayını düzgün seç', 'Choose valid dates and guests')); return; }
    onBooked({ kind: 'booked', id: h.id, a, b, g, total: Math.round(n * h.price * 1.08) });
  };
  return (
    <>
      <Eyebrow>{h.city} · {tr('Azərbaycan', 'Azerbaijan')}</Eyebrow>
      <H>{tr(h.title, h.titleEn)}</H>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Star className="h-3.5 w-3.5 fill-current text-mist" /> {h.rating} · {h.capacity} {tr('qonaq üçün', 'guests')} · {tr('Ev sahibi', 'Host')}: Aysel</p>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:grid-rows-2">
        {h.imgs.slice(0, 5).map((x, i) => (
          <Photo key={i} src={img(x, 800)} alt={tr('Ev şəkli', 'Home photo')} className={`h-28 w-full rounded-2xl object-cover sm:h-40 ${i === 0 ? 'col-span-2 h-48 sm:col-span-1 sm:row-span-2 sm:h-full' : ''}`} />
        ))}
      </div>
      <div className="my-5 flex flex-wrap gap-2">
        {h.amenities.map((x) => <span key={x} className="rounded-full border border-white/15 px-3 py-1.5 text-[13px]">{tr(x, AMENITY_EN[x] ?? x)}</span>)}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{tr('Rahatlıq və yerli təcrübə üçün düşünülmüş bu məkanda səfərini öz ritminə uyğun yaşa. Şəkillər və məlumatlar demo məqsədlidir.', 'A place designed for comfort and local life — live the trip at your own pace. Photos and details are for demo purposes.')}</p>
      <h3 className="display mt-7 text-2xl">{tr('Rezervasiya', 'Booking')}</h3>
      <div className="mt-3 flex flex-wrap gap-3">
        <Lbl t={tr('Giriş', 'Check-in')}><input type="date" className="field-in" min={todayStr()} value={a} onChange={(e) => { setA(e.target.value); setShown(true); }} data-testid="input-detail-in" /></Lbl>
        <Lbl t={tr('Çıxış', 'Check-out')}><input type="date" className="field-in" min={a || todayStr()} value={b} onChange={(e) => { setB(e.target.value); setShown(true); }} data-testid="input-detail-out" /></Lbl>
        <Lbl t={tr('Qonaq', 'Guests')}><select className="field-in" value={g} onChange={(e) => setG(+e.target.value)} data-testid="select-detail-guests">{Array.from({ length: h.capacity }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></Lbl>
      </div>
      <Box>
        {!shown ? (
          <><Row l={`₼${h.price} × ${tr('gecə', 'night')}`} r={tr('Tarix seç', 'Pick dates')} /><Row l={tr('Xidmət haqqı (8%)', 'Service fee (8%)')} r="—" /><Row strong l={tr('Yekun', 'Total')} r="—" /></>
        ) : !valid ? (
          <span className="text-muted-foreground">{tr('Çıxış tarixi girişdən sonra olmalıdır.', 'Check-out must be after check-in.')}</span>
        ) : (
          <div data-testid="text-breakdown"><Row l={`₼${h.price} × ${n} ${tr('gecə', 'nights')}`} r={`₼${sub}`} /><Row l={tr('Xidmət haqqı (8%)', 'Service fee (8%)')} r={`₼${fee}`} /><Row strong l={tr('Yekun', 'Total')} r={`₼${sub + fee}`} /></div>
        )}
      </Box>
      <Primary onClick={() => setShown(true)} testid="button-calc">{tr('Məbləği hesabla', 'Calculate total')}</Primary>
      <Primary dark onClick={confirm} testid="button-confirm-booking">{tr('Sınaq rezervasiyasını təsdiqlə', 'Confirm test booking')}</Primary>
      <p className="mt-3 text-xs text-muted-foreground">{tr('Bu, real ödənişsiz sınaq rezervasiyasıdır.', 'This is a test booking with no real payment.')}</p>
    </>
  );
}

/* ---------------- props ---------------- */
export type ModalProps = {
  modal: ModalState; close: () => void; open: (m: ModalState) => void;
  form: SearchForm; favs: number[]; toggleFav: (id: number) => void;
  filters: Filters; applyFilters: (f: Filters) => void; clearAll: () => void;
  compare: number[]; setCompare: (c: number[]) => void;
  plans: Plan[]; setPlans: (p: Plan[]) => void; goHome: () => void;
};

export function Modals(p: ModalProps) {
  const { tr } = useLang();
  const m = p.modal;
  const focusKey = m.kind === 'detail' || m.kind === 'booked'
    ? `${m.kind}-${m.id}`
    : m.kind === 'tool' ? `tool-${m.type}` : m.kind;
  const find = (id: number) => HOMES.find((h) => h.id === id)!;
  const openDetail = (id: number) => p.open({ kind: 'detail', id });

  if (m.kind === 'detail') return <Shell wide focusKey={focusKey} onClose={p.close}><Detail key={m.id} h={find(m.id)} form={p.form} onBooked={p.open} /></Shell>;

  if (m.kind === 'booked') {
    const h = find(m.id);
    return (
      <Shell focusKey={focusKey} onClose={p.close}>
        <Eyebrow><span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" />{tr('Sınaq rezervasiyası tamamlandı', 'Test booking complete')}</span></Eyebrow>
        <H>{tr('Planın hazırdır!', 'Your plan is ready!')}</H>
        <p className="text-muted-foreground">{tr(h.title, h.titleEn)} · {h.city}</p>
        <Box><Row l={tr('Giriş', 'Check-in')} r={<b>{m.a}</b>} /><Row l={tr('Çıxış', 'Check-out')} r={<b>{m.b}</b>} /><Row l={tr('Qonaq sayı', 'Guests')} r={<b>{m.g}</b>} /><Row strong l={tr('Yekun məbləğ', 'Total')} r={`₼${m.total}`} /></Box>
        <p className="text-sm text-muted-foreground">{tr('Bu rezervasiya demo məqsədlidir. Heç bir ödəniş alınmayıb.', 'This booking is a demo. No payment was taken.')}</p>
        <Primary onClick={p.close} testid="button-booked-close">{tr('Bağla', 'Close')}</Primary>
      </Shell>
    );
  }

  if (m.kind === 'favs') {
    const fav = HOMES.filter((h) => p.favs.includes(h.id));
    return (
      <Shell wide focusKey={focusKey} onClose={p.close}>
        <H>{tr('Seçilmiş məkanların', 'Your saved places')}</H>
        <p className="text-muted-foreground">{tr('Saxladığın evlər bu brauzerdə yadda qalır.', 'Saved homes are remembered in this browser.')}</p>
        {fav.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {fav.map((h) => (
              <article key={h.id} className="group relative" data-testid={`card-fav-${h.id}`}>
                <button type="button" onClick={() => openDetail(h.id)} className="block w-full text-left" data-testid={`button-open-favorite-${h.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                    <Photo src={img(h.img, 500)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="glass absolute bottom-2 left-2 rounded-full px-2 py-1 text-xs">{h.city}</span>
                  </div>
                  <div className="mt-2 font-semibold">{h.city}</div>
                  <div className="truncate text-sm text-muted-foreground">{tr(h.title, h.titleEn)}</div>
                  <b className="text-sm">₼{h.price} / {tr('gecə', 'night')}</b>
                </button>
                <button type="button" onClick={() => p.toggleFav(h.id)} aria-label={tr('Seçilmişlərdən çıxar', 'Remove from favourites')} className="glass absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full" data-testid={`button-unfav-${h.id}`}>
                  <Heart className="h-4 w-4 fill-ember text-ember" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-white/15 px-6 py-14 text-center">
            <Heart className="mx-auto h-8 w-8 text-ember" />
            <h3 className="display mt-4 text-2xl">{tr('Hələ heç nə saxlamamısan', "You haven't saved anything yet")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{tr('Elanlardakı ürək işarəsinə toxunaraq evləri bura əlavə et.', 'Tap the heart on any listing to add it here.')}</p>
          </div>
        )}
      </Shell>
    );
  }

  const t = m.type;
  if (t === 'filters') return <Shell focusKey={focusKey} onClose={p.close}><FiltersBody {...p} /></Shell>;
  if (t === 'compare') return <Shell wide focusKey={focusKey} onClose={p.close}><CompareBody {...p} /></Shell>;
  if (t === 'split') return <Shell focusKey={focusKey} onClose={p.close}><SplitBody /></Shell>;
  if (t === 'surprise') return <Shell focusKey={focusKey} onClose={p.close}><SurpriseBody onOpen={openDetail} /></Shell>;
  if (t === 'trip') return <Shell focusKey={focusKey} onClose={p.close}><TripBody {...p} /></Shell>;
  if (t === 'profile')
    return (
      <Shell focusKey={focusKey} onClose={p.close}>
        <H>{tr('Profil', 'Profile')}</H>
        <p className="text-muted-foreground">{tr('Yurdum təcrübənə xoş gəlmisən.', 'Welcome to Yurdum.')}</p>
        <div className="my-5 flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/[.04] p-4">
          <div className="display grid h-14 w-14 place-items-center rounded-full bg-ember text-2xl text-white">Y</div>
          <div><b>{tr('Qonaq profili', 'Guest profile')}</b><p className="text-sm text-muted-foreground">{tr('Demo hesab · Giriş tələb olunmur', 'Demo account · No sign-in required')}</p></div>
        </div>
        <div className="grid gap-2">
          {[
            { i: Heart, l: tr('Seçilmişlər', 'Favourites'), f: () => p.open({ kind: 'favs' }), id: 'favs' },
            { i: CalendarHeart, l: tr('Səfər planım', 'My trips'), f: () => p.open({ kind: 'tool', type: 'trip' }), id: 'trip' },
            { i: Settings, l: tr('Menyu', 'Menu'), f: () => p.open({ kind: 'tool', type: 'menu' }), id: 'menu' },
          ].map((x) => (
            <button key={x.id} onClick={x.f} className="btn-ghost flex items-center gap-3 !rounded-[16px] px-4 py-3.5 text-left font-semibold" data-testid={`button-profile-${x.id}`}><x.i className="h-4 w-4 text-ember" />{x.l}</button>
          ))}
        </div>
      </Shell>
    );
  return (
    <Shell focusKey={focusKey} onClose={p.close}>
      <H>{tr('Yurdum menyusu', 'Yurdum menu')}</H>
      <div className="mt-4 grid gap-2">
        <button onClick={() => { p.close(); p.goHome(); }} className="btn-ghost flex items-center gap-3 !rounded-[16px] px-4 py-3.5 text-left font-semibold" data-testid="button-menu-home"><HomeIcon className="h-4 w-4 text-ember" />{tr('Ana səhifə', 'Home')}</button>
        <button onClick={() => p.open({ kind: 'favs' })} className="btn-ghost flex items-center gap-3 !rounded-[16px] px-4 py-3.5 text-left font-semibold" data-testid="button-menu-favs"><Heart className="h-4 w-4 text-ember" />{tr('Seçilmişlər', 'Favourites')}</button>
        <button onClick={() => p.open({ kind: 'tool', type: 'trip' })} className="btn-ghost flex items-center gap-3 !rounded-[16px] px-4 py-3.5 text-left font-semibold" data-testid="button-menu-trip"><ListChecks className="h-4 w-4 text-ember" />{tr('Səfər planım', 'My trips')}</button>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{tr('Demo versiya · Giriş tələb olunmur', 'Demo version · No sign-in required')}</p>
    </Shell>
  );
}

function FiltersBody(p: ModalProps) {
  const { tr } = useLang();
  const [f, setF] = useState<Filters>(p.filters);
  return (
    <>
      <H>{tr('Axtarış filtrləri', 'Search filters')}</H>
      <div className="mt-5 grid gap-4">
        <Lbl t={tr('Gecəlik maksimum qiymət (₼)', 'Max price per night (₼)')}>
          <input type="number" min={0} className="field-in" value={f.max} onChange={(e) => setF((current) => ({ ...current, max: Math.max(0, Number(e.target.value) || 0) }))} data-testid="input-filter-max" />
          <input type="range" min={50} max={300} step={5} value={Math.min(f.max, 300)} onChange={(e) => setF((current) => ({ ...current, max: Number(e.target.value) }))} className="mt-3 w-full accent-[#ff5a5f]" aria-label={tr('Maksimum gecəlik qiymət', 'Maximum nightly price')} />
        </Lbl>
        <Lbl t={tr('Yaşayış növü', 'Stay type')}>
          <select className="field-in" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} data-testid="select-filter-type">
            <option value="Hamısı">{tr('Hamısı', 'All')}</option>
            {TYPES.map((x) => <option key={x} value={x}>{tr(x, TYPE_EN[x])}</option>)}
          </select>
        </Lbl>
        <div className="flex gap-3">
          {(['wifi', 'desk'] as const).map((k) => (
          <button type="button" key={k} onClick={() => setF((current) => ({ ...current, [k]: !current[k] }))} aria-pressed={f[k]} className={`flex-1 rounded-[16px] border px-4 py-3 text-sm font-semibold transition-colors ${f[k] ? 'border-ember bg-ember/15 text-white' : 'border-white/15 bg-white/[.04]'}`} data-testid={`toggle-filter-${k}`}>
              {f[k] && <Check className="mr-1.5 inline h-4 w-4" />}{k === 'wifi' ? 'Wi-Fi' : tr('İş masası', 'Desk')}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4"><Primary onClick={() => p.applyFilters(f)} testid="button-apply-filters">{tr('Nəticələri göstər', 'Show results')}</Primary></div>
      <button type="button" onClick={() => { p.clearAll(); p.close(); }} className="mt-3 w-full py-3 text-sm font-semibold text-muted-foreground underline underline-offset-4" data-testid="button-clear-filters">{tr('Hamısını təmizlə', 'Clear all')}</button>
    </>
  );
}

function CompareBody(p: ModalProps) {
  const { tr } = useLang();
  const toggle = (id: number) => {
    const on = !p.compare.includes(id);
    if (on && p.compare.length >= 3) { toast(tr('Maksimum 3 elan seçilə bilər', 'You can pick up to 3 listings')); return; }
    p.setCompare(on ? [...p.compare, id] : p.compare.filter((x) => x !== id));
  };
  const hs = HOMES.filter((h) => p.compare.includes(h.id));
  return (
    <>
      <H>{tr('Evləri müqayisə et', 'Compare homes')}</H>
      <p className="text-muted-foreground">{tr('Müqayisə üçün maksimum 3 elan seç.', 'Pick up to 3 listings to compare.')}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {HOMES.map((h) => {
          const on = p.compare.includes(h.id);
          return (
            <button type="button" key={h.id} onClick={() => toggle(h.id)} aria-pressed={on} className={`flex items-center gap-2.5 rounded-[14px] border p-2 text-left text-sm transition-colors ${on ? 'border-ember bg-ember/10' : 'border-white/10 bg-white/[.03] hover:bg-white/[.07]'}`} data-testid={`toggle-compare-${h.id}`}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? 'border-ember bg-ember' : 'border-white/30'}`}>{on && <Check className="h-3 w-3 text-white" />}</span>
              <span className="truncate">{h.city} · ₼{h.price}</span>
            </button>
          );
        })}
      </div>
      {hs.length ? (
        <div className="mt-6 overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              <tr><th />{hs.map((h) => <th key={h.id} className="p-2 text-left align-top"><Photo src={img(h.img, 300)} alt={h.city} className="mb-2 h-16 w-24 rounded-xl object-cover" />{h.city}</th>)}</tr>
              {[
                [tr('Qiymət', 'Price'), (h: Home) => `₼${h.price}/${tr('gecə', 'night')}`],
                [tr('Tutum', 'Capacity'), (h: Home) => `${h.capacity} ${tr('qonaq', 'guests')}`],
                [tr('Reytinq', 'Rating'), (h: Home) => `${h.rating}`],
                [tr('İmkanlar', 'Amenities'), (h: Home) => h.amenities.slice(0, 3).map((a) => tr(a, AMENITY_EN[a] ?? a)).join(', ')],
              ].map(([l, f]) => (
                <tr key={l as string} className="border-t border-white/10">
                  <td className="mono p-2 !text-[10px] text-mist/60">{l as string}</td>
                  {hs.map((h) => <td key={h.id} className="p-2">{(f as (h: Home) => string)(h)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="mt-6 text-sm text-muted-foreground">{tr('Müqayisə üçün elan seç.', 'Select listings to compare.')}</p>}
    </>
  );
}

function SplitBody() {
  const { tr } = useLang();
  const [id, setId] = useState(HOMES[0].id);
  const [n, setN] = useState(3);
  const [g, setG] = useState(4);
  const [res, setRes] = useState<null | { sub: number; fee: number; total: number; g: number }>(null);
  const home = HOMES.find((x) => x.id === id) ?? HOMES[0];
  const calc = () => {
    const nn = Math.max(1, n), gg = Math.min(home.capacity, Math.max(1, g)), sub = home.price * nn, fee = Math.round(sub * 0.08);
    setRes({ sub, fee, total: sub + fee, g: gg });
  };
  return (
    <>
      <H>{tr('Dostlarla büdcəni böl', 'Split the budget')}</H>
      <p className="text-muted-foreground">{tr('Ev və səfər müddətini seç, hər kəsin payını hesabla.', "Pick a home and length, then see everyone's share.")}</p>
      <div className="mt-5 grid gap-3">
        <Lbl t={tr('Elan', 'Listing')}><select className="field-in" value={id} onChange={(e) => {
          const nextId = Number(e.target.value);
          const nextHome = HOMES.find((x) => x.id === nextId) ?? HOMES[0];
          setId(nextHome.id);
          setG((current) => Math.min(current, nextHome.capacity));
        }} data-testid="select-split-home">{HOMES.map((h) => <option key={h.id} value={h.id}>{h.city} · {tr(h.title, h.titleEn)} · ₼{h.price}/{tr('gecə', 'night')}</option>)}</select></Lbl>
        <div className="flex gap-3">
          <Lbl t={tr('Gecə sayı', 'Nights')}><input type="number" min={1} step={1} className="field-in" value={n} onChange={(e) => setN(Math.max(1, Math.floor(Number(e.target.value) || 1)))} data-testid="input-split-nights" /></Lbl>
          <Lbl t={tr('Qonaq sayı', 'Guests')}><input type="number" min={1} max={home.capacity} step={1} className="field-in" value={g} onChange={(e) => setG(Math.min(home.capacity, Math.max(1, Math.floor(Number(e.target.value) || 1))))} data-testid="input-split-guests" /></Lbl>
        </div>
      </div>
      <Box>
        {res ? (
          <div data-testid="text-split-result"><Row l={tr('Yaşayış', 'Stay')} r={<b>₼{res.sub}</b>} /><Row l={tr('Xidmət haqqı', 'Service fee')} r={<b>₼{res.fee}</b>} /><Row l={tr('Ümumi', 'Total')} r={<b>₼{res.total}</b>} />
            <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3"><span>{tr('Hər nəfərə', 'Per person')} ({res.g})</span><span className="display text-4xl text-ember">₼{Math.ceil(res.total / res.g)}</span></div></div>
        ) : <span className="text-muted-foreground">{tr('Hesablamaq üçün dəyərləri daxil et.', 'Enter values to calculate.')}</span>}
      </Box>
      <Primary onClick={calc} testid="button-split-calc">{tr('Hesabla', 'Calculate')}</Primary>
    </>
  );
}

function SurpriseBody({ onOpen }: { onOpen: (id: number) => void }) {
  const { tr } = useLang();
  const [c, setC] = useState('');
  const [g, setG] = useState(2);
  const [max, setMax] = useState<number | null>(180);
  const [pick, setPick] = useState<Home | null | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);
  const go = () => {
    const opts = HOMES.filter((h) => (!c || h.city === c) && h.capacity >= g && (max === null || h.price <= max));
    setPick(opts.length ? opts[Math.floor(Math.random() * opts.length)] : null);
    requestAnimationFrame(() => ref.current && gsap.fromTo(ref.current, { scale: 0.96, opacity: 0, y: 14 }, { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }));
  };
  return (
    <>
      <Eyebrow>{tr('Bir az təsadüf, çoxlu xatirə', 'A little chance, many memories')}</Eyebrow>
      <H>{tr('Büdcənə uyğun sürpriz', 'A surprise within budget')}</H>
      <p className="text-muted-foreground">{tr('Ərazi, qonaq sayı və gecəlik limitini seç. Yurdum sənə bir məkan tapsın.', 'Pick an area, guests and nightly limit. Let Yurdum find you a place.')}</p>
      <div className="my-5 flex flex-wrap gap-3">
        <Lbl t={tr('Ərazi', 'Area')}><select className="field-in" value={c} onChange={(e) => setC(e.target.value)} data-testid="select-surprise-city"><option value="">{tr('Fərqi yoxdur', 'Anywhere')}</option>{CITIES.map((x) => <option key={x}>{x}</option>)}</select></Lbl>
        <Lbl t={tr('Qonaq sayı', 'Guests')}><input type="number" min={1} max={8} className="field-in" value={g} onChange={(e) => setG(Math.min(8, Math.max(1, Number(e.target.value) || 1)))} data-testid="input-surprise-guests" /></Lbl>
        <Lbl t={tr('Max ₼/gecə', 'Max ₼/night')}><input type="number" min={0} className="field-in" value={max ?? ''} onChange={(e) => setMax(e.target.value === '' ? null : Math.max(0, Number(e.target.value) || 0))} data-testid="input-surprise-max" /></Lbl>
      </div>
      <Primary onClick={go} testid="button-surprise-go">{tr('Mənim üçün seç', 'Pick for me')}</Primary>
      <div ref={ref}>
        {pick === null && <p className="mt-5 text-sm text-muted-foreground">{tr('Bu büdcə və seçimlə uyğun ev tapılmadı. Limitini artır.', 'Nothing fits this budget. Raise your limit.')}</p>}
        {pick && (
          <button type="button" onClick={() => onOpen(pick.id)} className="group mt-5 block w-full overflow-hidden rounded-[24px] border border-white/10 text-left" data-testid="card-surprise">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Photo src={img(pick.img, 800)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="glass absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-semibold">{tr('Sənin sürprizin', 'Your surprise')}</span>
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div><b>{pick.city} · {tr(pick.title, pick.titleEn)}</b><p className="text-sm text-muted-foreground">₼{pick.price}/{tr('gecə', 'night')} · {pick.capacity} {tr('qonaq', 'guests')}</p></div>
              <span className="btn-ember shrink-0 px-4 py-2 text-sm">{tr('Elanı aç', 'Open')}</span>
            </div>
          </button>
        )}
      </div>
    </>
  );
}

function TripBody(p: ModalProps) {
  const { tr } = useLang();
  const saved = HOMES.filter((h) => p.favs.includes(h.id));
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [hid, setHid] = useState<number>(saved[0]?.id ?? 0);
  const add = () => {
    if (!hid) { toast(tr('Əvvəl ev seçilmişlərə əlavə edilməlidir', 'Save a home to favourites first')); return; }
    p.setPlans([...p.plans, { key: Date.now(), id: hid, name, date }]);
    setName(''); setDate('');
    toast(tr('Səfər siyahısına əlavə edildi', 'Added to your trip list'));
  };
  return (
    <>
      <H>{tr('Səfər planım', 'My trip plan')}</H>
      <p className="text-muted-foreground">{tr('Seçilmiş evləri səfər tarixlərinə görə siyahılara əlavə et.', 'Add saved homes to lists by trip date.')}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Lbl t={tr('Səfər adı', 'Trip name')}><input className="field-in" placeholder={tr('Məsələn, Qış tətili', 'e.g. Winter break')} value={name} onChange={(e) => setName(e.target.value)} data-testid="input-plan-name" /></Lbl>
        <Lbl t={tr('Tarix', 'Date')}><input type="date" className="field-in" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-plan-date" /></Lbl>
      </div>
      <div className="mt-3"><Lbl t={tr('Seçilmiş ev', 'Saved home')}>
        <select className="field-in" value={hid} onChange={(e) => setHid(+e.target.value)} disabled={!saved.length} data-testid="select-plan-home">
          {saved.length ? saved.map((h) => <option key={h.id} value={h.id}>{h.city} · {tr(h.title, h.titleEn)}</option>) : <option value={0}>—</option>}
        </select>
      </Lbl></div>
      <div className="mt-3"><Primary onClick={add} disabled={!saved.length} testid="button-add-plan">{tr('Siyahıya əlavə et', 'Add to list')}</Primary></div>
      <div className="mt-6 grid gap-3">
        {p.plans.length ? p.plans.map((pl, i) => (
          <div key={pl.key} className="flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/[.04] p-4" data-testid={`row-plan-${pl.key}`}>
            <span className="display text-3xl text-ember">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1"><b className="block truncate">{pl.name || tr('Səfər', 'Trip')} · {pl.date || tr('Tarix seçilməyib', 'No date')}</b><p className="truncate text-sm text-muted-foreground">{(() => { const h = HOMES.find((x) => x.id === pl.id); return h ? tr(h.title, h.titleEn) : tr('Elan', 'Listing'); })()}</p></div>
            <button onClick={() => p.setPlans(p.plans.filter((x) => x.key !== pl.key))} className="btn-ghost shrink-0 px-3 py-2 text-xs font-semibold" data-testid={`button-remove-plan-${pl.key}`}>{tr('Siyahıdan çıxar', 'Remove')}</button>
          </div>
        )) : <p className="text-sm text-muted-foreground">{tr('Hələ səfər siyahısı yoxdur. Əvvəlcə evləri seçilmişlərə əlavə et.', 'No trip lists yet. Save some homes first.')}</p>}
      </div>
    </>
  );
}
