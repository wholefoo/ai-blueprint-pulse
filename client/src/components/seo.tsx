import { useEffect } from "react";

const SITE_NAME = "AI Blueprint Pulse";
const SITE_URL = "https://aiblueprintpulse.com";
const DEFAULT_DESCRIPTION = "AI-powered business intelligence platform with multi-model research, blueprint generation, and market analysis across 24 industry verticals.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.png`;

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  article?: {
    publishedTime?: string;
    author?: string;
    category?: string;
  };
  noindex?: boolean;
}

function setMetaTag(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function SEO({ title, description, path = "", ogImage, ogType = "website", article, noindex }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Business Success Guides`;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    setMetaTag("description", desc, true);

    setMetaTag("og:title", fullTitle);
    setMetaTag("og:description", desc);
    setMetaTag("og:url", url);
    setMetaTag("og:image", image);
    setMetaTag("og:type", ogType);
    setMetaTag("og:site_name", SITE_NAME);

    setMetaTag("twitter:card", "summary_large_image", true);
    setMetaTag("twitter:title", fullTitle, true);
    setMetaTag("twitter:description", desc, true);
    setMetaTag("twitter:image", image, true);

    if (article) {
      if (article.publishedTime) setMetaTag("article:published_time", article.publishedTime);
      if (article.author) setMetaTag("article:author", article.author);
      if (article.category) setMetaTag("article:section", article.category);
    }

    setLinkTag("canonical", url);

    if (noindex) {
      setMetaTag("robots", "noindex, nofollow", true);
    } else {
      const existing = document.querySelector('meta[name="robots"]');
      if (existing) existing.remove();
    }

    return () => {
      document.title = `${SITE_NAME} - Business Success Guides`;
    };
  }, [fullTitle, desc, url, image, ogType, article, noindex]);

  return null;
}

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    script.setAttribute("data-jsonld", "true");
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [JSON.stringify(data)]);

  return null;
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: DEFAULT_OG_IMAGE,
        description: DEFAULT_DESCRIPTION,
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: `${SITE_URL}/about`,
        },
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
        },
      }}
    />
  );
}

export function ProductSchema({
  name,
  description,
  price,
  currency = "USD",
  url,
  category,
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  url: string;
  category?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        url: `${SITE_URL}${url}`,
        category: category || "Business Guide",
        brand: {
          "@type": "Brand",
          name: SITE_NAME,
        },
        offers: {
          "@type": "Offer",
          price: (price / 100).toFixed(2),
          priceCurrency: currency,
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        },
      }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  url,
  publishedTime,
  author,
  category,
  image,
}: {
  title: string;
  description: string;
  url: string;
  publishedTime?: string;
  author?: string;
  category?: string;
  image?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: `${SITE_URL}${url}`,
        image: image || DEFAULT_OG_IMAGE,
        datePublished: publishedTime,
        author: {
          "@type": "Organization",
          name: author || SITE_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: DEFAULT_OG_IMAGE,
          },
        },
        articleSection: category,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}${url}`,
        },
      }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.url}`,
        })),
      }}
    />
  );
}

export function FAQSchema({ questions }: { questions: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      }}
    />
  );
}

export function SoftwareApplicationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: DEFAULT_DESCRIPTION,
        url: SITE_URL,
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "75",
          priceCurrency: "USD",
          offerCount: "3",
        },
        featureList: [
          "Multi-Model AI Analysis (ChatGPT, Claude, Gemini, Grok, Perplexity)",
          "Business Intelligence across 24 Industry Verticals",
          "AI-Powered Blueprint Generation with DOCX Download",
          "Blueprint Studio with Credit-Based System",
          "Market Research and Pain Point Discovery",
          "Agent Implementation Script Generation",
        ],
      }}
    />
  );
}
