import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

const BASE_TITLE = 'Wiki for Mobile Legends (Unofficial)';
const BASE_DESCRIPTION = 'Unofficial fan-made guide for Mobile Legends. Heroes stats, builds, rankings, items and more. Not affiliated with Moonton.';

export const useSEO = ({ title, description }: SEOProps = {}) => {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || BASE_DESCRIPTION);
    }

    return () => {
      document.title = BASE_TITLE;
      if (metaDesc) {
        metaDesc.setAttribute('content', BASE_DESCRIPTION);
      }
    };
  }, [title, description]);
};
