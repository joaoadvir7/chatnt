import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Documentação do formato do payload:
// https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

type InboundMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
};

type WhatsAppWebhookPayload = {
  entry?: {
    changes?: {
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { profile?: { name?: string }; wa_id?: string }[];
        messages?: InboundMessage[];
        statuses?: { id: string; status: string }[];
      };
    }[];
  }[];
};

function toE164(phone: string) {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function extractContent(message: InboundMessage) {
  if (message.type === "text" && message.text) return message.text.body;
  return `[mensagem do tipo ${message.type} — ainda sem suporte de exibição]`;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as WhatsAppWebhookPayload;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value;
      if (!value) continue;

      const phoneNumberId = value.metadata?.phone_number_id;
      if (!phoneNumberId) continue;

      const connection = await prisma.whatsAppConnection.findUnique({
        where: { phoneNumberId },
      });
      if (!connection) continue;

      for (const message of value.messages ?? []) {
        const phone = toE164(message.from);
        const profileName = value.contacts?.find((c) => c.wa_id === message.from)?.profile?.name;

        const contact = await prisma.contact.upsert({
          where: { phone },
          create: { name: profileName || phone, phone },
          update: {},
        });

        const conversation = await prisma.conversation.upsert({
          where: { contactId_connectionId: { contactId: contact.id, connectionId: connection.id } },
          create: { contactId: contact.id, connectionId: connection.id },
          update: { status: "OPEN" },
        });

        await prisma.message.upsert({
          where: { waMessageId: message.id },
          create: {
            conversationId: conversation.id,
            direction: "INBOUND",
            content: extractContent(message),
            waMessageId: message.id,
          },
          update: {},
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });
      }

      for (const status of value.statuses ?? []) {
        await prisma.message
          .update({ where: { waMessageId: status.id }, data: { status: status.status } })
          .catch(() => {
            // Mensagem correspondente ainda não existe localmente — ignora.
          });
      }
    }
  }

  return NextResponse.json({ received: true });
}
