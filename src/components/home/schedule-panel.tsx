import { Link } from "@tanstack/react-router";

import { Panel, PanelHeader } from "@/components/panel";
import { artistByKey, schedule } from "@/lib/mock-data";

export function SchedulePanel() {
  return (
    <Panel className="p-5">
      <PanelHeader eyebrow="Coming up" title="다가오는 일정" />

      <ul className="mt-4 space-y-1">
        {schedule.slice(0, 4).map((item) => {
          const artist = artistByKey[item.artist];
          return (
            <li key={item.id}>
              <Link
                to="/artists/$artistId"
                params={{ artistId: artist.key }}
                className="group flex items-center gap-3 rounded-xl px-1.5 py-2.5 transition-colors hover:bg-secondary/60"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-center leading-none">
                  <span className="block text-[12.5px] font-black tabular-nums text-foreground">
                    {item.date}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-muted-foreground">
                    {item.weekday}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">
                    {item.place}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-1 text-[10.5px] font-extrabold"
                  style={{
                    backgroundColor: `${artist.accent}14`,
                    color: artist.accent,
                  }}
                >
                  {item.type}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
