import { useEffect } from 'react';
import { getToolById } from '@/lib/tools-config';
import { getToolSEO } from '@/lib/seo-config';

const BASE_URL = 'https://www.shivasaxena.com/handy-dev-tools';

interface SEOHeadProps {
  toolId?: string;
}

export function SEOHead({ toolId }: SEOHeadProps) {
  useEffect(() => {
    if (!toolId) return;

    const tool = getToolById(toolId);
    if (!tool) return;

    const seo = getToolSEO(toolId);
    const toolUrl = `${BASE_URL}/tool/${toolId}`;
    const title = seo?.title
      ? `${seo.title} | HandyDevTools`
      : `${tool.name} - Free Online Tool | HandyDevTools`;
    const description = seo?.metaDescription
      || `${tool.description}. Free online ${tool.name.toLowerCase()} tool. Fast, secure, and client-side processing.`;

    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="keywords"]', 'content', seo?.keywords?.join(', ') || '');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', toolUrl);
    setMeta('meta[property="twitter:title"]', 'content', title);
    setMeta('meta[property="twitter:description"]', 'content', description);
    setMeta('meta[property="twitter:url"]', 'content', toolUrl);
    setMeta('link[rel="canonical"]', 'href', toolUrl);

    // Structured data with FAQ
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) existingScript.remove();

    const structuredData: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": tool.name,
        "description": description,
        "url": toolUrl,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Organization",
          "name": "HandyDevTools"
        },
        "isPartOf": {
          "@type": "WebApplication",
          "name": "HandyDevTools",
          "url": BASE_URL + "/"
        }
      }
    ];

    if (seo?.faq?.length) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": seo.faq.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        }))
      });
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [toolId]);

  return null;
}
