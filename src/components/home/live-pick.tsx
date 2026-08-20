import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

export function LivePickCard() {
  return (
    <section className="group relative h-[300px] overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
      <img
        src="/img/card-festival.svg"
        alt="여름 페스티벌 무대"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a1f]/90 via-[#0b0a1f]/35 to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-5 text-white">
        <p className="eyebrow text-white/65">Live Pick</p>
        <h2 className="mt-2 text-[24px] font-black leading-[1.15] tracking-[-0.02em]">
          SUMMER WAVE 2026
          <br />
          티켓 오픈
        </h2>
        <p className="mt-2 text-[12.5px] text-white/70">
          8월 27일 20:00 · 팬룸 선예매 코드 배포
        </p>
        <Link
          to="/fanclub"
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-4 py-2.5 text-[13px] font-bold text-[#0b0a1f] transition-transform hover:-translate-y-0.5"
        >
          <Bell className="h-3.5 w-3.5" />
          티켓 알림 받기
        </Link>
      </div>
    </section>
  );
}
