import { Link, useNavigate } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useActivity } from "@/components/activity-provider";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  artists,
  postCategories,
  type ArtistKey,
  type PostCategory,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Writes a new post to Supabase and opens it once it is saved. */
export function ComposeDialog() {
  const { user } = useAuth();
  const { addPost } = useActivity();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [artist, setArtist] = useState<ArtistKey>("lumi");
  const [category, setCategory] = useState<PostCategory>("자유");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("제목을 입력해 주세요.");
      return;
    }

    setPending(true);
    const post = await addPost({
      artist,
      category,
      title: title.trim(),
      body: body.trim(),
    });
    setPending(false);
    if (!post) return;

    toast.success("글이 등록됐어요.", {
      description: "이제 다른 팬들도 이 글을 볼 수 있어요.",
    });
    setTitle("");
    setBody("");
    setOpen(false);
    void navigate({ to: "/feed/$postId", params: { postId: post.id } });
  }

  const triggerClass =
    "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90";

  // Writing needs an account; send guests to the login screen instead.
  if (!user) {
    return (
      <Link
        to="/login"
        className={triggerClass}
        onClick={() => toast("글쓰기는 로그인 후 이용할 수 있어요.")}
      >
        <PenLine className="h-4 w-4" />
        글쓰기
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={triggerClass}>
          <PenLine className="h-4 w-4" />
          글쓰기
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold tracking-[-0.02em]">
            새 이야기 쓰기
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            아티스트와 말머리를 고르고 오늘의 이야기를 남겨보세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <p className="eyebrow mb-2 text-muted-foreground">아티스트</p>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {artists.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setArtist(item.key)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors",
                    artist === item.key
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-2 text-muted-foreground">말머리</p>
            <div className="flex flex-wrap gap-2">
              {postCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors",
                    category === item
                      ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={80}
          />
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="어떤 이야기를 나누고 싶나요?"
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-full px-6 font-bold"
            >
              {pending ? "등록 중…" : "등록하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
