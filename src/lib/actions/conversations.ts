"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendTextMessage } from "@/lib/meta/graph-api";

export type SendMessageResult = { error?: string } | null;

export async function sendMessage(
  _prevState: SendMessageResult,
  formData: FormData,
): Promise<SendMessageResult> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!conversationId || !content) {
    return { error: "Digite uma mensagem" };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { contact: true, connection: true },
  });

  if (!conversation) {
    return { error: "Conversa não encontrada" };
  }

  try {
    const { waMessageId } = await sendTextMessage(
      conversation.connection.phoneNumberId,
      conversation.connection.accessToken,
      conversation.contact.phone.replace(/^\+/, ""),
      content,
    );

    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          direction: "OUTBOUND",
          content,
          status: "sent",
          waMessageId,
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar mensagem";
    return { error: message };
  }

  revalidatePath(`/conversas/${conversationId}`);
  revalidatePath("/conversas");
  return null;
}

export async function markConversationResolved(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.conversation.update({ where: { id }, data: { status: "RESOLVED" } });
  revalidatePath("/conversas");
  revalidatePath(`/conversas/${id}`);
}

export async function reopenConversation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.conversation.update({ where: { id }, data: { status: "OPEN" } });
  revalidatePath("/conversas");
  revalidatePath(`/conversas/${id}`);
}

export async function startConversation(formData: FormData) {
  const contactId = String(formData.get("contactId") ?? "");
  const connectionId = String(formData.get("connectionId") ?? "");
  if (!contactId || !connectionId) return;

  const conversation = await prisma.conversation.upsert({
    where: { contactId_connectionId: { contactId, connectionId } },
    create: { contactId, connectionId },
    update: {},
  });

  revalidatePath("/conversas");
  redirect(`/conversas/${conversation.id}`);
}
