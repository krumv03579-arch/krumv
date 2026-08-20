import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Shared page intro: eyebrow, big title, supporting line and optional action. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <p className="eyebrow text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-[30px] font-black leading-tight tracking-[-0.03em] sm:text-[36px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
