import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** White card shell that every home/feed module sits in. */
export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  eyebrow,
  eyebrowClassName,
  title,
  moreTo,
  moreLabel = "전체 보기",
  action,
  className,
}: {
  eyebrow: string;
  eyebrowClassName?: string;
  title: string;
  moreTo?: string;
  moreLabel?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <p className={cn("eyebrow text-muted-foreground", eyebrowClassName)}>
          {eyebrow}
        </p>
        <h2 className="mt-2 text-[22px] font-extrabold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
      </div>
      {action ??
        (moreTo ? (
          <Link
            to={moreTo}
            className="inline-flex shrink-0 items-center gap-1 pt-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {moreLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null)}
    </div>
  );
}
