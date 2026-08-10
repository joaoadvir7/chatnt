"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const DEFAULT_STAGES = ["Novos alunos", "Em conversa", "Visita agendada", "Estudo bíblico", "Concluído"];

export async function createPipeline(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const pipeline = await prisma.pipeline.create({
    data: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      stages: { create: DEFAULT_STAGES.map((stage, position) => ({ name: stage, position })) },
    },
  });

  redirect(`/crm?pipeline=${pipeline.id}`);
}

export async function createPipelineStage(formData: FormData) {
  const pipelineId = String(formData.get("pipelineId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!pipelineId || !name) return;

  const position = await prisma.pipelineStage.count({ where: { pipelineId } });
  await prisma.pipelineStage.create({
    data: { pipelineId, name, position },
  });
  revalidatePath("/crm");
}

export async function createDeal(formData: FormData) {
  const pipelineId = String(formData.get("pipelineId") ?? "");
  const stageId = String(formData.get("stageId") ?? "");
  const contactId = String(formData.get("contactId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const temperature = Math.min(100, Math.max(0, Number(formData.get("temperature") ?? 50)));
  const rawValue = String(formData.get("value") ?? "0").replace(",", ".");
  const value = Number(rawValue);

  if (!pipelineId || !stageId || !contactId || !title) return;

  const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, pipelineId } });
  if (!stage) return;

  await prisma.deal.create({
    data: {
      pipelineId,
      stageId,
      contactId,
      title,
      temperature: Number.isFinite(temperature) ? temperature : 50,
      value: Number.isFinite(value) ? value : 0,
    },
  });
  revalidatePath("/crm");
}

export async function moveDeal(formData: FormData) {
  const dealId = String(formData.get("dealId") ?? "");
  const stageId = String(formData.get("stageId") ?? "");
  if (!dealId || !stageId) return;

  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, pipelineId: deal?.pipelineId } });
  if (!deal || !stage) return;

  await prisma.deal.update({ where: { id: dealId }, data: { stageId } });
  revalidatePath("/crm");
}
