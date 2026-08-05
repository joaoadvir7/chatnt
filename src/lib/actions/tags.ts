"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createTag(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#6366F1").trim();

  if (!name) {
    redirect("/tags?error=Nome da tag é obrigatório");
  }

  const existing = await prisma.tag.findUnique({ where: { name } });
  if (existing) {
    redirect("/tags?error=Já existe uma tag com esse nome");
  }

  await prisma.tag.create({ data: { name, color } });
  revalidatePath("/tags");
  revalidatePath("/contatos");
  redirect("/tags");
}

export async function deleteTag(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.tag.delete({ where: { id } });
  revalidatePath("/tags");
  revalidatePath("/contatos");
}
