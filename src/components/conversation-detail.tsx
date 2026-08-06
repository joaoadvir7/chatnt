"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, RotateCcw, UserRound } from "lucide-react";
import { markConversationResolved, reopenConversation } from "@/lib/actions/conversations";
import { MessageComposer } from "@/components/message-composer";
import { ContactInfoPanel } from "@/components/contact-info-panel";
import type { getConversationById } from "@/lib/data/conversations";

type Conversation = NonNullable<Awaited<ReturnType<typeof getConversationById>>>;

export function ConversationDetail({ conversation }: { conversation: Conversation }) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="flex h-full">
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-black/[.03]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-bg text-sm font-semibold text-white">
              {conversation.contact.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold">{conversation.contact.name}</h1>
                <span className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] text-foreground/60">
                  {conversation.status === "OPEN" ? "Aberta" : "Finalizada"}
                </span>
              </div>
              <p className="text-xs text-foreground/50">{conversation.contact.phone}</p>
            </div>
          </button>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/contatos/${conversation.contact.id}`}
              title="Ver contato"
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 hover:bg-black/5"
            >
              <UserRound size={18} />
            </Link>
            {conversation.status === "OPEN" ? (
              <form action={markConversationResolved}>
                <input type="hidden" name="id" value={conversation.id} />
                <button
                  type="submit"
                  title="Marcar como resolvida"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 hover:bg-black/5"
                >
                  <CircleCheck size={18} />
                </button>
              </form>
            ) : (
              <form action={reopenConversation}>
                <input type="hidden" name="id" value={conversation.id} />
                <button
                  type="submit"
                  title="Reabrir"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 hover:bg-black/5"
                >
                  <RotateCcw size={18} />
                </button>
              </form>
            )}
          </div>
        </div>

        {conversation.contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-black/10 px-5 py-2">
            {conversation.contact.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="chat-pattern-bg flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {conversation.messages.length === 0 && (
            <p className="py-10 text-center text-sm text-foreground/50">
              Nenhuma mensagem nessa conversa ainda.
            </p>
          )}
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm rounded-lg px-3 py-2 text-sm shadow-sm ${
                  msg.direction === "OUTBOUND"
                    ? "bg-bubble-outgoing text-bubble-outgoing-text"
                    : "bg-white text-foreground"
                }`}
              >
                <p>{msg.content}</p>
                <p className="mt-1 text-[10px] opacity-60">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                    msg.createdAt,
                  )}
                  {msg.direction === "OUTBOUND" && msg.status ? ` · ${msg.status}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-black/10 p-3">
          <MessageComposer conversationId={conversation.id} />
        </div>
      </div>

      {panelOpen && (
        <ContactInfoPanel
          contact={conversation.contact}
          conversationId={conversation.id}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
