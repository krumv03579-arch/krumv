import { Link } from "@tanstack/react-router";

export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-3xl">
          {icon}
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-pitch/10 px-3 py-1 text-xs font-bold text-pitch">
            준비중
          </span>
          <Link
            to="/"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            마켓 둘러보기
          </Link>
        </div>
      </div>
    </section>
  );
}