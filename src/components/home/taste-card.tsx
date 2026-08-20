import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function TasteCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff7a59] via-[#ff5f7e] to-[#ff4d9d] p-6 text-white shadow-[var(--shadow-card)]">
      <span className="pointer-events-none absolute -right-12 -top-10 h-36 w-36 rounded-full bg-white/15" />

      <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
        <Sparkles className="h-6 w-6" />
      </div>

      <p className="eyebrow relative mt-5 text-white/75">For Your Taste</p>
      <h2 className="relative mt-2 text-[22px] font-extrabold leading-[1.25] tracking-[-0.02em]">
        당신을 위한
        <br />
        새로운 팬룸
      </h2>

      <Link
        to="/fanclub"
        className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-[#ff4d6d] transition-transform hover:-translate-y-0.5"
      >
        내 취향 설정하기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
