import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Heart, MessageCircle, ImageIcon, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatKRW, timeAgo, PLACEHOLDER_IMAGE, type DbProduct } from "@/lib/products";
import { HomeBanner } from "@/components/home-banner";

// Tile sizing — tweak here to change the whole feature grid.
const GRID_TILE_SIZE = {
  // Square tile diameter/height.
  circle: "h-20 w-20 sm:h-24 sm:w-24",
  // Label font size.
  label: "mt-3 text-[13px] font-semibold text-foreground sm:text-sm",
};

type QuickLink = {
  id: string;
  sort_order: number;
  image_url: string | null;
  label: string;
  link_url: string;
  is_active: boolean;
};

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

async function fetchDisplayNames(userIds: string[]): Promise<Record<string, string>> {
  const ids = Array.from(new Set(userIds));
  if (ids.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles" as never)
    .select("id, display_name")
    .in("id", ids);
  if (error) return {};
  const map: Record<string, string> = {};
  for (const row of (data ?? []) as unknown as { id: string; display_name: string }[]) {
    map[row.id] = row.display_name;
  }
  return map;
}

type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
};

const NEW_MS = 1000 * 60 * 60 * 24; // 24h

function isNew(iso: string) {
  return Date.now() - new Date(iso).getTime() < NEW_MS;
}

function SectionHeader({
  title,
  subtitle,
  moreTo,
}: {
  title: string;
  subtitle: string;
  moreTo: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {subtitle}
        </p>
      </div>
      <Link
        to={moreTo}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        전체보기 <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function CardThumb({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary">
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 opacity-40" />
        </div>
      )}
    </div>
  );
}

function NewBadge() {
  return (
    <span className="ml-1 inline-flex items-center rounded-sm bg-destructive/10 px-1 py-[1px] align-middle text-[10px] font-black leading-none text-destructive">
      NEW
    </span>
  );
}

function Stat({
  icon: Icon,
  value,
  strong,
}: {
  icon: typeof Heart;
  value: number;
  strong?: boolean;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 " +
        (strong ? "font-bold text-destructive" : "text-muted-foreground")
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {value.toLocaleString("ko-KR")}
    </span>
  );
}

function CardSkeleton() {
  return (
    <li>
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-secondary" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
      </div>
    </li>
  );
}

function FeatureGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ["home", "quick_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_links" as never)
        .select("id,sort_order,image_url,label,link_url,is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as unknown as QuickLink[]) ?? [];
    },
  });

  const tiles = data ?? [];

  return (
    <section className="pt-2">
      <SectionHeader
        title="딜렉스타 추천"
        subtitle="원하는 콘텐츠를 빠르게 찾아보세요"
        moreTo="/all"
      />
      <ul className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-6">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex flex-col items-center text-center">
              <div className={`${GRID_TILE_SIZE.circle} animate-pulse rounded-full bg-secondary`} />
              <div className="mt-3 h-3 w-10 animate-pulse rounded bg-secondary" />
            </li>
          ))}
        {!isLoading &&
          tiles.map((t) => <QuickTile key={t.id} tile={t} />)}
      </ul>
    </section>
  );
}

function QuickTile({ tile }: { tile: QuickLink }) {
  const external = isExternalUrl(tile.link_url);
  const circle = (
    <div
      className={`grid ${GRID_TILE_SIZE.circle} place-items-center overflow-hidden rounded-full bg-secondary transition-transform group-hover:-translate-y-0.5 group-hover:shadow-sm`}
    >
      {tile.image_url ? (
        <img
          src={tile.image_url}
          alt={tile.label}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
      )}
    </div>
  );
  const label = <span className={GRID_TILE_SIZE.label}>{tile.label}</span>;

  return (
    <li className="flex flex-col items-center text-center">
      {external ? (
        <a
          href={tile.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center focus:outline-none"
        >
          {circle}
          {label}
        </a>
      ) : (
        <Link
          to={tile.link_url as never}
          className="group flex flex-col items-center focus:outline-none"
        >
          {circle}
          {label}
        </Link>
      )}
    </li>
  );
}

function MarketSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["home", "market", 6],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      const rows = (data ?? []) as unknown as DbProduct[];
      const names = await fetchDisplayNames(rows.map((r) => r.user_id));
      return { rows, names };
    },
  });
  const rows = data?.rows ?? [];
  const names = data?.names ?? {};

  return (
    <section className="pt-2">
      <SectionHeader
        title="마켓"
        subtitle="최근 등록된 유니폼·용품"
        moreTo="/market"
      />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        {!isLoading && rows.length === 0 && (
          <li className="col-span-full py-10 text-center text-sm text-muted-foreground">
            아직 등록된 상품이 없어요.
          </li>
        )}
        {rows.map((p) => (
          <li key={p.id}>
            <Link
              to="/products/$id"
              params={{ id: p.id }}
              className="group block"
            >
              <CardThumb src={p.images?.[0]} alt={p.title} />
              <div className="mt-3">
                <p className="line-clamp-1 text-sm font-bold leading-snug">
                  {p.title}
                  {isNew(p.created_at) && <NewBadge />}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {p.team} · {p.size}
                </p>
                <p className="mt-1.5 text-sm font-black text-pitch">
                  {formatKRW(p.price)}
                </p>
                <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                  {names[p.user_id] ?? "익명"} · {timeAgo(p.created_at)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommunitySection() {
  const { data, isLoading } = useQuery({
    queryKey: ["home", "community", 6],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      const rows = (data ?? []) as unknown as Post[];
      const names = await fetchDisplayNames(rows.map((r) => r.user_id));
      return { rows, names };
    },
  });
  const rows = data?.rows ?? [];
  const names = data?.names ?? {};

  return (
    <section className="pt-2">
      <SectionHeader
        title="커뮤니티"
        subtitle="자유게시판·질문·후기"
        moreTo="/community"
      />
      <ul className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
                <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                </div>
              </div>
            </li>
          ))}
        {!isLoading && rows.length === 0 && (
          <li className="col-span-full py-10 text-center text-sm text-muted-foreground">
            아직 게시글이 없어요.
          </li>
        )}
        {rows.map((p) => (
          <li key={p.id}>
            <Link
              to="/community/$id"
              params={{ id: p.id }}
              className="group flex gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/20 hover:bg-secondary/40"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {p.image_urls?.[0] ? (
                  <img
                    src={p.image_urls[0]}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground">
                    <ImageIcon className="h-5 w-5 opacity-40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold leading-snug">
                  {p.title}
                  {isNew(p.created_at) && <NewBadge />}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {p.content}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-3">
                    <Stat icon={Heart} value={p.likes_count} strong={p.likes_count > 0} />
                    <Stat icon={MessageCircle} value={p.comments_count} strong={p.comments_count > 0} />
                  </span>
                  <span className="truncate text-muted-foreground">
                    {names[p.user_id] ?? "익명"} · {timeAgo(p.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomeDashboard() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="mb-8 sm:mb-10">
        <HomeBanner />
      </div>
      <div className="space-y-10 sm:space-y-14">
        <FeatureGrid />
        <MarketSection />
        <CommunitySection />
      </div>
    </main>
  );
}

// Suppress unused import warning for Eye (kept for future view counts)
void Eye;