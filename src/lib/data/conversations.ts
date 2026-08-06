import { prisma } from "@/lib/prisma";

export async function getConversations() {
  return prisma.conversation.findMany({
    include: {
      contact: { include: { tags: { include: { tag: true } } } },
      connection: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      contact: {
        include: {
          tags: { include: { tag: true } },
          customFieldValues: { include: { customField: true } },
          notes: { orderBy: { createdAt: "desc" } },
        },
      },
      connection: { select: { id: true, name: true, phoneNumber: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}
