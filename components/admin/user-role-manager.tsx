import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, UserPlus, X } from "lucide-react";

interface Row {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

export function UserRoleManager() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  async function setRole(targetEmail: string, grant: boolean) {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.rpc("admin_set_role", {
      _email: targetEmail,
      _role: "admin",
      _grant: grant,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setEmail("");
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  return (
    <div className="p-4 space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) setRole(email.trim(), true);
        }}
        className="flex flex-wrap gap-2"
      >
        <Input
          type="email"
          placeholder="관리자로 지정할 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-[220px]"
        />
        <Button type="submit" disabled={busy}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          관리자 지정
        </Button>
      </form>
      {err && <p className="text-xs text-destructive">{err}</p>}

      {users.isLoading ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">이메일</th>
                <th className="px-3 py-2 text-left font-semibold">역할</th>
                <th className="px-3 py-2 text-left font-semibold">최근 로그인</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((u) => {
                const isAdmin = u.roles.includes("admin");
                return (
                  <tr key={u.user_id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{u.email}</td>
                    <td className="px-3 py-2">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-pitch/10 px-2 py-0.5 text-xs font-semibold text-pitch">
                          <ShieldCheck className="h-3 w-3" /> admin
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">user</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("ko-KR") : "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => setRole(u.email, false)}
                          disabled={busy}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3 w-3" /> 해제
                        </button>
                      ) : (
                        <button
                          onClick={() => setRole(u.email, true)}
                          disabled={busy}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-pitch hover:bg-pitch/10"
                        >
                          <ShieldCheck className="h-3 w-3" /> 관리자 지정
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}