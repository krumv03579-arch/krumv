import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Menu, X, Pencil } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import deluxlaLogo from "@/assets/deluxla-logo.png.asset.json";

const NAV = [
  { to: "/community", label: "커뮤니티" },
  { to: "/market", label: "마켓" },
  { to: "/store", label: "스토어" },
] as const;

const EXTERNAL_NAV = [
  { href: "https://www.youtube.com", label: "유튜브" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentHref = useRouterState({ select: (s) => s.location.href });
  if (pathname.startsWith("/admin")) return null;

  const authSearch =
    currentHref && currentHref !== "/" && !currentHref.startsWith("/auth")
      ? { redirect: currentHref }
      : undefined;

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      {/* Row 1: brand centered, utilities floating on the right */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 pt-5 pb-3 sm:pt-7 sm:pb-4">
        <Link to="/" className="flex items-center" aria-label="딜렉스타 홈">
          <img
            src={deluxlaLogo.url}
            alt="딜렉스타"
            className="h-10 w-auto sm:h-14 md:h-16"
          />
        </Link>
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 sm:right-4 sm:gap-2">
          <button
            aria-label="검색"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:bg-secondary"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/sell"
            aria-label="상품 등록"
            className="hidden h-9 w-9 place-items-center rounded-full text-foreground/70 hover:bg-secondary sm:grid"
          >
            <Pencil className="h-5 w-5" />
          </Link>
          {user ? (
            <button
              onClick={signOut}
              className="hidden h-9 rounded-full border border-border bg-background px-3.5 text-sm font-semibold text-foreground hover:bg-secondary sm:inline-flex sm:items-center"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/auth"
              search={authSearch}
              className="hidden h-9 rounded-full border border-border bg-background px-3.5 text-sm font-semibold text-foreground hover:bg-secondary sm:inline-flex sm:items-center"
            >
              로그인
            </Link>
          )}
          <button
            aria-label="메뉴"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:bg-secondary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Row 2: primary navigation, centered */}
      <nav className="mx-auto hidden max-w-7xl items-center justify-center gap-2 px-4 pb-3 md:flex">
        {NAV.map((n) => (
          <Link
            key={n.label}
            to={n.to}
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground after:scale-x-100" }}
            className="relative rounded-md px-4 py-2 text-[15px] font-semibold text-foreground/70 transition-colors hover:text-foreground after:absolute after:inset-x-4 after:-bottom-0.5 after:h-[2px] after:origin-center after:scale-x-0 after:bg-foreground after:transition-transform hover:after:scale-x-100"
          >
            {n.label}
          </Link>
        ))}
        {EXTERNAL_NAV.map((n) => (
          <a
            key={n.label}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative rounded-md px-4 py-2 text-[15px] font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            {n.label}
          </a>
        ))}
      </nav>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-3 py-2">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            {EXTERNAL_NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary"
              >
                {n.label}
              </a>
            ))}
            <Link to="/sell" onClick={() => setOpen(false)} className="col-span-2 mt-1 rounded-md border border-pitch bg-pitch px-3 py-2 text-center text-sm font-semibold text-white">
              상품 등록
            </Link>
            {user ? (
              <button onClick={() => { setOpen(false); void signOut(); }} className="col-span-2 mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold">
                로그아웃
              </button>
            ) : (
              <Link to="/auth" search={authSearch} onClick={() => setOpen(false)} className="col-span-2 mt-1 rounded-md border border-border bg-background px-3 py-2 text-center text-sm font-semibold">
                로그인
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}