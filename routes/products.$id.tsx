import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, Shield, Truck, MessageSquare, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  formatKRW,
  PLACEHOLDER_IMAGE,
  sellerHandle,
  timeAgo,
  type DbProduct,
} from "@/lib/products";

export const Route = createFileRoute("/products/$id")({
  ssr: false,
  component: ProductDetail,
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-md p-8 text-center">
      <p className="text-sm text-muted-foreground">상품을 불러오지 못했어요.</p>
      <button onClick={reset} className="mt-3 rounded-md bg-pitch px-4 py-2 text-xs font-bold text-pitch-foreground">다시 시도</button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md p-12 text-center">
      <h2 className="text-xl font-bold">상품을 찾을 수 없어요</h2>
      <Link to="/" className="mt-4 inline-block rounded-md bg-pitch px-4 py-2 text-xs font-bold text-pitch-foreground">마켓으로</Link>
    </div>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const [liked, setLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as DbProduct;
    },
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="mx-auto max-w-md p-12 text-center">
        <h2 className="text-xl font-bold">상품을 찾을 수 없어요</h2>
        <Link to="/" className="mt-4 inline-block rounded-md bg-pitch px-4 py-2 text-xs font-bold text-pitch-foreground">마켓으로</Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const seller = sellerHandle(product.user_id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 마켓으로
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-square bg-secondary">
              <img
                src={images[activeImg]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                    activeImg === i ? "border-pitch" : "border-border"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-foreground/90 px-2 py-0.5 text-[11px] font-bold text-background">
              {product.size}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                product.condition === "새상품"
                  ? "bg-pitch/10 text-pitch"
                  : "bg-secondary text-foreground/70"
              }`}
            >
              {product.condition}
            </span>
            <span className="text-xs text-muted-foreground">· {product.team}</span>
          </div>

          <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            {product.title}
          </h1>
          {product.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-black text-price sm:text-4xl">
              {formatKRW(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">고정가 · 즉시구매</span>
          </div>

          <div className="mt-5 grid gap-2 rounded-xl border border-border bg-card p-3 text-xs sm:grid-cols-3">
            <Feature icon={<Shield className="h-4 w-4" />} title="안전결제" desc="딜렉스타 보호" />
            <Feature icon={<Truck className="h-4 w-4" />} title="2–3일 배송" desc="택배 발송" />
            <Feature icon={<MessageSquare className="h-4 w-4" />} title="판매자 채팅" desc="실시간 문의" />
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold">
              {seller.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">@{seller}</div>
              <div className="text-xs text-muted-foreground">{timeAgo(product.created_at)} 등록</div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setLiked((v) => !v)}
              aria-label="관심"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border hover:bg-secondary"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-price text-price" : "text-foreground/70"}`} />
            </button>
            <button className="h-12 flex-1 rounded-xl border border-border bg-background text-sm font-bold hover:bg-secondary">
              채팅하기
            </button>
            <button className="h-12 flex-[1.5] rounded-xl bg-pitch text-sm font-black text-pitch-foreground hover:opacity-90">
              바로 구매하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-pitch/10 text-pitch">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-bold">{title}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}