import { prisma } from "@/lib/prisma";

export async function getAutomationFolders() {
  return prisma.automationFolder.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { automations: true } } },
  });
}

export async function getAutomations(params: { folderId?: string; q?: string }) {
  const { folderId, q } = params;
  return prisma.automation.findMany({
    where: {
      AND: [
        folderId ? { folderId } : {},
        q ? { name: { contains: q, mode: "insensitive" } } : {},
      ],
    },
    include: { folder: true, _count: { select: { runs: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAutomationById(id: string) {
  return prisma.automation.findUnique({
    where: { id },
    include: {
      folder: true,
      nodes: true,
      edges: true,
    },
  });
}
