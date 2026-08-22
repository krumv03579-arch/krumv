import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Globe,
  LogIn,
  Menu,
  ReceiptText,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { AvatarBadge } from "@/components/avatar-badge";
import { BrandLogo } from "@/components/brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { announcements } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/store", label: "스토어" },
  { to: "/service", label: "서비스" },
  { to: "/warehouse", label: "웨어하우스" },
] as const;

const UTILITY = [
  { to: "/service", label: "가격", icon: Tag },
  { to: "/warehouse", label: "배송비", icon: ReceiptText },
] as const;

const LANGUAGES = [
  { code: "KO", label: "한국어" },
  { code: "EN", label: "English" },
  { code: "JA", label: "日本語" },
] as const;

/**
 * Utility bar — thin gray strip above the main nav carrying the price/shipping
 * shortcuts, the rolling promo pill and the account actions.
 */
function UtilityBar() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>("KO");

  return (
    <div className="border-b border-border/60 bg-secondary/60">
      <div className="mx-auto flex h-[52px] max-w-[1460px] items-center gap-4 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-4">
          {UTILITY.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Rolling announcement — center on wide screens, hidden when cramped. */}
        <Link
          to="/support"
          className="mx-auto hidden h-8 max-w-[420px] items-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 lg:flex"
        >
          <span className="flex shrink-0 animate-[marquee_22s_linear_infinite] whitespace-nowrap text-[12.5px] font-semibold text-emerald-800">
            {[...announcements, ...announcements].map((text, index) => (
              <span key={index} className="px-5">
                {text}
              </span>
            ))}
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                {language}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl p-1.5">
              {LANGUAGES.map((option) => (
                <DropdownMenuItem
                  key={option.code}
                  onSelect={() => setLanguage(option.code)}
                  className="rounded-lg text-[13px] font-semibold"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <Link
              to="/me"
              className="flex h-9 items-center gap-2 rounded-full bg-background px-2.5 text-[13px] font-bold shadow-sm transition-opacity hover:opacity-80"
            >
              <AvatarBadge name={user.nickname} size="sm" />
              <span className="hidden max-w-[110px] truncate sm:block">
                {user.nickname}
              </span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
              >
                <LogIn className="h-4 w-4" />
                로그인
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl">
      <UtilityBar />

      <div className="border-b border-border/70">
        <div className="relative mx-auto flex h-[72px] max-w-[1460px] items-center px-4 sm:px-6">
          <BrandLogo />

          {/* Primary nav sits centered between the logo and support link. */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-foreground/80" }}
                className="text-[15px] font-bold transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/support"
              className="hidden text-[15px] font-bold text-foreground/80 transition-colors hover:text-primary md:block"
            >
              고객지원
            </Link>

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
      </div>

      {mobileOpen && (
        <div className="border-b border-border/70 bg-background md:hidden">
          <nav className="mx-auto grid max-w-[1460px] gap-1 px-4 py-3">
            {[...NAV, { to: "/support", label: "고객지원" } as const].map(
              (item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-[15px] font-bold text-foreground/80",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
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
                    마이페이지 · 주문 내역 보기
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-xl border border-border px-3 py-2.5 text-center text-[15px] font-bold"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-primary px-3 py-2.5 text-center text-[15px] font-bold text-primary-foreground"
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
