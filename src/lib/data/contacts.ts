import { prisma } from "@/lib/prisma";

export async function getContacts(params: { q?: string; tagId?: string }) {
  const { q, tagId } = params;

  return prisma.contact.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { phone: { contains: q } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        tagId ? { tags: { some: { tagId } } } : {},
      ],
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContactById(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      customFieldValues: { include: { customField: true } },
    },
  });
}
