import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Radio, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Panel, PanelHeader } from "@/components/panel";
import { compact, comma } from "@/lib/format";
import { artistByKey, fanRooms, schedule } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fanclub")({
  head: () => ({
    meta: [
      { title: "팬클럽 — pulseroom" },
      {
        name: "description",
        content: "취향이 맞는 팬룸에 들어가 함께 이야기해요.",
      },
    ],
  }),
  component: FanclubPage,
});

function FanclubPage() {
  const [joined, setJoined] = useState<string[]>(["luminous-night"]);

  function toggle(id: string, name: string) {
    setJoined((prev) => {
      const isJoined = prev.includes(id);
      toast.success(
        isJoined ? `${name}에서 나왔어요.` : `${name}에 입장했어요!`,
      );
      return isJoined ? prev.filter((item) => item !== id) : [...prev, id];
    });
  }

  return (
    <main className="mx-auto w-full max-w-[1460px] px-4 pb-4 pt-8 sm:px-6">
      <PageHeader
        eyebrow="Fan rooms"
        title="팬클럽"
        description="아티스트별로 열려 있는 팬룸이에요. 입장하면 룸 전용 피드와 일정 알림을 받아볼 수 있어요."
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-[13px] font-bold text-muted-foreground">
            <Users className="h-4 w-4" />내 팬룸 {joined.length}개
          </span>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {fanRooms.map((room) => {
            const artist = artistByKey[room.artist];
            const isJoined = joined.includes(room.id);
            return (
              <article
                key={room.id}
                className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)]"
              >
                <div className="relative h-32">
                  <img
                    src={room.cover}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a1f]/70 to-transparent" />
                  {room.live && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-extrabold text-white">
                      <Radio className="h-3 w-3" />
                      LIVE
                    </span>
                  )}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <img
                      src={artist.image}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70"
                    />
                    <span className="text-[13px] font-bold text-white">
                      {artist.name}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
                    {room.name}
                  </h2>
                  <p className="mt-2 line-clamp-2-safe text-[13px] leading-relaxed text-muted-foreground">
                    {room.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
                    <span className="text-[12px] text-muted-foreground">
                      멤버{" "}
                      <b className="font-bold text-foreground">
                        {compact(room.members)}
                      </b>{" "}
                      · 접속{" "}
                      <b className="font-bold text-foreground">
                        {comma(room.onlineNow)}
                      </b>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(room.id, room.name)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
                        isJoined
                          ? "bg-secondary text-foreground hover:bg-secondary/70"
                          : "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {isJoined && <Check className="h-3.5 w-3.5" />}
                      {isJoined ? "입장 중" : "입장하기"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="flex flex-col gap-5">
          <Panel className="p-5">
            <PanelHeader eyebrow="Room ranking" title="이번 주 인기 팬룸" />
            <ol className="mt-4 space-y-1">
              {[...fanRooms]
                .sort((a, b) => b.onlineNow - a.onlineNow)
                .slice(0, 5)
                .map((room, index) => (
                  <li
                    key={room.id}
                    className="flex items-center gap-3 rounded-xl px-1.5 py-2 transition-colors hover:bg-secondary/60"
                  >
                    <span className="w-4 text-center text-[13px] font-black tabular-nums text-primary">
                      {index + 1}
                    </span>
                    <img
                      src={room.cover}
                      alt=""
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold">
                        {room.name}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">
                        지금 접속 {comma(room.onlineNow)}
                      </span>
                    </span>
                  </li>
                ))}
            </ol>
          </Panel>

          <Panel className="p-5">
            <PanelHeader eyebrow="Room schedule" title="룸 전용 일정" />
            <ul className="mt-4 space-y-3">
              {schedule.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-center leading-none">
                    <span className="block text-[12.5px] font-black tabular-nums">
                      {item.date}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {item.weekday}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold">
                      {item.title}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {item.place}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/chart"
              className="mt-4 flex items-center justify-center rounded-xl border border-border/70 py-2.5 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              차트에서 최신 곡 듣기
            </Link>
          </Panel>
        </aside>
      </div>
    </main>
  );
}
