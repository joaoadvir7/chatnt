"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fetchPhoneNumberDetails } from "@/lib/meta/graph-api";

export async function createConnection(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const wabaId = String(formData.get("wabaId") ?? "").trim();
  const phoneNumberId = String(formData.get("phoneNumberId") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();

  if (!name || !phoneNumber || !wabaId || !phoneNumberId || !accessToken) {
    redirect("/conexoes/nova?error=Preencha todos os campos obrigatórios");
  }

  const existing = await prisma.whatsAppConnection.findFirst({
    where: { OR: [{ phoneNumber }, { phoneNumberId }] },
  });
  if (existing) {
    redirect("/conexoes/nova?error=Já existe uma conexão com esse número ou phone_number_id");
  }

  let details;
  try {
    details = await fetchPhoneNumberDetails(phoneNumberId, accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao validar conexão";
    redirect(`/conexoes/nova?error=${encodeURIComponent(message)}`);
  }

  await prisma.whatsAppConnection.create({
    data: {
      name,
      phoneNumber,
      wabaId,
      phoneNumberId,
      accessToken,
      verifiedName: details.verifiedName,
      businessVerified: details.businessVerified,
      qualityRating: details.qualityRating,
      lastValidatedAt: new Date(),
    },
  });

  revalidatePath("/conexoes");
  redirect("/conexoes");
}

export async function refreshConnection(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const connection = await prisma.whatsAppConnection.findUnique({ where: { id } });
  if (!connection) return;

  try {
    const details = await fetchPhoneNumberDetails(connection.phoneNumberId, connection.accessToken);
    await prisma.whatsAppConnection.update({
      where: { id },
      data: {
        verifiedName: details.verifiedName,
        businessVerified: details.businessVerified,
        qualityRating: details.qualityRating,
        lastValidatedAt: new Date(),
      },
    });
  } catch {
    // Falha ao revalidar não deve quebrar a tela; a conexão mantém os últimos dados conhecidos.
  }

  revalidatePath("/conexoes");
}

export async function deleteConnection(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.whatsAppConnection.delete({ where: { id } });
  revalidatePath("/conexoes");
}

export async function toggleConnectionActive(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!id) return;

  await prisma.whatsAppConnection.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/conexoes");
}
