import { getConversations } from "@/lib/data/conversations";
import { ConversationListPanel } from "@/components/conversation-list-panel";

export default async function ConversasLayout({ children }: LayoutProps<"/conversas">) {
  const conversations = await getConversations();

  return (
    <div className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-sm">
      <ConversationListPanel conversations={conversations} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
