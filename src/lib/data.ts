export type Home = {
  id: number;
  city: string;
  title: string;
  titleEn: string;
  price: number;
  capacity: number;
  rating: number;
  type: string;
  img: string;
  imgs: string[];
  amenities: string[];
  quiet: number;
  desk: boolean;
  wifi: boolean;
};

export const HOMES: Home[] = [
  { id: 1, city: 'Qəbələ', title: 'Dağların qoynunda taxta villa', titleEn: 'Timber villa in the mountains', price: 185, capacity: 6, rating: 4.96, type: 'Dağ evləri', img: 'photo-1449158743715-0a90ebb6d2d8', imgs: ['photo-1449158743715-0a90ebb6d2d8', 'photo-1518780664697-55e3ad937233', 'photo-1449844908441-8829872d2607', 'photo-1505693416388-ac5ce068fe85', 'photo-1600210492486-724fe5c67fb0'], amenities: ['Wi-Fi', 'İş masası', 'Mətbəx', 'Dağ mənzərəsi', 'Pulsuz parkinq'], quiet: 5, desk: true, wifi: true },
  { id: 2, city: 'Şəki', title: 'Tarixi küçədə sakit həyət evi', titleEn: 'Quiet courtyard house on a historic street', price: 95, capacity: 4, rating: 4.91, type: 'Kotteclər', img: 'photo-1600210492486-724fe5c67fb0', imgs: ['photo-1600210492486-724fe5c67fb0', 'photo-1600607687939-ce8a6c25118c', 'photo-1600566753086-00f18fb6b3ea', 'photo-1600607687920-4e2a09cf159d', 'photo-1600566753190-17f0baa2a6c3'], amenities: ['Wi-Fi', 'Mətbəx', 'Həyət', 'Öz-özünə giriş'], quiet: 4, desk: false, wifi: true },
  { id: 3, city: 'Bakı', title: 'Dənizə baxan modern penthouse', titleEn: 'Modern penthouse facing the sea', price: 220, capacity: 3, rating: 4.88, type: 'Dəniz kənarı', img: 'photo-1600607687939-ce8a6c25118c', imgs: ['photo-1600607687939-ce8a6c25118c', 'photo-1600607687920-4e2a09cf159d', 'photo-1600566753086-00f18fb6b3ea', 'photo-1600210492486-724fe5c67fb0', 'photo-1600566753190-17f0baa2a6c3'], amenities: ['Wi-Fi', 'İş masası', 'Dəniz mənzərəsi', 'Hovuz', 'İdman zalı'], quiet: 3, desk: true, wifi: true },
  { id: 4, city: 'Quba', title: 'Meşə kənarında A-frame', titleEn: 'A-frame on the forest edge', price: 145, capacity: 5, rating: 4.98, type: 'Dağ evləri', img: 'photo-1518780664697-55e3ad937233', imgs: ['photo-1518780664697-55e3ad937233', 'photo-1449158743715-0a90ebb6d2d8', 'photo-1505693416388-ac5ce068fe85', 'photo-1600607687939-ce8a6c25118c', 'photo-1600566753086-00f18fb6b3ea'], amenities: ['Wi-Fi', 'Kamin', 'Mətbəx', 'Meşə mənzərəsi'], quiet: 5, desk: false, wifi: true },
  { id: 5, city: 'Lənkəran', title: 'Hovuzlu bağ evi, yaşıl mənzərə', titleEn: 'Garden house with pool and green views', price: 175, capacity: 8, rating: 4.84, type: 'Hovuzlu', img: 'photo-1505693416388-ac5ce068fe85', imgs: ['photo-1505693416388-ac5ce068fe85', 'photo-1600566753086-00f18fb6b3ea', 'photo-1600607687920-4e2a09cf159d', 'photo-1600210492486-724fe5c67fb0', 'photo-1600607687939-ce8a6c25118c'], amenities: ['Wi-Fi', 'Hovuz', 'Həyət', 'Mətbəx', 'İş masası'], quiet: 4, desk: true, wifi: true },
  { id: 6, city: 'İsmayıllı', title: 'Panoramik dağ mənzərəli chalet', titleEn: 'Chalet with panoramic mountain views', price: 130, capacity: 4, rating: 4.93, type: 'Dağ evləri', img: 'photo-1449844908441-8829872d2607', imgs: ['photo-1449844908441-8829872d2607', 'photo-1518780664697-55e3ad937233', 'photo-1449158743715-0a90ebb6d2d8', 'photo-1505693416388-ac5ce068fe85', 'photo-1600607687939-ce8a6c25118c'], amenities: ['Wi-Fi', 'İş masası', 'Kamin', 'Dağ mənzərəsi'], quiet: 5, desk: true, wifi: true },
  { id: 7, city: 'Bakı', title: 'Minimalist loft şəhərin mərkəzində', titleEn: 'Minimalist loft in the city centre', price: 110, capacity: 2, rating: 4.79, type: 'Şəhər həyatı', img: 'photo-1600566753190-17f0baa2a6c3', imgs: ['photo-1600566753190-17f0baa2a6c3', 'photo-1600607687920-4e2a09cf159d', 'photo-1600210492486-724fe5c67fb0', 'photo-1600566753086-00f18fb6b3ea', 'photo-1600607687939-ce8a6c25118c'], amenities: ['Wi-Fi', 'İş masası', 'Mətbəx', 'Öz-özünə giriş'], quiet: 3, desk: true, wifi: true },
  { id: 8, city: 'Qəbələ', title: 'Gölə yaxın ailəvi kottec', titleEn: 'Family cottage near the lake', price: 160, capacity: 7, rating: 4.9, type: 'Kotteclər', img: 'photo-1600607687920-4e2a09cf159d', imgs: ['photo-1600607687920-4e2a09cf159d', 'photo-1505693416388-ac5ce068fe85', 'photo-1600566753086-00f18fb6b3ea', 'photo-1449158743715-0a90ebb6d2d8', 'photo-1600210492486-724fe5c67fb0'], amenities: ['Wi-Fi', 'Mətbəx', 'Həyət', 'Uşaq üçün uyğundur'], quiet: 4, desk: false, wifi: true },
];

// Keep the story tied to a stable listing, independent of marketplace sorting.
export const FEATURED_HOME_ID = 1;

export const CITIES = ['Qəbələ', 'Şəki', 'Quba', 'Bakı', 'Lənkəran', 'İsmayıllı'];
export const TYPES = ['Dağ evləri', 'Dəniz kənarı', 'Kotteclər', 'Şəhər həyatı', 'Hovuzlu'];
export const TYPE_EN: Record<string, string> = {
  'Hamısı': 'All', 'Dağ evləri': 'Mountain homes', 'Dəniz kənarı': 'Seaside', 'Kotteclər': 'Cottages',
  'Şəhər həyatı': 'City life', 'Hovuzlu': 'With pool', 'İş üçün': 'For work',
};
export const AMENITY_EN: Record<string, string> = {
  'İş masası': 'Desk', 'Mətbəx': 'Kitchen', 'Dağ mənzərəsi': 'Mountain view', 'Pulsuz parkinq': 'Free parking',
  'Həyət': 'Courtyard', 'Öz-özünə giriş': 'Self check-in', 'Dəniz mənzərəsi': 'Sea view', 'Hovuz': 'Pool',
  'İdman zalı': 'Gym', 'Kamin': 'Fireplace', 'Meşə mənzərəsi': 'Forest view', 'Uşaq üçün uyğundur': 'Kid-friendly',
};
export const CITY_COORDS: Record<string, [number, number]> = {
  'Qəbələ': [40.9814, 47.8458], 'Şəki': [41.1919, 47.1706], 'Bakı': [40.4093, 49.8671],
  'Quba': [41.3611, 48.5134], 'Lənkəran': [38.7543, 48.8506], 'İsmayıllı': [40.7849, 48.1514],
};

export const HERO_IMG = 'photo-1449844908441-8829872d2607';
export const img = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const lc = (s: string) =>
  s.toLocaleLowerCase('az').replace(/[ıəşüöçğ]/g, (c) => ({ ı: 'i', ə: 'e', ş: 's', ü: 'u', ö: 'o', ç: 'c', ğ: 'g' })[c] ?? c);
export const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
export const getNights = (a: string, b: string) => (a && b ? Math.round((+new Date(b) - +new Date(a)) / 864e5) : 0);

export type Filters = { max: number; type: string; wifi: boolean; desk: boolean };
export const DEFAULT_FILTERS: Filters = { max: 1000, type: 'Hamısı', wifi: false, desk: false };
export type Plan = { key: number; id: number; name: string; date: string };

export function photoFallback(label: string) {
  const safe = (label || 'Yurdum stay').replace(/[&<>"]/g, ' ').slice(0, 42);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 760"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1d2a26"/><stop offset="1" stop-color="#0c1311"/></linearGradient></defs><rect width="900" height="760" fill="url(#s)"/><path d="M0 470 190 290 350 440 520 250 900 480V760H0Z" fill="#22322c"/><path d="M0 540 230 400 420 540 660 360 900 540V760H0Z" fill="#17231f"/><text x="50" y="700" font-family="sans-serif" font-size="26" font-weight="700" fill="#c9d6d0" opacity=".7">${safe}</text></svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent('am-toast', { detail: msg }));
}
