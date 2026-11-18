import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { Photo } from './bits';
import { img } from '@/lib/data';
import { useLang } from '@/lib/i18n';

gsap.registerPlugin(ScrollTrigger);

// The moving door uses the same pixel crop measured from the source photo.
const DOOR = { cx: 519 / 1024, cy: 602.5 / 1024, w: 152 / 1024, h: 279 / 1024 };

export function DoorwayBackdrop() {
  const { tr } = useLang();
  const scene = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const base = import.meta.env.BASE_URL;

  useLayoutEffect(() => {
    const feature = scene.current?.closest<HTMLElement>('.js-feature');
    const camera = scene.current?.querySelector<HTMLElement>('.entry-camera');
    const portal = scene.current?.querySelector<HTMLElement>('.entry-portal-image');
    if (!feature || !camera || !portal) return;

    let size = 1;
    const measure = () => {
      size = Math.max(feature.clientWidth, feature.clientHeight);
      camera.style.width = `${size}px`;
      camera.style.height = `${size}px`;
      portal.style.width = `${feature.clientWidth}px`;
      portal.style.height = `${feature.clientHeight}px`;
    };
    const zoom = () => Math.max(
      feature.clientWidth / (size * DOOR.w),
      feature.clientHeight / (size * DOOR.h),
    ) * 1.04;
    const approach = () => Math.min(
      feature.clientWidth * 0.8 / (size * DOOR.w),
      feature.clientHeight * 0.9 / (size * DOOR.h),
    );
    measure();

    const media = gsap.matchMedia(feature);
    media.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.addEventListener('refreshInit', measure);
        gsap.fromTo(scene.current, { opacity: 0, y: 48 }, {
          opacity: 1, y: 0, ease: 'power1.out',
          scrollTrigger: { trigger: feature, start: 'top 95%', end: 'top 10%', scrub: 0.65 },
        });
        gsap.set(camera, {
          xPercent: -50, yPercent: -50,
          transformOrigin: `${DOOR.cx * 100}% ${DOOR.cy * 100}%`,
        });
        gsap.set(portal, { xPercent: -50, yPercent: -50 });
        const alignPortal = () => {
          const scale = Number(gsap.getProperty(camera, 'scaleX')) || 1;
          portal.style.transform = `translate3d(-50%, -50%, 0) scale(${1 / scale})`;
        };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'doorway-journey',
            trigger: feature, start: 'top top', end: '+=420%',
            pin: true, scrub: 0.75, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        timeline.current = tl;
        tl.to('.js-journey-intro h2', {
          scale: 1.1, transformOrigin: 'center center', duration: 0.2, ease: 'sine.out',
        }, 0)
          .fromTo(camera, { scale: 1, x: 0, y: 0 }, {
          scale: approach,
          x: () => -(DOOR.cx - 0.5) * size,
          y: () => -(DOOR.cy - 0.5) * size,
          duration: 0.4, ease: 'sine.inOut', onUpdate: alignPortal,
        }, 0.2)
          .to('.js-journey-intro', { y: -35, autoAlpha: 0, duration: 0.12 }, 0.18)
          .to('.entry-shortcut', { autoAlpha: 0, duration: 0.08 }, 0.24)
          .to('.entry-shade', { opacity: 0, duration: 0.22 }, 0.26)
          .fromTo('.js-door-caption', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.1 }, 0.48)
          .to('.js-door-caption', { y: -12, autoAlpha: 0, duration: 0.12 }, 0.66)
          // Swing inward, away from the viewer, while the camera moves through.
          .fromTo('.entry-leaf', { rotationY: 0 }, {
            rotationY: 104, duration: 0.34, ease: 'sine.inOut',
          }, 0.66)
          .to(camera, { scale: zoom, duration: 0.38, ease: 'sine.inOut', onUpdate: alignPortal }, 0.74)
          // Gentle warm exposure, never an opaque white flash.
          .fromTo('.entry-whiteout', { opacity: 0 }, { opacity: 0.12, duration: 0.18 }, 0.74)
          .to('.entry-whiteout', { opacity: 0, duration: 0.18 }, 0.92)
          // The portal and final scene share the same image and screen framing.
          .fromTo('.js-journey-interior', { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.82)
          .fromTo('.entry-exterior', { opacity: 1 }, { opacity: 0, duration: 0.22, immediateRender: false }, 0.84)
          .fromTo('.js-interior-copy', { y: 32, autoAlpha: 0 }, {
            y: 0, autoAlpha: 1, duration: 0.14,
          }, 0.98)
          .fromTo(
            '.js-interior-copy .js-chapter, .js-interior-copy h3, .js-interior-copy p, .js-interior-copy [data-testid="card-featured-home"]',
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.14, stagger: 0.035, ease: 'sine.out' },
            1.1,
          )
          .to('.js-interior-copy', { y: -36, duration: 0.24, ease: 'sine.inOut' }, 1.28);
      return () => {
        timeline.current = null;
        ScrollTrigger.removeEventListener('refreshInit', measure);
      };
    });
    return () => media.revert();
  }, []);

  const enter = () => {
    const trigger = timeline.current?.scrollTrigger;
    if (trigger) {
      window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * 0.98, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div ref={scene} className="journey-scene entry-scene">
        <div className="entry-exterior">
          <div className="entry-camera">
            <img src={`${base}story/cabin-entry.jpg`} alt={tr('Qapısı düz qarşıdan görünən meşə evi', 'A forest cabin with its front door facing you')} decoding="async" />
            <div className="entry-aperture" aria-hidden="true">
              <div className="entry-frame" />
              <div className="entry-portal">
                <img className="entry-portal-image" src={img('photo-1600210492486-724fe5c67fb0', 2200)} alt="" decoding="async" />
              </div>
              <div className="entry-leaf">
                <img src={`${base}story/door-panel-aligned.jpg`} alt="" decoding="async" />
              </div>
            </div>
          </div>
          <div className="entry-shade" />
        </div>
        <div className="journey-interior js-journey-interior">
          <Photo loading="eager" src={img('photo-1600210492486-724fe5c67fb0', 2200)} alt={tr('İşıqla dolu isti və rahat ev interyeri', 'A warm, comfortable home interior filled with light')} />
        </div>
        <div className="entry-whiteout" aria-hidden="true" />
      </div>
      <button type="button" onClick={enter} className="entry-shortcut btn-ghost absolute bottom-8 right-4 z-20 flex items-center gap-3 px-5 py-3 text-sm text-white md:right-12" data-testid="button-story-enter">
        {tr('İçəri keç', 'Step inside')} <ArrowUpRight className="h-4 w-4" />
      </button>
    </>
  );
}
