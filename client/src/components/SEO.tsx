import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonical?: string;
}

export default function SEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  canonical,
}: SEOProps) {
  useEffect(() => {
    // Title
    const baseTitle = "Diário do Mundo | Notícias Independentes";
    document.title = title ? `${title} | Diário do Mundo` : baseTitle;

    // Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description || "Portal de notícias independente com cobertura completa de política, economia, investimentos, ciência e tecnologia.");
    }

    // Canonical
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute("href", canonical || window.location.href);
    }

    // Open Graph
    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (ogTypeTag) ogTypeTag.setAttribute("content", ogType);

    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) ogTitleTag.setAttribute("content", ogTitle || title || baseTitle);

    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) ogDescTag.setAttribute("content", ogDescription || description || "Informação independente de política e economia em tempo real.");

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag && ogImage) ogImageTag.setAttribute("content", ogImage);

    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) ogUrlTag.setAttribute("content", window.location.href);

  }, [title, description, ogTitle, ogDescription, ogImage, ogType, canonical]);

  return null;
}
