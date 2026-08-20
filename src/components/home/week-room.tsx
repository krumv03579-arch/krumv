import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Music4 } from "lucide-react";

import { playlists } from "@/lib/mock-data";

const playlist = playlists[1];

export function WeekRoomCard() {
  return (
    <section className="group relative h-[230px] overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
      <img
        src="/img/card-room.svg"
        alt="이번 주 팬룸 플레이리스트"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a1f]/85 via-[#0b0a1f]/25 to-transparent" />
      <Music4 className="absolute bottom-5 right-5 h-16 w-16 text-white/25" />

      <div className="relative flex h-full flex-col justify-end p-5 text-white">
        <p className="eyebrow text-white/65">This week&apos;s room</p>
        <h2 className="mt-2 max-w-[80%] text-[20px] font-extrabold leading-snug tracking-[-0.02em]">
          {playlist.title}
        </h2>
        <Link
          to="/fanclub"
          className="mt-3 inline-flex w-fit items-center gap-1.5 text-[13px] font-bold text-white/90 transition-colors hover:text-white"
        >
          룸 입장하기
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
