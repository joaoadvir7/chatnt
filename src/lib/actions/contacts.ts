"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";

function collectCustomFieldEntries(formData: FormData) {
  const entries: { customFieldId: string; value: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("cf_") && typeof value === "string" && value.trim() !== "") {
      entries.push({ customFieldId: key.slice(3), value: value.trim() });
    }
  }
  return entries;
}

export async function createContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const tagIds = formData.getAll("tagIds").map(String);
  const customFields = collectCustomFieldEntries(formData);

  if (!name || !phone) {
    redirect("/contatos/novo?error=Nome e telefone são obrigatórios");
  }

  const existing = await prisma.contact.findUnique({ where: { phone } });
  if (existing) {
    redirect("/contatos/novo?error=Já existe um contato com esse telefone");
  }

  const contact = await prisma.contact.create({
    data: {
      name,
      phone,
      email: email || null,
      source: source || null,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
      customFieldValues: {
        create: customFields.map((f) => ({ customFieldId: f.customFieldId, value: f.value })),
      },
    },
  });

  revalidatePath("/contatos");
  redirect(`/contatos/${contact.id}`);
}

export async function updateContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const tagIds = formData.getAll("tagIds").map(String);
  const customFields = collectCustomFieldEntries(formData);

  if (!id) return;

  if (!name || !phone) {
    redirect(`/contatos/${id}?error=Nome e telefone são obrigatórios`);
  }

  const phoneOwner = await prisma.contact.findUnique({ where: { phone } });
  if (phoneOwner && phoneOwner.id !== id) {
    redirect(`/contatos/${id}?error=Já existe outro contato com esse telefone`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.contact.update({
      where: { id },
      data: { name, phone, email: email || null, source: source || null },
    });

    await tx.contactTag.deleteMany({ where: { contactId: id } });
    if (tagIds.length > 0) {
      await tx.contactTag.createMany({
        data: tagIds.map((tagId) => ({ contactId: id, tagId })),
      });
    }

    for (const field of customFields) {
      await tx.contactCustomFieldValue.upsert({
        where: { contactId_customFieldId: { contactId: id, customFieldId: field.customFieldId } },
        create: { contactId: id, customFieldId: field.customFieldId, value: field.value },
        update: { value: field.value },
      });
    }
  });

  revalidatePath("/contatos");
  revalidatePath(`/contatos/${id}`);
  redirect(`/contatos/${id}`);
}

export async function deleteContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contatos");
  redirect("/contatos");
}

type ImportResult = {
  createdCount: number;
  skipped: { row: number; reason: string }[];
};

function normalizeHeader(header: string) {
  return header.trim().toLowerCase();
}

export async function importContactsFromCsv(
  _prevState: ImportResult | null,
  formData: FormData,
): Promise<ImportResult> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { createdCount: 0, skipped: [{ row: 0, reason: "Nenhum arquivo enviado" }] };
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  const rows = parsed.data;
  const skipped: { row: number; reason: string }[] = [];
  let createdCount = 0;

  const existingTags = await prisma.tag.findMany();
  const tagByName = new Map(existingTags.map((t) => [t.name.toLowerCase(), t]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +1 for 0-index, +1 for header line

    const name = (row.nome ?? row.name ?? "").trim();
    const phone = (row.telefone ?? row.phone ?? "").trim();
    const email = (row.email ?? "").trim();
    const tagsRaw = (row.tags ?? row.tag ?? "").trim();

    if (!name || !phone) {
      skipped.push({ row: rowNumber, reason: "Nome ou telefone ausente" });
      continue;
    }

    const exists = await prisma.contact.findUnique({ where: { phone } });
    if (exists) {
      skipped.push({ row: rowNumber, reason: `Telefone ${phone} já cadastrado` });
      continue;
    }

    const tagNames = tagsRaw
      ? tagsRaw.split(/[,;]/).map((t) => t.trim()).filter(Boolean)
      : [];

    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const key = tagName.toLowerCase();
      let tag = tagByName.get(key);
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName } });
        tagByName.set(key, tag);
      }
      tagIds.push(tag.id);
    }

    await prisma.contact.create({
      data: {
        name,
        phone,
        email: email || null,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    createdCount++;
  }

  revalidatePath("/contatos");
  revalidatePath("/tags");
  return { createdCount, skipped };
}
