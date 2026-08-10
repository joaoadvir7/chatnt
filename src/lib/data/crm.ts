import { prisma } from "@/lib/prisma";

export async function getPipelines() {
  return prisma.pipeline.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function getPipelineBoard(id: string) {
  return prisma.pipeline.findUnique({
    where: { id },
    include: {
      stages: {
        orderBy: { position: "asc" },
        include: {
          deals: {
            orderBy: { updatedAt: "desc" },
            include: { contact: { include: { tags: { include: { tag: true } } } }, attendant: true },
          },
        },
      },
    },
  });
}

export async function getContactsForDeals() {
  return prisma.contact.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, phone: true } });
}
