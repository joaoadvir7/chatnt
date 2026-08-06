"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createNote(formData: FormData) {
  const contactId = String(formData.get("contactId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const conversationId = String(formData.get("conversationId") ?? "");

  if (!contactId || !content) return;

  await prisma.note.create({ data: { contactId, content } });

  if (conversationId) revalidatePath(`/conversas/${conversationId}`);
  revalidatePath(`/contatos/${contactId}`);
}

export async function deleteNote(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const contactId = String(formData.get("contactId") ?? "");
  const conversationId = String(formData.get("conversationId") ?? "");
  if (!id) return;

  await prisma.note.delete({ where: { id } });

  if (conversationId) revalidatePath(`/conversas/${conversationId}`);
  if (contactId) revalidatePath(`/contatos/${contactId}`);
}
