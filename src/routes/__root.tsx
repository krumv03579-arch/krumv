import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ActivityProvider } from "../components/activity-provider";
import { AuthProvider } from "../components/auth-provider";
import { SearchProvider } from "../components/search-dialog";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { Toaster } from "../components/ui/sonner";

const TITLE = "deluxla — 아이돌 팬 커뮤니티";
const DESCRIPTION =
  "좋아하는 아티스트의 오늘을 함께 기록하는 곳. 실시간 인기 이야기, 팬 커뮤니티, 뮤직차트를 한 화면에서.";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-muted-foreground">404</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.02em]">
          찾으시는 페이지가 없어요
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          주소가 바뀌었거나 삭제된 글일 수 있어요. 홈에서 다시 시작해 보세요.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-extrabold tracking-[-0.02em]">
          화면을 불러오지 못했어요
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          잠시 후 다시 시도하거나 홈으로 이동해 주세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
          >
            홈으로 가기
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { name: "theme-color", content: "#ffffff" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "/img/hero-stage.svg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        { name: "twitter:image", content: "/img/hero-stage.svg" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ActivityProvider>
          <SearchProvider>
            <div className="flex min-h-screen flex-col bg-background font-sans">
              <SiteHeader />
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <div className="flex-1">
                <Outlet />
              </div>
              <SiteFooter />
            </div>
            <Toaster position="bottom-center" />
          </SearchProvider>
        </ActivityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
