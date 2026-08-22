import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { serviceCards } from "@/lib/shop-data";

const [instant, manual, warehouse] = serviceCards;

/** The three service tiles that sit beside the hero banner. */
export function ServiceCards() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {[instant, manual].map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="flex min-h-[220px] flex-col rounded-2xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)] lg:min-h-[400px]"
          >
            <span className="flex items-center gap-1 text-[19px] font-extrabold tracking-[-0.01em]">
              {card.title}
              <ChevronRight className="h-4.5 w-4.5" />
            </span>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
              {card.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <img
              src={card.image}
              alt=""
              className="mt-auto h-[86px] w-[86px] self-end rounded-xl object-cover"
            />
          </Link>
        ))}
      </div>

      <Link
        to={warehouse.to}
        className="flex items-center gap-5 rounded-2xl border border-border/70 bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)]"
      >
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[19px] font-extrabold tracking-[-0.01em]">
            {warehouse.title}
            <ChevronRight className="h-4.5 w-4.5" />
          </span>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            {warehouse.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        <img
          src={warehouse.image}
          alt=""
          className="h-[76px] w-[76px] shrink-0 rounded-xl object-cover"
        />
      </Link>
    </div>
  );
}
