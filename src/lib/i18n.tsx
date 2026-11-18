import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Lang = 'AZ' | 'EN';
type Ctx = { lang: Lang; tr: (az: string, en: string) => string; toggle: () => void };
const LangCtx = createContext<Ctx>({ lang: 'AZ', tr: (az) => az, toggle: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('AZ');
  useEffect(() => {
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);
  const tr = useCallback((az: string, en: string) => (lang === 'EN' ? en : az), [lang]);
  const toggle = useCallback(() => setLang((l) => (l === 'AZ' ? 'EN' : 'AZ')), []);
  return <LangCtx.Provider value={{ lang, tr, toggle }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
