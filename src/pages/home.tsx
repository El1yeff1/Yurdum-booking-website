import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Atmosphere, CityMarquee, Feature, Footer, Header, Hero, Listings, Tools, type SearchForm, type ToolType } from '@/components/site/sections';
import { Modals, type ModalState } from '@/components/site/modals';
import { ToastHost } from '@/components/site/bits';
import { trackEvent } from '@/lib/analytics';
import { DEFAULT_FILTERS, FEATURED_HOME_ID, HOMES, TYPE_EN, lc, toast, type Filters, type Plan } from '@/lib/data';
import { useLang } from '@/lib/i18n';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
const legacyStoragePrefix = ['air', 'bnb'].join('');

function useStored<T>(key: string, init: T, legacyKey?: string) {
  const [v, setV] = useState<T>(() => {
    try {
      for (const raw of [localStorage.getItem(key), legacyKey ? localStorage.getItem(legacyKey) : null]) {
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as T;
      }
      return init;
    } catch { return init; }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
      if (legacyKey) localStorage.removeItem(legacyKey);
    } catch { /* ignore unavailable storage */ }
  }, [key, legacyKey, v]);
  return [v, setV] as const;
}

const EMPTY_FORM: SearchForm = { dest: '', checkin: '', checkout: '', guests: 2 };
type Heading = { kind: 'default' } | { kind: 'search'; city: string; guests: number } | { kind: 'work' };

export default function HomePage() {
  const featuredHome = HOMES.find((h) => h.id === FEATURED_HOME_ID);
  if (!featuredHome) throw new Error(`Featured home ${FEATURED_HOME_ID} is missing from the marketplace`);
  const { tr, lang } = useLang();
  const [favs, setFavs] = useStored<number[]>('yurdum-favs', [], `${legacyStoragePrefix}-favs`);
  const [plans, setPlans] = useStored<Plan[]>('yurdum-plans', [], `${legacyStoragePrefix}-plans`);
  const [cat, setCat] = useState('Hamısı');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [form, setForm] = useState<SearchForm>(EMPTY_FORM);
  const [search, setSearch] = useState({ city: '', guests: 2 });
  const [heading, setHeading] = useState<Heading>({ kind: 'default' });
  const [compare, setCompare] = useState<number[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [mapOn, setMapOn] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const modalOpener = useRef<HTMLElement | null>(null);

  const showModal = useCallback((next: ModalState) => {
    if (!modal) {
      const active = document.activeElement;
      modalOpener.current = active instanceof HTMLElement ? active : null;
    }
    setModal(next);
  }, [modal]);

  useLayoutEffect(() => {
    if (modal) return;
    const opener = modalOpener.current;
    modalOpener.current = null;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }, [modal]);

  const results = useMemo(
    () => HOMES.filter((h) =>
      (!search.city || lc(h.city).includes(lc(search.city))) && h.capacity >= search.guests && h.price <= filters.max &&
      (cat === 'Hamısı' || h.type === cat || (cat === 'İş üçün' && h.desk && h.wifi)) &&
      (filters.type === 'Hamısı' || h.type === filters.type) && (!filters.wifi || h.wifi) && (!filters.desk || h.desk)),
    [search, filters, cat],
  );

  const toResults = useCallback(() => {
    document.getElementById('results')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, []);

  const runSearch = (override?: Partial<SearchForm>) => {
    const f = { ...form, ...override };
    if (override) setForm(f);
    if (f.checkin && f.checkout && f.checkout <= f.checkin) { toast(tr('Çıxış tarixi girişdən sonra olmalıdır', 'Check-out must be after check-in')); return; }
    const city = f.dest.trim();
    setSearch({ city, guests: f.guests });
    setHeading({ kind: 'search', city, guests: f.guests });
    toResults();
  };

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS); setSearch({ city: '', guests: 2 }); setCat('Hamısı'); setForm(EMPTY_FORM); setHeading({ kind: 'default' });
  };
  const clearFilters = () => { resetAll(); toast(tr('Filtrlər sıfırlandı', 'Filters reset')); };
  const scrollToTop = () => window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
  const goHome = () => { resetAll(); scrollToTop(); };
  const toggleFav = (id: number) => {
    const on = !favs.includes(id);
    setFavs(on ? [...favs, id] : favs.filter((x) => x !== id));
    toast(on ? tr('Seçilmişlərə əlavə edildi', 'Saved to favourites') : tr('Seçilmişlərdən çıxarıldı', 'Removed from favourites'));
  };
  const onTool = (t: ToolType) => showModal({ kind: 'tool', type: t });
  const workFilter = () => {
    setCat('İş üçün'); setFilters((f) => ({ ...f, type: 'Hamısı' })); setHeading({ kind: 'work' }); toResults();
    toast(tr('Wi-Fi və iş masası filtrləri aktivdir', 'Wi-Fi and desk filters are on'));
  };
  const applyFilters = (f: Filters) => {
    setFilters(f); if (f.type !== 'Hamısı') setCat('Hamısı'); setModal(null); toast(tr('Filtrlər tətbiq olundu', 'Filters applied'));
  };
  const close = useCallback(() => setModal(null), []);

  const title = heading.kind === 'search'
    ? heading.city ? tr(`${heading.city} üçün məkanlar`, `Stays in ${heading.city}`) : tr('Axtarış nəticələri', 'Search results')
    : heading.kind === 'work' ? tr('İşləmək üçün rahat məkanlar', 'Calm places to work') : tr('Sənin üçün seçdiklərimiz', 'Places picked for you');
  const subtitle = heading.kind === 'search'
    ? tr(`${heading.guests} qonaq üçün uyğun elanlar`, `Listings for ${heading.guests} guests`)
    : tr('Gözəl məkanlar, rahat qalmaq üçün.', 'Beautiful places for a comfortable stay.');
  const chips = [
    search.city && tr(`Məkan: ${search.city}`, `Location: ${search.city}`),
    search.guests !== 2 && tr(`${search.guests} qonaq`, `${search.guests} guests`),
    cat !== 'Hamısı' && tr(cat, TYPE_EN[cat] ?? cat),
    filters.max < 1000 && `≤ ₼${filters.max}`,
    filters.type !== 'Hamısı' && tr(filters.type, TYPE_EN[filters.type]),
    filters.wifi && 'Wi-Fi',
    filters.desk && tr('İş masası', 'Desk'),
  ].filter(Boolean) as string[];

  /* ---------------- the film: scroll choreography ---------------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // opening shot
        gsap.set('.js-hx', { yPercent: 118, rotate: 4 });
        const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
        intro
          .fromTo('.js-atmos-photo', { scale: 1.35 }, { scale: 1.04, duration: 3.2, ease: 'power3.out' }, 0)
          .fromTo('.js-veil', { opacity: 1 }, { opacity: 0.18, duration: 2.2, ease: 'power2.out' }, 0)
          .to('.js-hx', { yPercent: 0, rotate: 0, duration: 1.6, stagger: 0.14 }, 0.35)
          .from('.js-head-in', { y: -24, opacity: 0, duration: 1, stagger: 0.08 }, 0.7)
          .from('.js-hc', { y: 26, opacity: 0, duration: 1.1, stagger: 0.1 }, 1)
          .from('.js-hero-card', { y: 50, opacity: 0, scale: 0.92, duration: 1.3, stagger: 0.18, ease: 'back.out(1.4)' }, 1.15);

        // the forest never leaves: it drifts and deepens behind every chapter
        if (window.matchMedia('(min-width: 768px)').matches) {
          gsap.to('.js-atmos-img', { yPercent: -3, scale: 1.06, force3D: true, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
        }

        // hero pinned: the headline tears apart and dissolves into the mist
        const heroTl = gsap.timeline({ scrollTrigger: { trigger: '.js-hero', start: 'top top', end: '+=75%', scrub: 0.8, pin: true, pinSpacing: true } });
        heroTl
          .to('.js-hx1', { xPercent: -12, ease: 'none' }, 0)
          .to('.js-hx2', { xPercent: 12, ease: 'none' }, 0)
          .to('.js-hero-title', { scale: 1.025, opacity: 0.12, transformOrigin: 'left center', ease: 'none' }, 0)
          .to('.js-hero-copy', { y: -40, opacity: 0, duration: 0.4, ease: 'none' }, 0)
          .to('.js-hero-card', { yPercent: -80, opacity: 0, stagger: 0.08, ease: 'none' }, 0);

        // oversized place-names ride the scroll in opposite directions
        gsap.to('.js-marquee-a', { xPercent: -32, ease: 'none', scrollTrigger: { trigger: '.js-marquee-a', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo('.js-marquee-b', { xPercent: -40 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.js-marquee-b', start: 'top bottom', end: 'bottom top', scrub: true } });

        // night falls over the forest as we enter the stays
        gsap.fromTo('.js-veil', { opacity: 0.18 }, { opacity: 0.8, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.js-results', start: 'top bottom', end: 'top 20%', scrub: true } });

        // ember dusk rises into the story chapter
        gsap.to('.js-dusk', { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.js-feature', start: 'top bottom', end: 'top top', scrub: true } });

        // The door-aligned camera, inward swing, and interior reveal live in DoorwayBackdrop.

        // dawn: the mist lifts again at the end of the reel
        gsap.timeline({ scrollTrigger: { trigger: '.js-footer', start: 'top bottom', end: 'bottom bottom', scrub: true } })
          .to('.js-veil', { opacity: 0.3, ease: 'none' }, 0)
          .to('.js-dusk', { opacity: 0.25, ease: 'none' }, 0);

        // headings, chapters, tools
        gsap.utils.toArray<HTMLElement>('.js-split, .js-chapter').forEach((el) => {
          gsap.from(el, { y: 70, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
        });
        gsap.from('.js-search', { y: 24, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.js-search', start: 'top 88%', once: true } });
        ScrollTrigger.batch('.js-tool', { start: 'top 90%', once: true, onEnter: (els) => gsap.from(els, { x: 80, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' }) });
        gsap.from('.js-cat', { y: 20, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: '.js-cats', start: 'top 92%' } });

        // scroll progress filament
        gsap.to('.js-progress', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

        // Recalculate pinned sections after the elegant web font has finished loading.
        void document.fonts.ready.then(() => {
          // Child scenes mount before this page's opening pin. Refresh in page
          // order so the earlier hero pin is included in the doorway's start.
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });

        // pointer depth on hero
        const hero = document.querySelector<HTMLElement>('.js-hero');
        if (hero && window.matchMedia('(pointer: fine)').matches) {
          const q = (sel: string) => ({ x: gsap.quickTo(sel, 'x', { duration: 1.1, ease: 'power3.out' }), y: gsap.quickTo(sel, 'y', { duration: 1.1, ease: 'power3.out' }) });
          const bg = q('.js-atmos-photo');
          const move = (e: PointerEvent) => {
            if (window.scrollY > window.innerHeight * 0.25) return;
            const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
            bg.x(-x * 12); bg.y(-y * 8);
          };
          const leave = () => { bg.x(0); bg.y(0); };
          hero.addEventListener('pointermove', move);
          hero.addEventListener('pointerleave', leave);
          return () => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); };
        }
        return undefined;
      });
      mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set('.js-veil', { opacity: 0.6 }); gsap.set('.js-progress', { scaleY: 1 }); });
    }, root);
    return () => ctx.revert();
  }, []);

  // listing cards enter like frames developing
  const first = useRef(true);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let batch: ScrollTrigger[] = [];
    if (!reduce && !mapOn) {
      if (first.current) {
        gsap.set('.js-listing', { y: 60, opacity: 0 });
        batch = ScrollTrigger.batch('.js-listing', { start: 'top 92%', once: true, onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out', clearProps: 'transform,opacity' }) });
      } else {
        gsap.fromTo('.js-listing', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity' });
      }
    }
    first.current = false;
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => { window.clearTimeout(t); batch.forEach((b) => b.kill()); };
  }, [results, mapOn]);

  useEffect(() => { const t = window.setTimeout(() => ScrollTrigger.refresh(), 80); return () => window.clearTimeout(t); }, [lang]);

  return (
    <div ref={root} className="grain relative">
      <Atmosphere />
      <div className="pointer-events-none fixed bottom-0 left-3 top-0 z-30 hidden w-px bg-white/10 md:block lg:left-5" aria-hidden="true">
        <div className="js-progress h-full w-full origin-top scale-y-0 bg-ember" />
      </div>
      <Header form={form} setForm={setForm} onQuick={() => runSearch({ guests: Math.min(form.guests, 8) })} onHome={goHome} onTool={onTool} onFavs={() => showModal({ kind: 'favs' })} favCount={favs.length} />
      <main className="relative z-10">
        <Hero onCity={(c) => runSearch({ dest: c })} />
        <CityMarquee />
        <Listings
          results={results} favs={favs} onFav={toggleFav} onOpen={(id) => showModal({ kind: 'detail', id })}
          cat={cat} onCat={(c) => { setCat(c); setFilters((f) => ({ ...f, type: 'Hamısı' })); }}
          mapOn={mapOn} onMap={() => setMapOn((m) => !m)} onFilters={() => onTool('filters')}
          title={title} subtitle={subtitle} onClear={clearFilters} chips={chips}
          form={form} setForm={setForm} onSearch={() => runSearch()}
        />
        <Feature
          home={featuredHome}
          onOpen={(id) => {
            trackEvent('featured_home_open', { listing_id: id, language: lang });
            showModal({ kind: 'detail', id });
          }}
          onSurprise={() => {
            trackEvent('featured_home_surprise_click', { listing_id: featuredHome.id, language: lang });
            onTool('surprise');
          }}
        />
        <Tools onTool={onTool} onWork={workFilter} />
      </main>
      <Footer onTop={scrollToTop} onTool={onTool} />
      {modal && (
        <Modals
          modal={modal} close={close} open={showModal} form={form} favs={favs} toggleFav={toggleFav}
          filters={filters} applyFilters={applyFilters} clearAll={clearFilters} compare={compare} setCompare={setCompare}
          plans={plans} setPlans={setPlans} goHome={goHome}
        />
      )}
      <ToastHost />
    </div>
  );
}
