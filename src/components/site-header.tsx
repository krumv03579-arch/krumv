import { Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { AvatarBadge } from "@/components/avatar-badge";
import { BrandLogo } from "@/components/brand";
import { useSearchDialog } from "@/components/search-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "홈", exact: true },
  { to: "/feed", label: "피드", exact: false },
  { to: "/artists", label: "아티스트", exact: false },
  { to: "/chart", label: "뮤직차트", exact: false },
  { to: "/fanclub", label: "팬클럽", exact: false },
] as const;

const NOTIFICATIONS = [
  {
    id: "n1",
    title: "LUMI ‘Afterglow’ 티저가 공개됐어요",
    meta: "루미너스 팬룸 · 12분 전",
  },
  {
    id: "n2",
    title: "내 글에 새 댓글 24개가 달렸습니다",
    meta: "커뮤니티 · 38분 전",
  },
  {
    id: "n3",
    title: "SUMMER WAVE 2026 선예매가 곧 시작돼요",
    meta: "일정 알림 · 2시간 전",
  },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: openSearch } = useSearchDialog();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1460px] items-center gap-6 px-4 sm:px-6">
        <BrandLogo />

        <nav className="hidden h-full items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={item.exact ? { exact: true } : undefined}
              activeProps={{
                className: "text-foreground after:scale-x-100",
              }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className={cn(
                "relative flex h-full items-center px-3.5 text-[15px] font-bold transition-colors hover:text-foreground",
                "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-center after:scale-x-0 after:rounded-t-full after:bg-foreground after:transition-transform",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={openSearch}
            className="hidden h-11 w-[280px] items-center gap-2.5 rounded-full bg-secondary px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/70 lg:flex xl:w-[340px]"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">관심 있는 이야기를 찾아보세요</span>
          </button>
          <button
            type="button"
            onClick={openSearch}
            aria-label="검색"
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="알림"
                className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
              <DropdownMenuLabel className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                알림
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NOTIFICATIONS.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex-col items-start gap-1 rounded-xl px-3 py-2.5"
                >
                  <span className="text-[13px] font-semibold leading-snug text-foreground">
                    {notification.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {notification.meta}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <Link
              to="/me"
              aria-label="마이페이지"
              className="hidden h-10 items-center gap-2 rounded-full bg-secondary pl-1.5 pr-3.5 text-sm font-bold transition-colors hover:bg-secondary/70 sm:inline-flex"
            >
              <AvatarBadge name={user.nickname} size="sm" />
              <span className="max-w-[110px] truncate">{user.nickname}</span>
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/signup"
                className="h-10 items-center rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
              >
                회원가입
              </Link>
              <Link
                to="/login"
                className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                로그인
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label="메뉴"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/70 bg-background md:hidden">
          <nav className="mx-auto grid max-w-[1460px] gap-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.exact ? { exact: true } : undefined}
                onClick={() => setMobileOpen(false)}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-xl px-3 py-2.5 text-[15px] font-bold text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <Link
                to="/me"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center gap-2.5 rounded-xl bg-secondary px-3 py-2.5"
              >
                <AvatarBadge name={user.nickname} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold">
                    {user.nickname}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">
                    마이페이지 · 내 활동 보기
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-xl bg-primary px-3 py-2.5 text-center text-[15px] font-bold text-primary-foreground"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-border px-3 py-2.5 text-center text-[15px] font-bold"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
