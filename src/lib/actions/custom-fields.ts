"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CustomFieldType } from "@/generated/prisma/enums";

const VALID_TYPES = Object.values(CustomFieldType);
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function createCustomField(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "TEXT") as CustomFieldType;
  const optionsRaw = String(formData.get("options") ?? "").trim();

  if (!name) {
    redirect("/campos-customizados?error=Nome do campo é obrigatório");
  }
  if (!VALID_TYPES.includes(type)) {
    redirect("/campos-customizados?error=Tipo de campo inválido");
  }

  const key = slugify(name);
  const existing = await prisma.customField.findUnique({ where: { key } });
  if (existing) {
    redirect("/campos-customizados?error=Já existe um campo com esse nome");
  }

  const options =
    type === "SELECT" && optionsRaw
      ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : undefined;

  await prisma.customField.create({
    data: { name, key, type, options },
  });
  revalidatePath("/campos-customizados");
  revalidatePath("/contatos");
  redirect("/campos-customizados");
}

export async function deleteCustomField(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.customField.delete({ where: { id } });
  revalidatePath("/campos-customizados");
  revalidatePath("/contatos");
}
