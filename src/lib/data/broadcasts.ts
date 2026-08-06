import { prisma } from "@/lib/prisma";

export async function getBroadcasts() {
  return prisma.broadcast.findMany({
    include: {
      connection: { select: { name: true } },
      _count: { select: { recipients: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBroadcastById(id: string) {
  return prisma.broadcast.findUnique({
    where: { id },
    include: {
      connection: { select: { name: true, phoneNumber: true } },
      tags: { include: { tag: true } },
      recipients: { include: { contact: { select: { id: true, name: true, phone: true } } } },
    },
  });
}

export async function countAudienceForTags(tagIds: string[]): Promise<number> {
  if (tagIds.length === 0) return 0;

  return prisma.contact.count({
    where: {
      optedOut: false,
      tags: { some: { tagId: { in: tagIds } } },
    },
  });
}
