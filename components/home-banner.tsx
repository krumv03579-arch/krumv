import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_HREF = "/market";
const DEFAULT_ALT = "딜렉스타 배너";
const CACHE_KEY = "deluxla:home-banner:v1";

type HomeBannerSetting = {
  image_url?: string;
  href?: string;
  alt?: string;
  is_external?: boolean;
};

function readCache(): HomeBannerSetting | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as HomeBannerSetting) : null;
  } catch {
    return null;
  }
}

function writeCache(v: HomeBannerSetting | null) {
  if (typeof window === "undefined") return;
  try {
    if (v) window.localStorage.setItem(CACHE_KEY, JSON.stringify(v));
    else window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function HomeBanner() {
  const [banner, setBanner] = useState<{
    image_url: string;
    href: string;
    alt: string;
    is_external: boolean;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Hydrate from localStorage cache after mount to avoid SSR/client mismatch.
  useEffect(() => {
    const cached = readCache();
    if (cached?.image_url) {
      setBanner({
        image_url: cached.image_url,
        href: cached.href || DEFAULT_HREF,
        alt: cached.alt || DEFAULT_ALT,
        is_external: !!cached.is_external,
      });
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("home_banners" as never)
        .select("image_url,href,alt,is_external")
        .lte("start_at", nowIso)
        .gt("end_at", nowIso)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      const v = (data ?? null) as HomeBannerSetting | null;
      if (v?.image_url) {
        setBanner({
          image_url: v.image_url,
          href: v.href || DEFAULT_HREF,
          alt: v.alt || DEFAULT_ALT,
          is_external: !!v.is_external,
        });
        writeCache(v);
      } else {
        setBanner(null);
        writeCache(null);
      }
      setFetched(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Inject <link rel="preload"> for the banner image so the browser fetches
  // it with high priority as soon as the URL is known.
  useEffect(() => {
    if (typeof document === "undefined" || !banner?.image_url) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = banner.image_url;
    (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = "high";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [banner?.image_url]);

  if (!fetched) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-secondary">
        <div className="relative w-full animate-pulse bg-muted" style={{ aspectRatio: "600 / 150" }} />
      </div>
    );
  }

  if (!banner) return null;

  const isExternal = banner.is_external || /^https?:\/\//i.test(banner.href);
  const inner = (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-secondary">
      <div className="relative w-full" style={{ aspectRatio: "600 / 150" }}>
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={banner.image_url}
          alt={banner.alt}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          loading="eager"
          decoding="async"
          // @ts-expect-error - fetchpriority is a valid HTML attribute
          fetchpriority="high"
        />
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={banner.href}
        target={banner.is_external ? "_blank" : undefined}
        rel={banner.is_external ? "noopener noreferrer" : undefined}
        className="block"
        aria-label={banner.alt}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={banner.href} className="block" aria-label={banner.alt}>
      {inner}
    </Link>
  );
}