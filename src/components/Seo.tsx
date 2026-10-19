import { createContext, useContext, useEffect } from 'react';

export const SITE = 'https://drsiddharthguptaortho.in';

export type HeadData = { title?: string; description?: string; path?: string };
/** Only provided by the prerenderer (entry-server.tsx): <Seo> writes its values here during render. */
export const HeadContext = createContext<HeadData | null>(null);

function setMeta(selector: string, attr: 'content' | 'href', value: string, create: () => HTMLElement) {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Per-route title / description / canonical / OG tags.
 * At build time scripts/prerender.mjs bakes these into each route's HTML via HeadContext;
 * in the browser the effect keeps them in sync on client-side navigation.
 */
export default function Seo({ title, description, path }: { title: string; description: string; path: string }) {
  const head = useContext(HeadContext);
  if (head) Object.assign(head, { title, description, path });
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', 'content', description, () => Object.assign(document.createElement('meta'), { name: 'description' }));
    setMeta('link[rel="canonical"]', 'href', SITE + path, () => Object.assign(document.createElement('link'), { rel: 'canonical' }));
    setMeta('meta[property="og:title"]', 'content', title, () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:title');
      return m;
    });
    setMeta('meta[property="og:description"]', 'content', description, () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:description');
      return m;
    });
    setMeta('meta[property="og:url"]', 'content', SITE + path, () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:url');
      return m;
    });
  }, [title, description, path]);
  return null;
}
