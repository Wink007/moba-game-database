import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  /** JSON-LD structured data — single object or array injected as <script type="application/ld+json"> */
  jsonLd?: object | object[];
}

const BASE_TITLE = 'Wiki for Mobile Legends (Unofficial)';
const BASE_DESCRIPTION = 'Unofficial fan-made guide for Mobile Legends. Heroes stats, builds, rankings, items and more. Not affiliated with Moonton.';
const BASE_URL = 'https://mobawiki.com';
const DEFAULT_IMAGE = `${BASE_URL}/logo512.png`;
const LD_SCRIPT_ID = '__ld-json__';

const setMetaTag = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const setNameMeta = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

export const useSEO = ({ title, description, image, jsonLd }: SEOProps = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    const desc = description || BASE_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;
    const url = window.location.href;

    document.title = fullTitle;

    // Standard meta
    setNameMeta('description', desc);

    // Open Graph
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', desc);
    setMetaTag('og:image', img);
    setMetaTag('og:url', url);
    setMetaTag('og:type', 'website');
    setMetaTag('og:site_name', 'MOBA Wiki');

    // Twitter Card
    setNameMeta('twitter:card', 'summary_large_image');
    setNameMeta('twitter:title', fullTitle);
    setNameMeta('twitter:description', desc);
    setNameMeta('twitter:image', img);

    return () => {
      document.title = BASE_TITLE;
      setNameMeta('description', BASE_DESCRIPTION);
    };
  }, [title, description, image]);

  // JSON-LD structured data — stable string dep avoids re-run on object identity change
  const jsonLdStr = jsonLd !== undefined ? JSON.stringify(jsonLd) : undefined;

  useEffect(() => {
    if (!jsonLdStr) {
      document.getElementById(LD_SCRIPT_ID)?.remove();
      return;
    }
    let script = document.getElementById(LD_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = LD_SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = jsonLdStr;
    return () => {
      document.getElementById(LD_SCRIPT_ID)?.remove();
    };
  }, [jsonLdStr]);
};
