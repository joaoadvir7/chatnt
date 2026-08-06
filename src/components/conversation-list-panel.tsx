"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { getConversations } from "@/lib/data/conversations";

type Conversation = Awaited<ReturnType<typeof getConversations>>[number];

export function ConversationListPanel({ conversations }: { conversations: Conversation[] }) {
  const pathname = usePathname();
  const [tab, setTab] = useState<"OPEN" | "RESOLVED">("OPEN");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      OPEN: conversations.filter((c) => c.status === "OPEN").length,
      RESOLVED: conversations.filter((c) => c.status === "RESOLVED").length,
    }),
    [conversations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (c.status !== tab) return false;
      if (!q) return true;
      return (
        c.contact.name.toLowerCase().includes(q) || c.contact.phone.toLowerCase().includes(q)
      );
    });
  }, [conversations, tab, search]);

  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-black/10">
      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => setTab("OPEN")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "OPEN"
              ? "bg-brand-green text-white"
              : "bg-black/5 text-foreground/60 hover:bg-black/10"
          }`}
        >
          Abertas ({counts.OPEN})
        </button>
        <button
          onClick={() => setTab("RESOLVED")}
          className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "RESOLVED"
              ? "bg-brand-green text-white"
              : "bg-black/5 text-foreground/60 hover:bg-black/10"
          }`}
        >
          Finalizadas ({counts.RESOLVED})
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="w-full rounded-full border border-black/10 bg-black/[.02] py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-green"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-foreground/50">
            Nenhuma conversa aqui.
          </p>
        )}
        {filtered.map((conv) => {
          const lastMessage = conv.messages[0];
          const isSelected = pathname === `/conversas/${conv.id}`;
          return (
            <Link
              key={conv.id}
              href={`/conversas/${conv.id}`}
              className={`flex items-start gap-3 border-b border-black/5 px-3 py-3 transition-colors ${
                isSelected ? "bg-brand-green/10" : "hover:bg-black/[.02]"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-bg text-sm font-semibold text-white">
                {conv.contact.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{conv.contact.name}</span>
                  {conv.lastMessageAt && (
                    <span className="shrink-0 text-[11px] text-foreground/40">
                      {formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-foreground/50">{conv.contact.phone}</p>
                <p className="mt-0.5 truncate text-xs text-foreground/60">
                  {lastMessage
                    ? `${lastMessage.direction === "OUTBOUND" ? "Você: " : ""}${lastMessage.content}`
                    : "Sem mensagens ainda"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
