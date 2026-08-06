"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { AutomationNodeType, Prisma } from "@/generated/prisma/client";

export async function createAutomation(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const folderId = String(formData.get("folderId") ?? "") || null;

  if (!name) redirect("/automacoes?error=Nome da automação é obrigatório");

  const automation = await prisma.automation.create({
    data: {
      name,
      folderId,
      nodes: {
        create: [
          {
            type: "TRIGGER",
            positionX: 100,
            positionY: 100,
            config: {},
          },
        ],
      },
    },
  });

  revalidatePath("/automacoes");
  redirect(`/automacoes/${automation.id}`);
}

export async function deleteAutomation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.automation.delete({ where: { id } });
  revalidatePath("/automacoes");
}

export async function toggleAutomationActive(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!id) return;

  await prisma.automation.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/automacoes");
}

export async function renameAutomation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await prisma.automation.update({ where: { id }, data: { name } });
  revalidatePath("/automacoes");
  revalidatePath(`/automacoes/${id}`);
}

export type GraphNodeInput = {
  id: string;
  isNew: boolean;
  type: AutomationNodeType;
  positionX: number;
  positionY: number;
  config: Record<string, unknown>;
};

export type GraphEdgeInput = {
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string | null;
};

export async function saveAutomationGraph(
  automationId: string,
  nodes: GraphNodeInput[],
  edges: GraphEdgeInput[],
): Promise<{ idMap: Record<string, string> }> {
  const idMap: Record<string, string> = {};

  await prisma.$transaction(async (tx) => {
    const existingNodes = await tx.automationNode.findMany({
      where: { automationId },
      select: { id: true },
    });
    const submittedExistingIds = new Set(nodes.filter((n) => !n.isNew).map((n) => n.id));
    const toDelete = existingNodes
      .map((n) => n.id)
      .filter((id) => !submittedExistingIds.has(id));

    if (toDelete.length > 0) {
      await tx.automationNode.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const node of nodes) {
      if (node.isNew) {
        const created = await tx.automationNode.create({
          data: {
            automationId,
            type: node.type,
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config as Prisma.InputJsonValue,
          },
        });
        idMap[node.id] = created.id;
      } else {
        await tx.automationNode.update({
          where: { id: node.id },
          data: {
            positionX: node.positionX,
            positionY: node.positionY,
            config: node.config as Prisma.InputJsonValue,
          },
        });
        idMap[node.id] = node.id;
      }
    }

    await tx.automationEdge.deleteMany({ where: { automationId } });

    if (edges.length > 0) {
      await tx.automationEdge.createMany({
        data: edges.map((e) => ({
          automationId,
          sourceNodeId: idMap[e.sourceNodeId] ?? e.sourceNodeId,
          targetNodeId: idMap[e.targetNodeId] ?? e.targetNodeId,
          sourceHandle: e.sourceHandle,
        })),
      });
    }

    await tx.automation.update({ where: { id: automationId }, data: { updatedAt: new Date() } });
  });

  revalidatePath(`/automacoes/${automationId}`);
  revalidatePath("/automacoes");

  return { idMap };
}
