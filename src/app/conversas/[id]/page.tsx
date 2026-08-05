import { notFound } from "next/navigation";
import Link from "next/link";
import { getConversationById } from "@/lib/data/conversations";
import { markConversationResolved, reopenConversation } from "@/lib/actions/conversations";
import { MessageComposer } from "@/components/message-composer";

export default async function ConversaPage({ params }: PageProps<"/conversas/[id]">) {
  const { id } = await params;
  const conversation = await getConversationById(id);
  if (!conversation) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/15">
        <div>
          <h1 className="text-xl font-semibold">{conversation.contact.name}</h1>
          <p className="text-sm text-foreground/60">{conversation.contact.phone}</p>
          <div className="mt-1 flex flex-wrap gap-1">
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
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/contatos/${conversation.contact.id}`} className="text-sm text-foreground/70 hover:underline">
            Ver contato
          </Link>
          {conversation.status === "OPEN" ? (
            <form action={markConversationResolved}>
              <input type="hidden" name="id" value={conversation.id} />
              <button
                type="submit"
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
              >
                Marcar como resolvida
              </button>
            </form>
          ) : (
            <form action={reopenConversation}>
              <input type="hidden" name="id" value={conversation.id} />
              <button
                type="submit"
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
              >
                Reabrir
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 py-2">
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
              className={`max-w-sm rounded-lg px-3 py-2 text-sm ${
                msg.direction === "OUTBOUND"
                  ? "bg-foreground text-background"
                  : "bg-black/[.05] dark:bg-white/[.08]"
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

      <MessageComposer conversationId={conversation.id} />
    </div>
  );
}
