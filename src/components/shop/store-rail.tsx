import { Link } from "@tanstack/react-router";

import { StoreLogo } from "@/components/shop/store-logo";
import { featuredEvent, stores } from "@/lib/shop-data";

/**
 * Top row of the home page: the shoppable stores on the left, the running
 * event pinned to the right.
 */
export function StoreRail() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,530px)]">
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 md:grid-cols-5">
        {stores.map((store) => (
          <Link
            key={store.key}
            to="/store"
            search={{ store: store.key }}
            title={store.blurb}
            className="group w-[150px] shrink-0 sm:w-auto"
          >
            <div className="grid h-[100px] place-items-center rounded-2xl bg-secondary transition-colors group-hover:bg-secondary/70">
              <StoreLogo
                store={store.key}
                className={`h-11 ${store.logoClass}`}
              />
            </div>
            <p className="mt-2.5 truncate text-center text-[14px] font-bold">
              {store.name}
            </p>
          </Link>
        ))}
      </div>

      <Link
        to={featuredEvent.to}
        className="flex items-center gap-5 rounded-2xl border border-border/70 bg-card p-4 transition-shadow hover:shadow-[var(--shadow-card)]"
      >
        <img
          src={featuredEvent.image}
          alt=""
          className="h-[92px] w-[130px] shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-[11px] font-extrabold tracking-wide text-muted-foreground">
            {featuredEvent.badge}
          </span>
          <p className="mt-2 truncate text-[17px] font-extrabold tracking-[-0.01em]">
            {featuredEvent.title}
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {featuredEvent.date}
          </p>
        </div>
      </Link>
    </div>
  );
}
