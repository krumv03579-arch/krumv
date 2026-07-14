import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import deluxlaLogo from "@/assets/deluxla-logo.png.asset.json";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Package,
  MessageSquare,
  Trash2,
  ShieldCheck,
  Home as HomeIcon,
  Image as ImageIcon,
  LayoutGrid,
  Activity,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatKRW, timeAgo, sellerHandle } from "@/lib/products";
import { CommunityBannerManager } from "@/components/admin/community-banner-manager";
import { HomeBannerManager } from "@/components/admin/home-banner-manager";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { ActivityLogPanel } from "@/components/admin/activity-log-panel";
import { QuickLinksManager } from "@/components/admin/quick-links-manager";
import { logActivity } from "@/lib/activity-log";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
});

type ViewKey =
  | "overview"
  | "products"
  | "comments"
  | "users"
  | "banners"
  | "quicklinks"
  | "activity";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: "main" | "data";
}

const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "홈", icon: HomeIcon, group: "main" },
  { key: "banners", label: "배너 관리", icon: ImageIcon, group: "main" },
  { key: "quicklinks", label: "빠른 메뉴", icon: LayoutGrid, group: "main" },
  { key: "products", label: "상품", icon: Package, group: "data" },
  { key: "comments", label: "댓글", icon: MessageSquare, group: "data" },
  { key: "users", label: "사용자 · 권한", icon: Users, group: "data" },
  { key: "activity", label: "활동 로그", icon: Activity, group: "data" },
];

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [roleCheckErr, setRoleCheckErr] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [view, setView] = useState<ViewKey>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: "/admin" },
      });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (error) setRoleCheckErr(error.message);
      setIsAdmin(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  async function claimAdmin() {
    setClaiming(true);
    const { error } = await supabase.rpc("bootstrap_admin");
    setClaiming(false);
    if (error) {
      setRoleCheckErr(error.message);
      return;
    }
    setIsAdmin(true);
  }

  if (authLoading || isAdmin === null) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fafafa] text-sm text-muted-foreground">
        불러오는 중...
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fafafa] px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-xl font-black">관리자 전용</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            이 계정에는 관리자 권한이 없습니다. 아직 등록된 관리자가 없다면 본인을 첫 관리자로 지정할 수 있어요.
          </p>
          <Button onClick={claimAdmin} disabled={claiming} className="mt-5 w-full">
            {claiming ? "처리 중..." : "본인을 첫 관리자로 지정"}
          </Button>
          {roleCheckErr && <p className="mt-3 text-xs text-destructive">{roleCheckErr}</p>}
          <Link to="/" className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground">
            ← 홈으로
          </Link>
        </div>
      </main>
    );
  }

  const displayName = (user?.email ?? "관리자").split("@")[0];

  const navItems = (
    <>
      <SidebarSection title={null}>
        {NAV_ITEMS.filter((n) => n.group === "main").map((n) => (
          <SidebarLink
            key={n.key}
            item={n}
            active={view === n.key}
            onClick={() => {
              setView(n.key);
              setMobileNavOpen(false);
            }}
          />
        ))}
      </SidebarSection>
      <SidebarSection title="데이터베이스">
        {NAV_ITEMS.filter((n) => n.group === "data").map((n) => (
          <SidebarLink
            key={n.key}
            item={n}
            active={view === n.key}
            onClick={() => {
              setView(n.key);
              setMobileNavOpen(false);
            }}
          />
        ))}
      </SidebarSection>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <img src={deluxlaLogo.url} alt="딜렉스타" className="h-6 w-auto" />
          <span className="text-sm font-bold tracking-tight">딜렉스타 Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 text-sm">
          {navItems}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span>← 사이트로 이동</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <img src={deluxlaLogo.url} alt="딜렉스타" className="h-6 w-auto" />
                <span className="text-sm font-bold tracking-tight">딜렉스타 Admin</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="메뉴 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2 text-sm">{navItems}</nav>
            <div className="border-t border-border p-3">
              <Link
                to="/"
                className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <span>← 사이트로 이동</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur sm:px-8">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted md:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-9 w-full rounded-full border border-border bg-[#f6f6f7] pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
              placeholder="Search or jump to"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted">
              <Bell className="h-4 w-4" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
          {view === "overview" && <OverviewView displayName={displayName} />}
          {view === "products" && <ProductsView qc={qc} />}
          {view === "comments" && <CommentsView qc={qc} />}
          {view === "users" && (
            <ViewShell title="사용자 · 권한 관리" subtitle="관리자 역할을 부여하거나 회수합니다.">
              <Panel>
                <UserRoleManager />
              </Panel>
            </ViewShell>
          )}
          {view === "banners" && (
            <ViewShell title="배너 관리" subtitle="홈(전체글) 배너 · 커뮤니티 배너 · 노출 시간대를 설정합니다.">
              <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="① 홈 배너 (600×150)">
                  <HomeBannerManager />
                </Panel>
                <Panel title="② 커뮤니티 배너 (600×150)">
                  <CommunityBannerManager />
                </Panel>
              </div>
            </ViewShell>
          )}
          {view === "quicklinks" && (
            <ViewShell title="빠른 메뉴 관리" subtitle="홈 상단 6개 원형 바로가기를 편집합니다.">
              <Panel title="홈 상단 · 빠른 메뉴 6슬롯">
                <QuickLinksManager />
              </Panel>
            </ViewShell>
          )}
          {view === "activity" && (
            <ViewShell title="활동 로그" subtitle="로그인 · 글 작성 · 삭제 등의 사용자 활동 타임라인.">
              <Panel title="최근 활동">
                <ActivityLogPanel enabled />
              </Panel>
            </ViewShell>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================= Overview ============================= */

type RangeKey = "7d" | "30d";

interface AdminStats {
  total_users: number;
  total_visits: number;
  today_visits: number;
  today_products: number;
  today_comments: number;
  total_products: number;
  total_comments: number;
}

function OverviewView({ displayName }: { displayName: string }) {
  const [range, setRange] = useState<RangeKey>("7d");

  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async (): Promise<AdminStats> => {
      const { data, error } = await supabase.rpc("get_admin_stats");
      if (error) throw error;
      return data as unknown as AdminStats;
    },
  });

  const uv = useQuery({
    queryKey: ["admin", "uv", range],
    queryFn: async () => {
      const days = range === "7d" ? 7 : 30;
      const since = new Date();
      since.setDate(since.getDate() - (days - 1));
      since.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("page_views")
        .select("visitor_id, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true })
        .limit(50000);
      if (error) throw error;

      const buckets = new Map<string, Set<string>>();
      for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        buckets.set(dayKey(d), new Set());
      }
      for (const row of data ?? []) {
        const k = dayKey(new Date(row.created_at as string));
        const set = buckets.get(k);
        if (set && row.visitor_id) set.add(row.visitor_id as string);
      }
      const series = Array.from(buckets.entries()).map(([day, set]) => ({
        day,
        label: day.slice(5),
        uv: set.size,
      }));
      const total = series.reduce((s, r) => s + r.uv, 0);
      const half = Math.floor(series.length / 2);
      const prev = series.slice(0, half).reduce((s, r) => s + r.uv, 0);
      const curr = series.slice(half).reduce((s, r) => s + r.uv, 0);
      return { series, total, prev, curr };
    },
  });

  const recentProducts = useQuery({
    queryKey: ["admin", "recent-products-mini"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,price,team,created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const trend = uv.data ? uv.data.curr - uv.data.prev : 0;
  const trendPct = uv.data && uv.data.prev > 0 ? Math.round((trend / uv.data.prev) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {displayName}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Big chart */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">방문자 수</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight tabular-nums">
                  {uv.data ? uv.data.total.toLocaleString("ko-KR") : "—"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {range === "7d" ? "최근 7일" : "최근 30일"} 순 방문자
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs">
                {trend >= 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{trend.toLocaleString("ko-KR")} ({trendPct}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-600">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {trend.toLocaleString("ko-KR")} ({trendPct}%)
                  </span>
                )}
                <span className="text-muted-foreground">전반기 대비</span>
              </div>
            </div>
            <div className="inline-flex rounded-full border border-border bg-[#f6f6f7] p-0.5 text-xs font-medium">
              <RangePill active={range === "7d"} onClick={() => setRange("7d")}>
                Last 7 days
              </RangePill>
              <RangePill active={range === "30d"} onClick={() => setRange("30d")}>
                Last 30 days
              </RangePill>
            </div>
          </div>

          <div className="mt-6 h-64">
            <UVChart data={uv.data?.series ?? []} />
          </div>
        </div>

        {/* Side stat list */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 text-sm font-medium">주요 지표</div>
          <ul className="divide-y divide-border text-sm">
            <StatRow label="총 가입자" value={stats.data?.total_users} />
            <StatRow label="누적 방문" value={stats.data?.total_visits} />
            <StatRow label="오늘 방문" value={stats.data?.today_visits} />
            <StatRow label="누적 상품" value={stats.data?.total_products} />
            <StatRow label="오늘 등록 상품" value={stats.data?.today_products} />
            <StatRow label="누적 댓글" value={stats.data?.total_comments} />
            <StatRow label="오늘 댓글" value={stats.data?.today_comments} />
          </ul>
        </div>
      </div>

      {/* Bottom row: latest products preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">최근 등록 상품</h2>
            <span className="text-xs text-muted-foreground">Top 5</span>
          </div>
          {recentProducts.isLoading ? (
            <p className="py-4 text-sm text-muted-foreground">불러오는 중...</p>
          ) : (recentProducts.data?.length ?? 0) === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">아직 등록된 상품이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {recentProducts.data?.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.team} · {timeAgo(p.created_at)}</p>
                  </div>
                  <span className="shrink-0 font-mono tabular-nums">{formatKRW(p.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">최근 활동</h2>
            <span className="text-xs text-muted-foreground">실시간</span>
          </div>
          <div className="-mx-5 max-h-[280px] overflow-y-auto">
            <ActivityLogPanel enabled />
          </div>
        </div>
      </div>

      {stats.error && (
        <p className="text-xs text-destructive">통계 로드 실패: {(stats.error as Error).message}</p>
      )}
      {uv.error && (
        <p className="text-xs text-destructive">방문자 데이터 로드 실패: {(uv.error as Error).message}</p>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | undefined }) {
  return (
    <li className="flex items-center justify-between py-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">
        {value === undefined ? "—" : value.toLocaleString("ko-KR")}
      </span>
    </li>
  );
}

function RangePill({
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
      className={`rounded-full px-3 py-1 transition-colors ${
        active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function UVChart({ data }: { data: { label: string; uv: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="uvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: "1px solid var(--border)",
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v.toLocaleString("ko-KR")} 명`, "순 방문자"]}
          labelFormatter={(l) => `${l}`}
        />
        <Area
          type="monotone"
          dataKey="uv"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#uvFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ============================= Data views ============================= */

function ProductsView({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const products = useQuery({
    queryKey: ["admin", "products-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,price,user_id,team,created_at,images")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function deleteProduct(id: string, title?: string) {
    if (!confirm("이 상품을 삭제할까요?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return alert(error.message);
    await logActivity({ action: "product_delete", targetType: "product", targetId: id, metadata: { title } });
    qc.invalidateQueries({ queryKey: ["admin"] });
  }

  return (
    <ViewShell title="상품" subtitle="등록된 상품 목록 · 최대 100건">
      <Panel>
        {products.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">불러오는 중...</p>
        ) : (products.data?.length ?? 0) === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">아직 등록된 상품이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#fafafa] text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">상품</th>
                <th className="px-4 py-2.5 text-right font-medium">가격</th>
                <th className="px-4 py-2.5 text-left font-medium">판매자</th>
                <th className="px-4 py-2.5 text-left font-medium">등록</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {products.data?.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5">
                    <Link
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.team}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatKRW(p.price)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">@{sellerHandle(p.user_id)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{timeAgo(p.created_at)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => deleteProduct(p.id, p.title)}
                      aria-label="삭제"
                      className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </ViewShell>
  );
}

function CommentsView({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const comments = useQuery({
    queryKey: ["admin", "comments-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id,content,user_id,product_id,post_id,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function deleteComment(id: string) {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return alert(error.message);
    await logActivity({ action: "comment_delete", targetType: "comment", targetId: id });
    qc.invalidateQueries({ queryKey: ["admin"] });
  }

  return (
    <ViewShell title="댓글" subtitle="최근 작성된 댓글 · 최대 100건">
      <Panel>
        {comments.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">불러오는 중...</p>
        ) : (comments.data?.length ?? 0) === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">작성된 댓글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-border">
            {comments.data?.map((c) => (
              <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{c.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">@{sellerHandle(c.user_id)}</span>
                    <span className="mx-1.5">·</span>
                    {timeAgo(c.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => deleteComment(c.id)}
                  aria-label="댓글 삭제"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </ViewShell>
  );
}

/* ============================= UI primitives ============================= */

function ViewShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      {title && (
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 first:mt-0">
      {title && (
        <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {title}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[#f0f0f2] text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </button>
  );
}