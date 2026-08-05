import { prisma } from "@/lib/prisma";

export async function getCustomFields() {
  return prisma.customField.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { values: true } } },
  });
}
