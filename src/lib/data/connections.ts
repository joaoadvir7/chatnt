import { prisma } from "@/lib/prisma";

const listSelect = {
  id: true,
  name: true,
  phoneNumber: true,
  wabaId: true,
  phoneNumberId: true,
  verifiedName: true,
  businessVerified: true,
  qualityRating: true,
  messagingLimit: true,
  isActive: true,
  lastValidatedAt: true,
  createdAt: true,
} as const;

export async function getConnections() {
  return prisma.whatsAppConnection.findMany({
    select: listSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getConnectionById(id: string) {
  return prisma.whatsAppConnection.findUnique({
    where: { id },
    select: listSelect,
  });
}
