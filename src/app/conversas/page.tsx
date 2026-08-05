import Link from "next/link";
import { getConversations } from "@/lib/data/conversations";

export default async function ConversasPage() {
  const conversations = await getConversations();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Conversas</h1>

      {conversations.length === 0 && (
        <div className="rounded-lg border border-black/10 px-4 py-10 text-center text-sm text-foreground/60 dark:border-white/15">
          Nenhuma conversa ainda. Inicie uma pela página de um contato.
        </div>
      )}

      <ul className="flex flex-col divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/15">
        {conversations.map((conv) => {
          const lastMessage = conv.messages[0];
          return (
            <li key={conv.id}>
              <Link
                href={`/conversas/${conv.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-black/[.02] dark:hover:bg-white/[.04]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{conv.contact.name}</span>
                    <span className="text-xs text-foreground/50">{conv.contact.phone}</span>
                    {conv.status === "RESOLVED" && (
                      <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs text-foreground/60 dark:bg-white/10">
                        Finalizada
                      </span>
                    )}
                  </div>
                  <p className="max-w-md truncate text-sm text-foreground/60">
                    {lastMessage
                      ? `${lastMessage.direction === "OUTBOUND" ? "Você: " : ""}${lastMessage.content}`
                      : "Sem mensagens ainda"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {conv.contact.tags.map(({ tag }) => (
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
                <span className="whitespace-nowrap text-xs text-foreground/50">
                  {conv.lastMessageAt
                    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                        conv.lastMessageAt,
                      )
                    : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
