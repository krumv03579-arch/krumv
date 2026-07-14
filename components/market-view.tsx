import { useMemo, useState } from "react";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  CONDITIONS,
  PRICE_RANGES,
  SIZES,
  type DbProduct,
} from "@/lib/products";
import { ProductCard } from "./product-card";

type SortKey = "recent" | "price_asc" | "price_desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "최신순" },
  { key: "price_asc", label: "낮은가격순" },
  { key: "price_desc", label: "높은가격순" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-pitch bg-pitch text-pitch-foreground"
          : "border-border bg-background text-foreground/80 hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}

export function MarketView() {
  const [team, setTeam] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number] | null>(null);
  const [priceIdx, setPriceIdx] = useState(0);
  const [sort, setSort] = useState<SortKey>("recent");

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DbProduct[];
    },
  });

  const teams = useMemo(
    () => Array.from(new Set(products.map((p) => p.team))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceIdx];
    let list = products.filter((p) => {
      if (team && p.team !== team) return false;
      if (size && p.size !== size) return false;
      if (condition && p.condition !== condition) return false;
      if (p.price < range.min || p.price > range.max) return false;
      return true;
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, team, size, condition, priceIdx, sort]);

  const reset = () => {
    setTeam(null);
    setSize(null);
    setCondition(null);
    setPriceIdx(0);
  };

  const activeCount = [team, size, condition].filter(Boolean).length + (priceIdx > 0 ? 1 : 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-pitch">
            <span className="inline-block h-2 w-2 rounded-full bg-pitch" />
            마켓
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            판매중인 상품
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            총 <span className="font-bold text-foreground">{filtered.length}</span>건 ·
            안전거래로 보호되는 고정가 마켓
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-md border border-border bg-background p-1 sm:flex">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setSort(o.key)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                  sort === o.key ? "bg-foreground text-background" : "text-foreground/70 hover:bg-secondary"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-xs font-semibold sm:hidden"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="mb-5 space-y-3 rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <SlidersHorizontal className="h-4 w-4 text-pitch" />
          필터
          {activeCount > 0 && (
            <button
              onClick={reset}
              className="ml-auto rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              초기화 ({activeCount})
            </button>
          )}
        </div>

        <FilterRow label="팀">
          <Chip active={team === null} onClick={() => setTeam(null)}>전체</Chip>
          {teams.map((t) => (
            <Chip key={t} active={team === t} onClick={() => setTeam(team === t ? null : t)}>
              {t}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="사이즈">
          <Chip active={size === null} onClick={() => setSize(null)}>전체</Chip>
          {SIZES.map((s) => (
            <Chip key={s} active={size === s} onClick={() => setSize(size === s ? null : s)}>
              {s}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="상태">
          <Chip active={condition === null} onClick={() => setCondition(null)}>전체</Chip>
          {CONDITIONS.map((c) => (
            <Chip key={c} active={condition === c} onClick={() => setCondition(condition === c ? null : c)}>
              {c}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="가격">
          {PRICE_RANGES.map((r, i) => (
            <Chip key={r.label} active={priceIdx === i} onClick={() => setPriceIdx(i)}>
              {r.label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {isLoading ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-destructive/40 bg-card p-12 text-center">
          <p className="text-sm font-semibold text-destructive">상품을 불러오지 못했어요</p>
          <p className="mt-1 text-xs text-muted-foreground">{(error as Error).message}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm font-semibold text-foreground">
            {products.length === 0 ? "아직 등록된 상품이 없어요" : "조건에 맞는 상품이 없어요"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {products.length === 0 ? "첫 상품을 등록해 마켓을 시작해보세요." : "필터를 조정해 다시 검색해보세요."}
          </p>
          {products.length === 0 ? (
            <Link
              to="/sell"
              className="mt-4 inline-block rounded-md bg-pitch px-4 py-2 text-xs font-bold text-pitch-foreground"
            >
              상품 등록하기
            </Link>
          ) : (
            <button
              onClick={reset}
              className="mt-4 rounded-md bg-pitch px-4 py-2 text-xs font-bold text-pitch-foreground"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[72px_minmax(0,1fr)]">
      <div className="pt-1.5 text-xs font-bold text-muted-foreground">{label}</div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}