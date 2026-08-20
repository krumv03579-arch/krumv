import { Link } from "@tanstack/react-router";
import { ArrowRight, Headphones } from "lucide-react";

import { playlists } from "@/lib/mock-data";

const playlist = playlists[0];

export function PulsePickCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4f7cff] via-[#3f6bff] to-[#2f55e6] p-6 text-white shadow-[var(--shadow-card)]">
      <span className="pointer-events-none absolute -right-10 -top-8 h-40 w-40 rounded-full bg-white/15 blur-[2px]" />
      <span className="pointer-events-none absolute -bottom-14 -left-6 h-32 w-32 rounded-full bg-white/10" />

      <p className="eyebrow relative text-white/70">Pulse Pick</p>

      <div className="relative mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
        <Headphones className="h-7 w-7" />
      </div>

      <h2 className="relative mt-5 text-[22px] font-extrabold leading-[1.25] tracking-[-0.02em]">
        {playlist.title}
      </h2>
      <p className="relative mt-2 text-[13px] text-white/80">
        {playlist.subtitle}
      </p>
      <p className="relative mt-1 text-[12px] text-white/60">
        {playlist.tracks}곡 · {playlist.minutes}분
      </p>

      <Link
        to="/chart"
        className="relative mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-[#2f55e6] transition-transform hover:-translate-y-0.5"
      >
        지금 들어보기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
