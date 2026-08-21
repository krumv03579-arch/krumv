import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { TrendIcon } from "@/components/home/live-chart";
import { Panel, PanelHeader } from "@/components/panel";
import { PostRow } from "@/components/post-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compact, comma } from "@/lib/format";
import {
  artistByKey,
  chart,
  fanRooms,
  postsByArtist,
  schedule,
  type ArtistKey,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/artists/$artistId")({
  head: ({ params }) => {
    const artist = artistByKey[params.artistId as ArtistKey];
    return {
      meta: [
        {
          title: artist ? `${artist.name} — deluxla` : "아티스트 — deluxla",
        },
        {
          name: "description",
          content: artist?.bio ?? "딜렉스타 아티스트 페이지",
        },
      ],
    };
  },
  component: ArtistPage,
});

function ArtistPage() {
  const { artistId } = Route.useParams();
  const artist = artistByKey[artistId as ArtistKey];
  const [following, setFollowing] = useState(false);

  if (!artist) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
          아티스트를 찾을 수 없어요
        </h1>
        <Link
          to="/artists"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          아티스트 목록 보기
        </Link>
      </main>
    );
  }

  const artistPosts = postsByArtist(artist.key);
  const discography = chart.filter((entry) => entry.artist === artist.key);
  const upcoming = schedule.filter((item) => item.artist === artist.key);
  const room = fanRooms.find((item) => item.artist === artist.key);

  const stats = [
    { label: "팔로워", value: compact(artist.followers) },
    { label: "오늘 글", value: comma(artist.todayPosts) },
    { label: "데뷔", value: artist.debut },
    { label: "소속사", value: artist.agency },
  ];

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-4 pt-6 sm:px-6">
      <Link
        to="/artists"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        아티스트 목록
      </Link>

      <Panel className="mt-4 overflow-hidden">
        <div className="relative h-40 sm:h-56">
          <img
            src={artist.cover}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>

        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-wrap items-end gap-5">
            <img
              src={artist.image}
              alt={artist.name}
              className="h-28 w-28 rounded-3xl object-cover ring-4 ring-card"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-[28px] font-black leading-tight tracking-[-0.03em]">
                {artist.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {artist.nameKo} · {artist.type} · 팬덤 {artist.fandom}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFollowing((prev) => !prev);
                toast.success(
                  following
                    ? "팔로우를 해제했어요."
                    : `${artist.name} 팔로우 완료!`,
                );
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-colors",
                following
                  ? "bg-secondary text-foreground hover:bg-secondary/70"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {following ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {following ? "팔로잉" : "팔로우"}
            </button>
          </div>

          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-foreground/85">
            {artist.bio}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-secondary/60 px-4 py-3"
              >
                <dt className="text-[11.5px] font-semibold text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[15px] font-extrabold tracking-[-0.01em]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Panel>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">팬 이야기</TabsTrigger>
            <TabsTrigger value="discography">디스코그래피</TabsTrigger>
            <TabsTrigger value="about">소개</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-5">
            <Panel className="px-5 py-1 sm:px-6">
              {artistPosts.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
              {artistPosts.length === 0 && (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  아직 올라온 이야기가 없어요.
                </p>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="discography" className="mt-5">
            <Panel className="p-5 sm:p-6">
              <PanelHeader eyebrow="Discography" title="차트에 오른 곡" />
              <ul className="mt-4 divide-y divide-border/70">
                {discography.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.title}`}
                    className="flex items-center gap-4 py-3"
                  >
                    <img
                      src={entry.cover}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold">
                        {entry.title}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                        {entry.album} · {entry.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-black tabular-nums">
                        {entry.rank}위
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                        최고 {entry.peak}위
                      </p>
                    </div>
                    <TrendIcon trend={entry.trend} />
                  </li>
                ))}
                {discography.length === 0 && (
                  <li className="py-16 text-center text-sm text-muted-foreground">
                    아직 차트에 오른 곡이 없어요.
                  </li>
                )}
              </ul>
            </Panel>
          </TabsContent>

          <TabsContent value="about" className="mt-5">
            <Panel className="p-5 sm:p-6">
              <PanelHeader eyebrow="Profile" title="아티스트 소개" />
              <p className="mt-4 text-[15px] leading-[1.85] text-foreground/85">
                {artist.bio}
              </p>

              <p className="eyebrow mt-6 text-muted-foreground">멤버</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {artist.members.map((member) => (
                  <span
                    key={member}
                    className="rounded-full bg-secondary px-3.5 py-2 text-[13px] font-bold"
                  >
                    {member}
                  </span>
                ))}
              </div>

              <p className="eyebrow mt-6 text-muted-foreground">키워드</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {artist.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-3.5 py-2 text-[13px] font-bold"
                    style={{
                      backgroundColor: `${artist.accent}14`,
                      color: artist.accent,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Panel>
          </TabsContent>
        </Tabs>

        <aside className="flex flex-col gap-5">
          {room && (
            <Panel className="overflow-hidden">
              <img
                src={room.cover}
                alt=""
                className="h-28 w-full object-cover"
              />
              <div className="p-5">
                <p className="eyebrow text-muted-foreground">Fan room</p>
                <p className="mt-2 text-[17px] font-extrabold tracking-[-0.02em]">
                  {room.name}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {room.description}
                </p>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  멤버 {compact(room.members)} · 지금 접속{" "}
                  {comma(room.onlineNow)}
                </p>
                <Link
                  to="/fanclub"
                  className="mt-4 flex items-center justify-center rounded-full bg-primary py-2.5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  팬룸 입장하기
                </Link>
              </div>
            </Panel>
          )}

          <Panel className="p-5">
            <PanelHeader eyebrow="Schedule" title="다가오는 일정" />
            <ul className="mt-4 space-y-3">
              {upcoming.map((item) => (
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
              {upcoming.length === 0 && (
                <li className="py-6 text-center text-[13px] text-muted-foreground">
                  예정된 일정이 없어요.
                </li>
              )}
            </ul>
          </Panel>
        </aside>
      </div>
    </main>
  );
}
