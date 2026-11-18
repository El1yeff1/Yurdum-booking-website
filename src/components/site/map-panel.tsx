import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_COORDS, img, type Home } from '@/lib/data';
import { useLang } from '@/lib/i18n';

export function MapPanel({ homes, onOpen }: { homes: Home[]; onOpen: (id: number) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const openRef = useRef(onOpen);
  openRef.current = onOpen;
  const { tr } = useLang();

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false, zoomControl: true }).setView([40.55, 47.5], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(m);
    map.current = m;
    layer.current = L.layerGroup().addTo(m);
    const t = window.setTimeout(() => m.invalidateSize(), 200);
    return () => {
      window.clearTimeout(t);
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const markers: L.Marker[] = [];
    homes.forEach((h, i) => {
      const base = CITY_COORDS[h.city];
      if (!base) return;
      const n = homes.slice(0, i).filter((x) => x.city === h.city).length;
      const c: [number, number] = [base[0] + n * 0.02, base[1] + n * 0.02];
      const icon = L.divIcon({ className: 'pin-wrap', html: `<span class="map-pin">₼${h.price}</span>`, iconSize: [0, 0] });
      const mk = L.marker(c, { icon });
      const box = document.createElement('div');
      box.style.width = '190px';
      box.innerHTML = `<img src="${img(h.img, 420)}" style="width:100%;height:100px;object-fit:cover;border-radius:10px" alt=""/><b style="display:block;margin-top:8px">${h.city}</b><div style="font-size:12px;opacity:.7;margin:3px 0 8px">${tr(h.title, h.titleEn)}</div><b>₼${h.price}</b> <span style="opacity:.6">/ ${tr('gecə', 'night')}</span>`;
      const btn = document.createElement('button');
      btn.textContent = tr('Elana bax', 'View listing');
      btn.style.cssText = 'display:block;margin-top:9px;background:#FF5A5F;color:#fff;border:0;border-radius:20px;padding:7px 13px;font-weight:600;cursor:pointer';
      btn.onclick = () => openRef.current(h.id);
      box.appendChild(btn);
      mk.bindPopup(box);
      mk.addTo(g);
      markers.push(mk);
    });
    if (markers.length) {
      // The map can be unmounted immediately when search results become empty.
      // Avoid leaving Leaflet's delayed zoom-transition callback alive after cleanup.
      m.fitBounds(L.featureGroup(markers).getBounds().pad(0.25), { maxZoom: 10, animate: false });
    }
  }, [homes, tr]);

  return (
    <div className="map-shell glass relative h-[460px] overflow-hidden rounded-[28px] md:h-[600px]" data-testid="map-panel">
      <div ref={el} className="h-full w-full" aria-label={tr('Elanların xəritəsi', 'Listings map')} />
    </div>
  );
}
