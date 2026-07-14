import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityBannerRow {
  id: string;
  image_url: string;
  href: string;
  alt: string;
  is_external: boolean;
  start_at: string;
  end_at: string;
  is_active: boolean;
}

const CACHE_KEY = "deluxla:community-banner:v1";

type CachedBanner = {
  image_url: string;
  href: string;
  alt: string;
  is_external: boolean;
};

function readCache(): CachedBanner | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedBanner) : null;
  } catch {
    return null;
  }
}

function writeCache(v: CachedBanner | null) {
  if (typeof window === "undefined") return;
  try {
    if (v) window.localStorage.setItem(CACHE_KEY, JSON.stringify(v));
    else window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function CommunityBanner() {
  const cached = readCache();
  const [banner, setBanner] = useState<CachedBanner | null>(cached);
  const [loaded, setLoaded] = useState(false);
  const [fetched, setFetched] = useState(!!cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("community_banners" as never)
        .select("image_url,href,alt,is_external,start_at,end_at,is_active")
        .lte("start_at", nowIso)
        .gt("end_at", nowIso)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      const row = data as unknown as CommunityBannerRow | null;
      if (row?.image_url) {
        const next: CachedBanner = {
          image_url: row.image_url,
          href: row.href || "/community",
          alt: row.alt || "딜렉스타 커뮤니티 배너",
          is_external: !!row.is_external,
        };
        setBanner(next);
        writeCache(next);
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
        {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
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
