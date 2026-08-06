import { prisma } from "@/lib/prisma";
import { automationQueue } from "@/lib/queue/automation-queue";

const MAX_RUNS_PER_24H = 20;

async function getNextNodeId(nodeId: string, sourceHandle?: string | null): Promise<string | null> {
  const edge = await prisma.automationEdge.findFirst({
    where: { sourceNodeId: nodeId, sourceHandle: sourceHandle ?? null },
    orderBy: { createdAt: "asc" },
  });
  return edge?.targetNodeId ?? null;
}

async function pickFallbackConnectionId(): Promise<string | null> {
  const connection = await prisma.whatsAppConnection.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return connection?.id ?? null;
}

type TriggerEvent =
  | { type: "KEYWORD"; contactId: string; connectionId: string; messageText: string }
  | { type: "TAG_APPLIED"; contactId: string; tagId: string; connectionId?: string }
  | { type: "NEW_CONTACT"; contactId: string; connectionId?: string };

/**
 * Encontra automações ativas cujo gatilho corresponde ao evento e enfileira a execução
 * para cada uma, respeitando o limite de 20 disparos por contato a cada 24h.
 */
export async function triggerAutomations(event: TriggerEvent) {
  const triggerNodes = await prisma.automationNode.findMany({
    where: { type: "TRIGGER", automation: { isActive: true } },
    include: { automation: true },
  });

  for (const trigger of triggerNodes) {
    const config = (trigger.config as Record<string, unknown>) ?? {};
    if (config.triggerType !== event.type) continue;

    if (event.type === "KEYWORD") {
      const keyword = String(config.keyword ?? "").trim().toLowerCase();
      if (!keyword || !event.messageText.toLowerCase().includes(keyword)) continue;
    }

    if (event.type === "TAG_APPLIED" && config.tagId !== event.tagId) continue;

    const contactId = event.contactId;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRuns = await prisma.automationRun.count({
      where: { automationId: trigger.automationId, contactId, triggeredAt: { gte: since } },
    });
    if (recentRuns >= MAX_RUNS_PER_24H) continue;

    const nextNodeId = await getNextNodeId(trigger.id);
    if (!nextNodeId) continue; // gatilho sem nenhum passo conectado

    const connectionId = event.connectionId ?? (await pickFallbackConnectionId());
    if (!connectionId) continue; // nenhuma conexão de WhatsApp disponível pra enviar

    const run = await prisma.automationRun.create({
      data: { automationId: trigger.automationId, contactId, status: "RUNNING" },
    });

    await automationQueue.add("run-step", {
      runId: run.id,
      automationId: trigger.automationId,
      contactId,
      connectionId,
      nodeId: nextNodeId,
    });
  }
}
