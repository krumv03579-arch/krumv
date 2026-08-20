import { useNavigate } from "@tanstack/react-router";
import { Disc3, Music2, Users } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { artistByKey, artists, chart, posts } from "@/lib/mock-data";

type SearchContextValue = { open: () => void };

const SearchContext = createContext<SearchContextValue>({ open: () => {} });

/** `const { open } = useSearchDialog()` — wired to every search affordance. */
export function useSearchDialog() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const open = useCallback(() => setIsOpen(true), []);
  const value = useMemo(() => ({ open }), [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(to: string, params?: Record<string, string>) {
    setIsOpen(false);
    void navigate({ to, params } as never);
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl overflow-hidden rounded-2xl p-0">
          <DialogTitle className="sr-only">pulseroom 검색</DialogTitle>
          <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-extrabold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground">
            <CommandInput placeholder="아티스트, 앨범, 팬 이야기를 검색해 보세요" />
            <CommandList className="max-h-[420px]">
              <CommandEmpty>
                검색 결과가 없어요. 다른 키워드를 입력해 보세요.
              </CommandEmpty>

              <CommandGroup heading="아티스트">
                {artists.map((artist) => (
                  <CommandItem
                    key={artist.key}
                    value={`${artist.name} ${artist.nameKo} ${artist.fandom}`}
                    onSelect={() =>
                      go("/artists/$artistId", { artistId: artist.key })
                    }
                    className="gap-3 rounded-xl"
                  >
                    <img
                      src={artist.image}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="font-semibold">{artist.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {artist.nameKo} · {artist.type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="차트">
                {chart.slice(0, 6).map((entry) => (
                  <CommandItem
                    key={`${entry.rank}-${entry.title}`}
                    value={`${entry.title} ${entry.album} ${artistByKey[entry.artist].name}`}
                    onSelect={() => go("/chart")}
                    className="gap-3 rounded-xl"
                  >
                    <Music2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{entry.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {artistByKey[entry.artist].name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="커뮤니티">
                {posts.slice(0, 8).map((post) => (
                  <CommandItem
                    key={post.id}
                    value={`${post.title} ${post.category} ${artistByKey[post.artist].name}`}
                    onSelect={() => go("/feed/$postId", { postId: post.id })}
                    className="gap-3 rounded-xl"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate font-semibold">{post.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {post.category}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="바로가기">
                <CommandItem
                  value="뮤직차트 chart"
                  onSelect={() => go("/chart")}
                  className="gap-3 rounded-xl"
                >
                  <Disc3 className="h-4 w-4 text-muted-foreground" />
                  실시간 뮤직차트 전체 보기
                </CommandItem>
                <CommandItem
                  value="팬클럽 fanclub room"
                  onSelect={() => go("/fanclub")}
                  className="gap-3 rounded-xl"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  팬클럽 룸 둘러보기
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </SearchContext.Provider>
  );
}
