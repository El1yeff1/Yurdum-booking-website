import { lazy, Suspense, useEffect, useState, type Dispatch, type SetStateAction, type PointerEvent as RPointerEvent } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Briefcase, Building2, CalendarRange, Gift, Heart, Home as HomeIcon,
  LayoutGrid, Map as MapIcon, Menu, Mountain, Search, SlidersHorizontal, Sparkles, Star, Users, Waves, Shuffle,
  Columns3, Wallet, Laptop, ListChecks,
} from 'lucide-react';
import { Photo, Chapter } from './bits';
import { BrandLogo } from './brand-logo';
import { DoorwayBackdrop } from './doorway-backdrop';
import { AMENITY_EN, CITIES, HERO_IMG, TYPE_EN, img, todayStr, type Home } from '@/lib/data';
import { useLang } from '@/lib/i18n';

export type SearchForm = { dest: string; checkin: string; checkout: string; guests: number };
export type ToolType = 'filters' | 'compare' | 'split' | 'surprise' | 'trip' | 'profile' | 'menu';
const MapPanel = lazy(() => import('./map-panel').then(({ MapPanel }) => ({ default: MapPanel })));

/* ---------- ATMOSPHERE ---------- */
export function Atmosphere() {
  return (
    <div className="atmos" aria-hidden="true">
      <div className="atmos-img js-atmos-img">
        <Photo src={img(HERO_IMG, 2200)} alt="Dumanlı dağ və meşə" fetchPriority="high" className="js-atmos-photo" />
      </div>
      <div className="atmos-grad" />
      <div className="atmos-veil js-veil" />
      <div className="atmos-dusk js-dusk" />
      <div className="mist m1 js-mist" />
      <div className="mist m2 js-mist" />
      <div className="mist m3 js-mist" />
    </div>
  );
}

/* ---------- HEADER ---------- */
export function Header(p: {
  form: SearchForm; setForm: Dispatch<SetStateAction<SearchForm>>; onQuick: () => void; onHome: () => void;
  onTool: (t: ToolType) => void; onFavs: () => void; favCount: number;
}) {
  const { tr, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 40));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`site-header fixed inset-x-0 top-0 z-40 ${scrolled ? 'scrolled' : ''}`}>
      <div className="flex h-[76px] items-center justify-between gap-4 px-4 md:h-[88px] md:px-8 lg:px-12">
        <button onClick={p.onHome} aria-label={tr('Yurdum ana səhifə', 'Yurdum home')} data-testid="link-home" className="js-head-in shrink-0">
          <BrandLogo />
        </button>
        <div className="js-head-in glass hidden items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 lg:flex">
          <Search className="h-4 w-4 text-mist/60" />
          <input
            value={p.form.dest}
            onChange={(e) => p.setForm((f) => ({ ...f, dest: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && p.onQuick()}
            placeholder={tr('Haraya gedirsən?', 'Where are you going?')}
            className="w-40 bg-transparent text-sm outline-none placeholder:text-mist/50"
            data-testid="input-quick-dest"
          />
          <span className="h-6 w-px bg-mist/20" />
          <Users className="h-4 w-4 text-mist/60" />
          <input
            type="number" min={1} max={8} value={p.form.guests}
            onChange={(e) => p.setForm((f) => ({ ...f, guests: Math.min(Math.max(+e.target.value || 1, 1), 8) }))}
            className="w-10 bg-transparent text-sm outline-none" aria-label={tr('Qonaqlar', 'Guests')}
            data-testid="input-quick-guests"
          />
          <button onClick={p.onQuick} className="btn-ember px-5 py-2.5 text-sm" data-testid="button-quick-search">{tr('Axtar', 'Search')}</button>
        </div>
        <div className="js-head-in flex items-center gap-2">
          <button onClick={() => p.onTool('trip')} className="btn-ghost hidden px-4 py-2.5 text-sm font-semibold md:block" data-testid="button-trip-header">{tr('Səfər planım', 'My trips')}</button>
          <button onClick={toggle} className="btn-ghost px-3.5 py-2.5 text-xs font-semibold tracking-wider" data-testid="button-lang">
            {lang === 'AZ' ? <><b>AZ</b><span className="opacity-40"> | EN</span></> : <><b>EN</b><span className="opacity-40"> | AZ</span></>}
          </button>
          <button onClick={p.onFavs} aria-label={tr('Seçilmişlər', 'Favourites')} className="btn-ghost relative grid h-11 w-11 place-items-center" data-testid="button-favorites">
            <Heart className="h-[18px] w-[18px]" />
            {p.favCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[10px] font-bold text-white">{p.favCount}</span>}
          </button>
          <button onClick={() => p.onTool('profile')} aria-label={tr('Profil və menyu', 'Profile and menu')} className="btn-ghost flex h-11 items-center gap-2 pl-3 pr-1.5" data-testid="button-profile">
            <Menu className="hidden h-4 w-4 sm:block" />
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ember text-sm font-bold text-white">Y</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- HERO ---------- */
export function Hero(p: { onCity: (c: string) => void }) {
  const { tr } = useLang();
  return (
    <section id="hero" className="js-hero relative h-[100svh] min-h-[620px] w-full overflow-hidden" aria-label="Hero">
      <h1 className="js-hero-title hero-title display pointer-events-none absolute left-4 z-10 m-0 text-mist md:left-8 lg:left-12" style={{ textShadow: '0 8px 60px rgba(0,0,0,.35)' }}>
        <span className="hl"><span className="hx js-hx js-hx1">{tr('Başqa yer.', 'Somewhere new.')}</span></span>
        <span className="hl"><span className="hx js-hx js-hx2">{tr('Başqa sən.', 'A newer you.')}</span></span>
      </h1>

      <div className="js-hero-copy hero-copy absolute left-4 z-20 max-w-[330px] md:left-8 lg:left-12">
        <div className="mono js-hc mb-4 text-mist/60">40.98°N · 47.85°E — Qəbələ</div>
        <h2 className="js-hc display mb-3 text-[22px] !leading-[1.05] !tracking-[-0.03em] text-white md:text-[28px]">
          {tr('Dağların və meşələrin', 'We shaped a stillness')}<br />{tr('arasında sakitlik tapdıq.', 'among the pines.')}
        </h2>
      </div>

      <button onClick={() => p.onCity('Quba')} className="js-hero-card js-card-a hero-card glass absolute right-[7vw] top-[38%] z-20 hidden w-[270px] items-center gap-3 rounded-[22px] p-2.5 text-left md:flex" data-testid="button-hero-card-quba">
        <Photo src={img('photo-1518780664697-55e3ad937233', 400)} alt="" className="h-[72px] w-[72px] flex-none rounded-[14px] object-cover" />
        <span><b className="block text-sm leading-tight text-white">Quba · A-frame</b><small className="mt-1 block text-[11.5px] leading-snug text-white/70">{tr('Meşənin kənarında, pəncərənin o üzündə sakitlik.', 'At the forest edge, stillness beyond the glass.')}</small></span>
        <i className="dot -left-7 -bottom-14" />
        <span className="absolute -bottom-12 -left-[23px] h-12 w-px bg-gradient-to-b from-white to-transparent" />
      </button>
      <button onClick={() => p.onCity('Lənkəran')} className="js-hero-card js-card-b hero-card glass absolute bottom-[150px] right-4 z-20 flex w-[248px] items-center gap-3 rounded-[22px] p-2.5 text-left md:bottom-28 md:left-[38vw] md:right-auto md:w-[270px]" data-testid="button-hero-card-lankaran">
        <Photo src={img('photo-1505693416388-ac5ce068fe85', 400)} alt="" className="h-[64px] w-[64px] flex-none rounded-[14px] object-cover md:h-[72px] md:w-[72px]" />
        <span><b className="block text-sm leading-tight text-white">{tr('Hovuzlu bağ evi', 'Garden house with pool')}</b><small className="mt-1 block text-[11.5px] leading-snug text-white/70">{tr('Gəl. Dincəl. Bir nəfər, ya iki.', 'Come. Rest. One of you, or two.')}</small></span>
        <i className="dot right-9 -top-10" />
        <span className="absolute -top-9 right-[39px] h-8 w-px bg-gradient-to-t from-white to-transparent" />
      </button>

      <div className="scroll-cue absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="mono text-[10px] text-mist/60">{tr('aşağı sürüşdür', 'scroll')}</span>
        <div className="relative h-10 w-px overflow-hidden bg-mist/20"><span className="absolute inset-0 bg-mist" /></div>
      </div>
    </section>
  );
}

/* ---------- SEARCH ---------- */
export function SearchBar(p: { form: SearchForm; setForm: Dispatch<SetStateAction<SearchForm>>; onSearch: () => void }) {
  const { tr } = useLang();
  const f = p.form;
  const set = (k: keyof SearchForm, v: string | number) => p.setForm((x) => ({ ...x, [k]: v }));
  const lbl = 'mono mb-1 block !text-[10px] text-ember';
  const inp = 'w-full bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-mist/45';
  return (
    <div id="search" className="js-search relative z-20 mx-auto mt-8 w-full max-w-[1120px]">
      <div className="glass-strong grid grid-cols-1 gap-1 rounded-[28px] p-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_.9fr_auto] lg:items-center lg:rounded-full">
        <label className="rounded-[22px] px-5 py-3 transition-colors focus-within:bg-white/10 hover:bg-white/5 lg:rounded-full">
          <span className={lbl}>{tr('Haraya?', 'Where to?')}</span>
          <input list="destinations" value={f.dest} onChange={(e) => set('dest', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && p.onSearch()} placeholder={tr('Şəhər və ya məkan', 'City or place')} className={inp} data-testid="input-dest" />
          <datalist id="destinations">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <label className="rounded-[22px] px-5 py-3 transition-colors focus-within:bg-white/10 hover:bg-white/5 lg:rounded-full">
          <span className={lbl}>{tr('Giriş tarixi', 'Check-in')}</span>
          <input type="date" min={todayStr()} value={f.checkin} onChange={(e) => set('checkin', e.target.value)} className={inp} data-testid="input-checkin" />
        </label>
        <label className="rounded-[22px] px-5 py-3 transition-colors focus-within:bg-white/10 hover:bg-white/5 lg:rounded-full">
          <span className={lbl}>{tr('Çıxış tarixi', 'Check-out')}</span>
          <input type="date" min={f.checkin || todayStr()} value={f.checkout} onChange={(e) => set('checkout', e.target.value)} className={inp} data-testid="input-checkout" />
        </label>
        <label className="rounded-[22px] px-5 py-3 transition-colors focus-within:bg-white/10 hover:bg-white/5 lg:rounded-full">
          <span className={lbl}>{tr('Qonaqlar', 'Guests')}</span>
          <select value={f.guests} onChange={(e) => set('guests', +e.target.value)} className={inp} data-testid="select-guests">
            {Array.from({ length: 8 }, (_, i) => <option key={i} value={i + 1}>{i + 1} {tr('qonaq', i ? 'guests' : 'guest')}</option>)}
          </select>
        </label>
        <button onClick={p.onSearch} className="btn-ember flex h-14 items-center justify-center gap-2 px-8 text-[15px] sm:col-span-2 lg:col-span-1" data-testid="button-search">
          <Search className="h-4 w-4" /> {tr('Axtar', 'Search')}
        </button>
      </div>
    </div>
  );
}

/* ---------- MARQUEE ---------- */
export function CityMarquee() {
  const row = [...CITIES, ...CITIES];
  return (
    <section className="relative z-10 overflow-hidden py-20 md:py-28" aria-hidden="true">
      <div className="js-marquee-a marquee-row display text-[18vw] md:text-[11vw]">
        {row.map((c, i) => (
          <span key={i} className={`px-[3vw] ${i % 2 ? 'outline-word' : 'text-mist/90'}`}>{c}</span>
        ))}
      </div>
      <div className="js-marquee-b marquee-row display -mt-[2vw] text-[18vw] md:text-[11vw]" style={{ transform: 'translateX(-40%)' }}>
        {row.map((c, i) => (
          <span key={i} className={`px-[3vw] ${i % 2 ? 'text-ember/90' : 'outline-word'}`}>{c}</span>
        ))}
      </div>
    </section>
  );
}

/* ---------- LISTINGS ---------- */
const CATS = [
  { k: 'Hamısı', i: Sparkles }, { k: 'Dağ evləri', i: Mountain }, { k: 'Dəniz kənarı', i: Waves }, { k: 'Kotteclər', i: HomeIcon },
  { k: 'Şəhər həyatı', i: Building2 }, { k: 'Hovuzlu', i: Gift }, { k: 'İş üçün', i: Briefcase },
];

export function ListingCard({ h, saved, onFav, onOpen }: { h: Home; saved: boolean; onFav: () => void; onOpen: () => void }) {
  const { tr } = useLang();
  const tilt = (e: RPointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  };
  return (
    <article
      onPointerMove={tilt} onPointerLeave={(e) => (e.currentTarget.style.transform = '')}
      className="listing-card js-listing group relative" data-testid={`card-listing-${h.id}`}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left" data-testid={`button-open-listing-${h.id}`}>
        <div className="glass rounded-[26px] p-2">
          <div className="ph relative aspect-[4/4.4] overflow-hidden rounded-[20px] bg-black/30">
            <Photo loading="lazy" src={img(h.img, 700)} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="glass absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white">
              {h.rating >= 4.95 ? tr('Qonaqların sevimlisi', 'Guest favourite') : tr('Seçilmiş məkan', 'Featured stay')}
            </span>
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
              <span className="display text-[30px] !tracking-[-0.04em]">{h.city}</span>
              <span className="mono flex items-center gap-1 !text-[11px]"><Star className="h-3 w-3 fill-current" />{h.rating.toFixed(2)}</span>
            </div>
          </div>
          <div className="px-3 pb-3 pt-3.5">
          <div className="truncate text-[14.5px] font-semibold">{tr(h.title, h.titleEn)}</div>
          <div className="mt-1 truncate text-[13px] text-muted-foreground">
            {h.capacity} {tr('qonaq', 'guests')} · {h.amenities.slice(0, 2).map((a) => tr(a, AMENITY_EN[a] ?? a)).join(' · ')}
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span><b className="display text-[22px] !tracking-[-0.03em]">₼{h.price}</b> <span className="text-[13px] text-muted-foreground">/ {tr('gecə', 'night')}</span></span>
            <ArrowUpRight className="h-4 w-4 text-mist/50 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ember" />
          </div>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onFav}
        aria-label={saved ? tr('Seçilmişlərdən çıxar', 'Remove from favourites') : tr('Seçilmişlərə əlavə et', 'Save to favourites')}
        aria-pressed={saved}
        className={`glass absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full transition-transform hover:scale-110 ${saved ? 'heart-pop' : ''}`}
        data-testid={`button-fav-${h.id}`}
      >
        <Heart className={`h-[18px] w-[18px] ${saved ? 'fill-ember text-ember' : 'text-white'}`} />
      </button>
    </article>
  );
}

export function Listings(p: {
  results: Home[]; favs: number[]; onFav: (id: number) => void; onOpen: (id: number) => void;
  cat: string; onCat: (c: string) => void; mapOn: boolean; onMap: () => void; onFilters: () => void;
  title: string; subtitle: string; onClear: () => void; chips: string[];
  form: SearchForm; setForm: Dispatch<SetStateAction<SearchForm>>; onSearch: () => void;
}) {
  const { tr } = useLang();
  return (
    <section id="results" className="js-results relative z-10 scroll-mt-24 px-4 pb-24 pt-10 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <Chapter n="01" label={tr('Məkanlar', 'Stays')} />
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="js-split display text-[clamp(48px,8.5vw,140px)] text-mist" data-testid="text-results-title">{p.title}</h2>
            <p className="mt-4 max-w-md text-muted-foreground" data-testid="text-results-subtitle">{p.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={p.onMap} aria-pressed={p.mapOn} className="btn-ghost flex items-center gap-2 px-5 py-3 text-sm font-semibold" data-testid="button-map-toggle">
              {p.mapOn ? <><LayoutGrid className="h-4 w-4" />{tr('Siyahını göstər', 'Show list')}</> : <><MapIcon className="h-4 w-4" />{tr('Xəritəni göstər', 'Show map')}</>}
            </button>
            <button onClick={p.onFilters} className="btn-ghost flex items-center gap-2 px-5 py-3 text-sm font-semibold" data-testid="button-filters">
              <SlidersHorizontal className="h-4 w-4" />{tr('Filtrlər', 'Filters')}
            </button>
          </div>
        </div>

        <SearchBar form={p.form} setForm={p.setForm} onSearch={p.onSearch} />

        <nav className="js-cats mt-8 flex flex-wrap items-center gap-2 overflow-visible pb-1">
          {CATS.map(({ k, i: Icon }) => (
            <button key={k} onClick={() => p.onCat(k)} aria-pressed={p.cat === k} data-active={p.cat === k} className="cat-btn js-cat btn-ghost flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium" data-testid={`button-cat-${k}`}>
              <Icon className="h-4 w-4" />{tr(k, TYPE_EN[k])}
            </button>
          ))}
        </nav>
        {p.chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {p.chips.map((c) => <span key={c} className="mono rounded-full border border-ember/40 px-3 py-1.5 !text-[10px] text-ember">{c}</span>)}
            <button onClick={p.onClear} className="mono rounded-full px-3 py-1.5 !text-[10px] text-mist/70 underline underline-offset-4" data-testid="button-clear-chips">{tr('Sıfırla', 'Reset')}</button>
          </div>
        )}

        <div className="mt-10">
          {p.mapOn && p.results.length ? (
            <Suspense fallback={
              <div className="map-shell glass grid h-[460px] place-items-center rounded-[28px] text-sm text-muted-foreground md:h-[600px]" data-testid="map-panel" aria-busy="true">
                {tr('Xəritə yüklənir…', 'Loading map…')}
              </div>
            }>
              <MapPanel homes={p.results} onOpen={p.onOpen} />
            </Suspense>
          ) : p.results.length ? (
            <div className="js-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {p.results.map((h) => (
                <ListingCard key={h.id} h={h} saved={p.favs.includes(h.id)} onFav={() => p.onFav(h.id)} onOpen={() => p.onOpen(h.id)} />
              ))}
            </div>
          ) : (
            <div className="glass relative overflow-hidden rounded-[32px] px-6 py-20 text-center" data-testid="state-empty">
              <div className="display outline-word pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-[22vw] md:text-[14vw]">{tr('duman', 'fog')}</div>
              <div className="relative">
                <h3 className="display text-[clamp(28px,4vw,48px)]">{tr('Bu seçimlə uyğun ev tapılmadı', 'No homes match this search')}</h3>
                <p className="mx-auto mt-3 max-w-sm text-muted-foreground">{tr('Axtarış parametrlərini dəyiş və yenidən yoxla.', 'Change your search and try again.')}</p>
                <button onClick={p.onClear} className="btn-ember mt-7 px-7 py-3.5" data-testid="button-reset-filters">{tr('Filtrləri sıfırla', 'Reset filters')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURE (the doorway journey) ---------- */
export function Feature({ home, onOpen, onSurprise }: { home: Home; onOpen: (id: number) => void; onSurprise: () => void }) {
  const { tr } = useLang();
  return (
    <section className="js-feature relative z-10 h-[100svh] min-h-[620px] overflow-hidden" aria-label={tr('Evə doğru səyahət', 'The journey home')}>
      <DoorwayBackdrop />
      <div className="js-journey-intro journey-caption absolute inset-x-4 top-[14%] z-10 text-center md:inset-x-8 md:top-[12%]">
        <Chapter n="02" label={tr('Meşənin içində bir ünvan', 'An address in the forest')} />
        <h2 className="display mx-auto mt-7 max-w-[12ch] text-[clamp(42px,7vw,100px)] text-white">
          {tr('Bir qapı. Yeni bir hekayə.', 'One door. A new story.')}
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/75 md:text-base">
          {tr('Aşağı sürüşdür. Evə yaxınlaş, qapını aç və içəri keç.', 'Scroll closer. Approach the house, open the door and step inside.')}
        </p>
      </div>
      <div className="js-door-caption journey-caption absolute bottom-[12%] left-4 z-10 max-w-[18rem] opacity-0 md:bottom-[14%] md:left-12">
        <span className="mono text-white/60">{tr('Bir addım da', 'One step closer')}</span>
        <p className="display mt-3 text-[clamp(32px,5vw,64px)] text-white">{tr('Qapı açılır.', 'The door gives way.')}</p>
      </div>
      <div className="js-interior-copy absolute inset-x-4 bottom-[9%] z-10 flex flex-col items-start justify-between gap-5 opacity-0 md:inset-x-12 md:bottom-[11%] md:flex-row md:items-end">
        <div className="journey-caption max-w-2xl">
          <Chapter n="03" label={`${tr('İçəridə', 'Inside')} · ${home.city}`} />
          <h3 className="display mt-6 max-w-[11ch] text-[clamp(48px,8vw,118px)] text-white">{tr('Burada vaxt yavaşıyır.', 'Time slows down here.')}</h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
            {tr('İsti ağac, pəncərədən süzülən meşə və heç yerə tələsməmək üçün bir səbəb.', 'Warm timber, forest light through the window, and every reason not to hurry.')}
          </p>
        </div>
        <div className="glass w-full shrink-0 rounded-[24px] p-5 md:w-80" data-testid="card-featured-home">
          <p className="text-sm font-semibold text-white" data-testid="text-featured-title">{tr(home.title, home.titleEn)}</p>
          <p className="mt-1 text-sm text-white/75">{home.city} · {home.capacity} {tr('qonaq', 'guests')}</p>
          <p className="mt-3 text-white"><b className="display text-2xl">₼{home.price}</b> <span className="text-sm text-white/75">/ {tr('gecə', 'night')}</span></p>
          <button onClick={() => onOpen(home.id)} className="btn-ember mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm" data-testid="button-feature-open">
            {tr('Evə və tarixlərə bax', 'View home & dates')} <ArrowUpRight className="h-4 w-4 shrink-0" />
          </button>
          <button onClick={onSurprise} className="mt-3 flex w-full items-center justify-center gap-2 py-1 text-sm text-white/80 underline underline-offset-4" data-testid="button-feature-surprise">
            {tr('Mənim üçün seç', 'Pick for me')} <Shuffle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- TOOLS ---------- */
export function Tools({ onTool, onWork }: { onTool: (t: ToolType) => void; onWork: () => void }) {
  const { tr } = useLang();
  const items = [
    { i: Columns3, t: tr('Evləri müqayisə et', 'Compare homes'), d: tr('Üç evi qiymət, tutum və imkanlara görə yanaşı yoxla.', 'Put three homes side by side by price, capacity and amenities.'), f: () => onTool('compare'), id: 'compare' },
    { i: Wallet, t: tr('Dostlarla büdcə', 'Split with friends'), d: tr('Ümumi xərci qonaqlar arasında böl.', 'Divide the total among your guests.'), f: () => onTool('split'), id: 'split' },
    { i: Laptop, t: tr('İş üçün ev tap', 'Find a work stay'), d: tr('İnternet, iş masası və sakitlik filtrləri.', 'Wi-Fi, desk and quiet filters.'), f: onWork, id: 'work' },
    { i: Shuffle, t: tr('Büdcəyə uyğun sürpriz', 'Surprise within budget'), d: tr('Şərtlərinə uyğun təsadüfi ev seçimi.', 'A random home that fits your terms.'), f: () => onTool('surprise'), id: 'surprise' },
    { i: ListChecks, t: tr('Səfər planım', 'My trip plan'), d: tr('Saxladığın evləri tarixlərə görə qrupla.', 'Group saved homes by date.'), f: () => onTool('trip'), id: 'trip' },
  ];
  return (
    <section className="js-tools relative z-10 px-4 py-28 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <Chapter n="04" label={tr('Alətlər', 'Tools')} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="js-split display text-[clamp(44px,6.5vw,104px)] text-mist">{tr('Səfərini asanlaşdıran alətlər', 'Tools that make the trip easier')}</h2>
            <p className="mt-5 max-w-sm text-muted-foreground">{tr('Yalnız ev tapmaq deyil — planı da birlikdə qur.', 'Not just finding a home — build the plan together.')}</p>
          </div>
          <div className="flex flex-col gap-3">
            {items.map((it, idx) => (
              <button key={it.id} onClick={it.f} className="js-tool tool-row glass group flex items-center gap-5 rounded-[28px] p-5 text-left md:gap-8 md:p-7" data-testid={`button-tool-${it.id}`}>
                <span className="mono w-6 shrink-0 text-mist/50 group-hover:text-white">0{idx + 1}</span>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/5 group-hover:border-white/40"><it.i className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <b className="display block text-[clamp(22px,2.6vw,36px)] !leading-none !tracking-[-0.035em]">{it.t}</b>
                  <span className="mt-2 block text-sm text-muted-foreground group-hover:text-white/85">{it.d}</span>
                </span>
                <ArrowRight className="tool-arrow h-6 w-6 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
export function Footer({ onTop, onTool }: { onTop: () => void; onTool: (t: ToolType) => void }) {
  const { tr } = useLang();
  const cols = [
    { h: tr('Kəşf et', 'Explore'), l: [
      { t: tr('Evləri müqayisə et', 'Compare homes'), f: () => onTool('compare') },
      { t: tr('Büdcəyə uyğun sürpriz', 'Surprise me'), f: () => onTool('surprise') },
    ] },
    { h: tr('Planla', 'Plan'), l: [
      { t: tr('Səfər planım', 'My trips'), f: () => onTool('trip') },
      { t: tr('Dostlarla büdcə', 'Split with friends'), f: () => onTool('split') },
    ] },
  ];
  return (
    <footer className="js-footer font-sans relative z-10 mt-24 border-t border-white/10 bg-[hsl(168_20%_4%/.72)] px-4 backdrop-blur-md md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div className="max-w-xs">
            <BrandLogo size="footer" />
            <p className="mt-4 text-sm leading-relaxed text-white/60">{tr('Səyahətinə yer tap. Sakit, seçilmiş məkanlar.', 'Find a place for your journey. Quiet, hand-picked stays.')}</p>
          </div>
          {cols.map((c) => (
            <nav key={c.h} aria-label={c.h}>
              <h3 className="text-xs font-semibold uppercase tracking-[.14em] text-white/45">{c.h}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {c.l.map((x) => (
                  <li key={x.t}><button onClick={x.f} className="text-white/80 transition-colors hover:text-white">{x.t}</button></li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="md:justify-self-end">
            <button type="button" onClick={onTop} className="btn-ghost flex items-center gap-2 px-5 py-3 text-sm font-semibold" data-testid="button-footer-top"><ArrowDown className="h-4 w-4 rotate-180" />{tr('Yuxarı', 'Back to top')}</button>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-[13px] text-white/45 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Yurdum</span>
          <span>{tr('Demo marketplace · Sınaq rezervasiyaları · AZN ₼', 'Demo marketplace · Test bookings · AZN ₼')}</span>
          <span className="flex gap-6"><span>{tr('Haqqımızda', 'About')}</span><span>{tr('Dəstək', 'Support')}</span><span>{tr('Məxfilik', 'Privacy')}</span></span>
        </div>
      </div>
    </footer>
  );
}
