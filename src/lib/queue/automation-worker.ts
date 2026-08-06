import { Worker, type Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { sendTextMessage } from "@/lib/meta/graph-api";
import { redisConnection } from "@/lib/queue/redis-connection";
import { automationQueue, type AutomationJobData } from "@/lib/queue/automation-queue";

const DELAY_MS_PER_UNIT: Record<string, number> = {
  MINUTES: 60_000,
  HOURS: 60 * 60_000,
  DAYS: 24 * 60 * 60_000,
};

async function getNextNodeId(nodeId: string, sourceHandle?: string | null): Promise<string | null> {
  const edge = await prisma.automationEdge.findFirst({
    where: { sourceNodeId: nodeId, sourceHandle: sourceHandle ?? null },
    orderBy: { createdAt: "asc" },
  });
  return edge?.targetNodeId ?? null;
}

async function processJob(job: Job<AutomationJobData>) {
  const { runId, contactId, connectionId } = job.data;
  let currentNodeId: string | null = job.data.nodeId;

  while (currentNodeId) {
    const node = await prisma.automationNode.findUnique({ where: { id: currentNodeId } });
    if (!node) break;

    const config = (node.config as Record<string, unknown>) ?? {};

    if (node.type === "SEND_MESSAGE") {
      const message = String(config.message ?? "").trim();
      if (message) {
        const [contact, connection] = await Promise.all([
          prisma.contact.findUnique({ where: { id: contactId } }),
          prisma.whatsAppConnection.findUnique({ where: { id: connectionId } }),
        ]);
        if (contact?.optedOut) {
          // contato pediu pra não receber mais mensagens — pula o envio, mas segue o fluxo
        } else if (contact && connection) {
          const { waMessageId } = await sendTextMessage(
            connection.phoneNumberId,
            connection.accessToken,
            contact.phone.replace(/^\+/, ""),
            message,
          );

          const conversation = await prisma.conversation.findUnique({
            where: { contactId_connectionId: { contactId, connectionId } },
          });
          if (conversation) {
            await prisma.message.create({
              data: {
                conversationId: conversation.id,
                direction: "OUTBOUND",
                content: message,
                status: "sent",
                waMessageId,
              },
            });
            await prisma.conversation.update({
              where: { id: conversation.id },
              data: { lastMessageAt: new Date() },
            });
          }
        }
      }
      currentNodeId = await getNextNodeId(node.id);
    } else if (node.type === "APPLY_TAG") {
      const tagId = config.tagId as string | undefined;
      if (tagId) {
        await prisma.contactTag
          .upsert({
            where: { contactId_tagId: { contactId, tagId } },
            create: { contactId, tagId },
            update: {},
          })
          .catch(() => {});
      }
      currentNodeId = await getNextNodeId(node.id);
    } else if (node.type === "CONDITIONAL") {
      const tagId = config.tagId as string | undefined;
      let hasTag = false;
      if (tagId) {
        const match = await prisma.contactTag.findUnique({
          where: { contactId_tagId: { contactId, tagId } },
        });
        hasTag = Boolean(match);
      }
      currentNodeId = await getNextNodeId(node.id, hasTag ? "true" : "false");
    } else if (node.type === "DELAY") {
      const amount = Number(config.amount ?? 0);
      const unit = String(config.unit ?? "MINUTES");
      const delayMs = amount * (DELAY_MS_PER_UNIT[unit] ?? DELAY_MS_PER_UNIT.MINUTES);
      const nextNodeId = await getNextNodeId(node.id);

      if (nextNodeId && delayMs > 0) {
        await automationQueue.add(
          "run-step",
          { ...job.data, nodeId: nextNodeId },
          { delay: delayMs },
        );
      }
      return; // pausa aqui; a continuação roda como um novo job mais tarde
    } else if (node.type === "HTTP_REQUEST") {
      const url = String(config.url ?? "").trim();
      const method = String(config.method ?? "GET").toUpperCase();
      if (url) {
        await fetch(url, { method }).catch(() => {
          // endpoint externo fora do ar não deve travar o fluxo
        });
      }
      currentNodeId = await getNextNodeId(node.id);
    } else if (node.type === "OPT_OUT") {
      await prisma.contact.update({ where: { id: contactId }, data: { optedOut: true } });
      currentNodeId = await getNextNodeId(node.id);
    } else if (node.type === "RANDOMIZER") {
      const branch = Math.random() < 0.5 ? "a" : "b";
      currentNodeId = await getNextNodeId(node.id, branch);
    } else if (node.type === "FORWARD_AUTOMATION") {
      const targetAutomationId = config.targetAutomationId as string | undefined;
      if (!targetAutomationId) {
        currentNodeId = null;
        continue;
      }
      const targetTrigger = await prisma.automationNode.findFirst({
        where: { automationId: targetAutomationId, type: "TRIGGER" },
      });
      currentNodeId = targetTrigger ? await getNextNodeId(targetTrigger.id) : null;
    } else {
      currentNodeId = null;
    }
  }

  await prisma.automationRun.update({ where: { id: runId }, data: { status: "COMPLETED" } });
}

let worker: Worker<AutomationJobData> | undefined;

/** Idempotente: seguro chamar mais de uma vez (ex: hot reload em dev). */
export function startAutomationWorker() {
  const globalForWorker = globalThis as unknown as { automationWorker?: Worker<AutomationJobData> };
  if (globalForWorker.automationWorker) {
    worker = globalForWorker.automationWorker;
    return worker;
  }

  worker = new Worker<AutomationJobData>(
    "automation-runs",
    async (job) => {
      try {
        await processJob(job);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        await prisma.automationRun.update({
          where: { id: job.data.runId },
          data: { status: "FAILED", error: message },
        });
        throw error;
      }
    },
    { connection: redisConnection },
  );

  globalForWorker.automationWorker = worker;
  return worker;
}
