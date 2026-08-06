import { Worker, type Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { sendTemplateMessage } from "@/lib/meta/graph-api";
import { redisConnection } from "@/lib/queue/redis-connection";
import type { BroadcastJobData } from "@/lib/queue/broadcast-queue";

async function processJob(job: Job<BroadcastJobData>) {
  const recipient = await prisma.broadcastRecipient.findUnique({
    where: { id: job.data.broadcastRecipientId },
    include: { contact: true, broadcast: { include: { connection: true } } },
  });
  if (!recipient) return;

  const { contact, broadcast } = recipient;

  if (contact.optedOut) {
    await prisma.broadcastRecipient.update({
      where: { id: recipient.id },
      data: { status: "FAILED", error: "Contato descadastrado (OptOut)" },
    });
    return;
  }

  try {
    const { waMessageId } = await sendTemplateMessage(
      broadcast.connection.phoneNumberId,
      broadcast.connection.accessToken,
      contact.phone.replace(/^\+/, ""),
      broadcast.templateName,
      broadcast.templateLanguage,
    );

    await prisma.broadcastRecipient.update({
      where: { id: recipient.id },
      data: { status: "SENT", waMessageId, error: null },
    });

    // Também registra no histórico do Live Chat, como as demais mensagens enviadas.
    const conversation = await prisma.conversation.upsert({
      where: {
        contactId_connectionId: { contactId: contact.id, connectionId: broadcast.connectionId },
      },
      create: { contactId: contact.id, connectionId: broadcast.connectionId },
      update: {},
    });
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        content: `[template: ${broadcast.templateName}]`,
        status: "sent",
        waMessageId,
      },
    });
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await prisma.broadcastRecipient.update({
      where: { id: recipient.id },
      data: { status: "FAILED", error: message },
    });
  }

  const pending = await prisma.broadcastRecipient.count({
    where: { broadcastId: broadcast.id, status: "PENDING" },
  });
  if (pending === 0) {
    await prisma.broadcast.update({ where: { id: broadcast.id }, data: { status: "COMPLETED" } });
  }
}

let worker: Worker<BroadcastJobData> | undefined;

/** Idempotente: seguro chamar mais de uma vez (ex: hot reload em dev). */
export function startBroadcastWorker() {
  const globalForWorker = globalThis as unknown as { broadcastWorker?: Worker<BroadcastJobData> };
  if (globalForWorker.broadcastWorker) {
    worker = globalForWorker.broadcastWorker;
    return worker;
  }

  worker = new Worker<BroadcastJobData>("broadcast-sends", processJob, {
    connection: redisConnection,
    limiter: { max: 10, duration: 1000 }, // no máximo 10 envios/segundo, evita rate limit da Meta
  });

  globalForWorker.broadcastWorker = worker;
  return worker;
}
