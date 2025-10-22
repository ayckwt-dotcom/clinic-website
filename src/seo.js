// src/seo.js
import { useEffect } from "react";

function upsert(tag, attrs) {
  const selector = Object.entries(attrs)
    .map(([k, v]) => `[${k}="${String(v).replace(/"/g, '\\"')}"]`)
    .join("");
  let el = document.head.querySelector(`${tag}${selector}`);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

export function useHead({ title, description, canonical, favVersion = "3" }) {
  useEffect(() => {
    // <title>
    if (title) document.title = title;

    // <meta name="description">
    if (description) {
      upsert("meta", { name: "description" }).setAttribute("content", description);
    }

    // <link rel="canonical">
    if (canonical) {
      upsert("link", { rel: "canonical" }).setAttribute("href", canonical);
    }

    // Favicons (cache-busted with ?v=...)
    const icons = [
      { rel: "icon", type: "image/png", sizes: "48x48", href: `/favicon-48x48.png?v=${favVersion}` },
      { rel: "icon", type: "image/png", sizes: "32x32", href: `/favicon-32x32.png?v=${favVersion}` },
      { rel: "icon", type: "image/png", sizes: "16x16", href: `/favicon-16x16.png?v=${favVersion}` },
      { rel: "icon", sizes: "any", href: `/favicon.ico?v=${favVersion}` },
      // optional fallbacks:
      { rel: "icon", type: "image/png", href: `/favicon.png?v=${favVersion}` },
      { rel: "apple-touch-icon", sizes: "180x180", href: `/apple-touch-icon.png?v=${favVersion}` },
    ];
    icons.forEach((attrs) => upsert("link", attrs));
  }, [title, description, canonical, favVersion]);
}
