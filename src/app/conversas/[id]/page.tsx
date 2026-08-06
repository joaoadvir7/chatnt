import { notFound } from "next/navigation";
import { getConversationById } from "@/lib/data/conversations";
import { ConversationDetail } from "@/components/conversation-detail";

export default async function ConversaPage({ params }: PageProps<"/conversas/[id]">) {
  const { id } = await params;
  const conversation = await getConversationById(id);
  if (!conversation) notFound();

  return <ConversationDetail conversation={conversation} />;
}
