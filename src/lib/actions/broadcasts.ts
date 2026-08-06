"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { broadcastQueue } from "@/lib/queue/broadcast-queue";
import { countAudienceForTags } from "@/lib/data/broadcasts";

export async function previewAudienceCount(tagIds: string[]): Promise<number> {
  return countAudienceForTags(tagIds);
}

async function createBroadcast(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const connectionId = String(formData.get("connectionId") ?? "");
  const templateValue = String(formData.get("template") ?? ""); // "name|language"
  const tagIds = formData.getAll("tagIds").map(String);

  if (!name || !connectionId || !templateValue || tagIds.length === 0) {
    redirect("/broadcasts/novo?error=Preencha nome, público-alvo (ao menos 1 tag) e template");
  }

  const [templateName, templateLanguage] = templateValue.split("|");

  const broadcast = await prisma.broadcast.create({
    data: {
      name,
      connectionId,
      templateName,
      templateLanguage,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });

  return broadcast.id;
}

export async function saveDraft(formData: FormData) {
  const id = await createBroadcast(formData);
  revalidatePath("/broadcasts");
  redirect(`/broadcasts/${id}`);
}

export async function createAndSend(formData: FormData) {
  const id = await createBroadcast(formData);
  await sendBroadcastById(id);
  revalidatePath("/broadcasts");
  redirect(`/broadcasts/${id}`);
}

export async function sendBroadcast(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await sendBroadcastById(id);
  revalidatePath("/broadcasts");
  revalidatePath(`/broadcasts/${id}`);
}

async function sendBroadcastById(id: string) {
  const broadcast = await prisma.broadcast.findUnique({
    where: { id },
    include: { tags: true },
  });
  if (!broadcast || broadcast.status !== "DRAFT") return;

  const tagIds = broadcast.tags.map((t) => t.tagId);
  const contacts = await prisma.contact.findMany({
    where: { optedOut: false, tags: { some: { tagId: { in: tagIds } } } },
    select: { id: true },
  });

  if (contacts.length === 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.broadcastRecipient.createMany({
      data: contacts.map((c) => ({ broadcastId: id, contactId: c.id })),
      skipDuplicates: true,
    });
    await tx.broadcast.update({ where: { id }, data: { status: "SENDING", sentAt: new Date() } });
  });

  const recipients = await prisma.broadcastRecipient.findMany({
    where: { broadcastId: id, status: "PENDING" },
    select: { id: true },
  });

  for (const recipient of recipients) {
    await broadcastQueue.add("send", { broadcastRecipientId: recipient.id });
  }
}

export async function deleteBroadcast(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.broadcast.delete({ where: { id } });
  revalidatePath("/broadcasts");
  redirect("/broadcasts");
}
