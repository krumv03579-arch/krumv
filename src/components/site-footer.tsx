import { Link } from "@tanstack/react-router";

import { BrandWordmark } from "@/components/brand";
import { LEGAL_DOCUMENTS } from "@/lib/legal";

const COLUMNS = [
  {
    title: "둘러보기",
    links: [
      { label: "피드", to: "/feed" },
      { label: "아티스트", to: "/artists" },
      { label: "뮤직차트", to: "/chart" },
      { label: "팬클럽", to: "/fanclub" },
    ],
  },
  {
    title: "커뮤니티",
    links: [
      { label: "글쓰기", to: "/feed" },
      { label: "인기 이야기", to: "/feed" },
      { label: "이번 주 룸", to: "/fanclub" },
      { label: "로그인", to: "/login" },
      { label: "회원가입", to: "/signup" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-card">
      <div className="mx-auto grid max-w-[1460px] grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <BrandWordmark className="h-[22px]" />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            좋아하는 아티스트의 오늘을 함께 기록하는 곳. 팬들이 쓴 이야기와
            실시간 차트를 한 화면에서 만나보세요.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="eyebrow text-muted-foreground">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-[1460px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>© 2026 deluxla</span>
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {LEGAL_DOCUMENTS.map((doc, index) => (
              <span key={doc.to} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden>·</span>}
                <Link
                  to={doc.to}
                  className="transition-colors hover:text-foreground"
                >
                  {doc.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
