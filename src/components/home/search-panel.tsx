import { Search } from "lucide-react";

import { useSearchDialog } from "@/components/search-dialog";
import { Panel } from "@/components/panel";

export function SearchPanel() {
  const { open } = useSearchDialog();

  return (
    <Panel className="p-2">
      <button
        type="button"
        onClick={open}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-secondary/60"
      >
        <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
        <span className="truncate text-[15px] text-muted-foreground">
          아티스트, 앨범, 팬 이야기를 검색해 보세요
        </span>
        <kbd className="ml-auto hidden shrink-0 rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-semibold text-muted-foreground sm:inline-block">
          ⌘ K
        </kbd>
      </button>
    </Panel>
  );
}
