"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createAutomationFolder(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/automacoes?error=Nome da pasta é obrigatório");

  const existing = await prisma.automationFolder.findUnique({ where: { name } });
  if (existing) redirect("/automacoes?error=Já existe uma pasta com esse nome");

  await prisma.automationFolder.create({ data: { name } });
  revalidatePath("/automacoes");
}

export async function renameAutomationFolder(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await prisma.automationFolder.update({ where: { id }, data: { name } });
  revalidatePath("/automacoes");
}

export async function deleteAutomationFolder(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.automationFolder.delete({ where: { id } });
  revalidatePath("/automacoes");
}
