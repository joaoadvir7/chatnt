const GRAPH_API_VERSION = "v21.0";

export type PhoneNumberDetails = {
  verifiedName?: string;
  displayPhoneNumber?: string;
  qualityRating?: string;
  businessVerified: boolean;
};

export async function fetchPhoneNumberDetails(
  phoneNumberId: string,
  accessToken: string,
): Promise<PhoneNumberDetails> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message ?? "Erro ao validar conexão com a Meta";
    throw new Error(message);
  }

  return {
    verifiedName: data.verified_name,
    displayPhoneNumber: data.display_phone_number,
    qualityRating: data.quality_rating,
    businessVerified: data.code_verification_status === "VERIFIED",
  };
}

async function postMessage(
  phoneNumberId: string,
  accessToken: string,
  payload: Record<string, unknown>,
): Promise<{ waMessageId: string }> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message ?? "Erro ao enviar mensagem via WhatsApp";
    throw new Error(message);
  }

  return { waMessageId: data.messages?.[0]?.id };
}

export async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  body: string,
): Promise<{ waMessageId: string }> {
  return postMessage(phoneNumberId, accessToken, { to, type: "text", text: { body } });
}

export type MediaType = "image" | "video" | "document";

export type RichMessageInput = {
  text: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
};

/**
 * Envia uma mensagem que pode combinar texto, mídia (imagem/vídeo/documento por URL)
 * e um botão de link (CTA URL) — escolhendo automaticamente o formato certo da API:
 * - botão presente → mensagem interativa "cta_url" (com mídia opcional no cabeçalho)
 * - só mídia → mensagem de mídia com legenda
 * - só texto → mensagem de texto simples
 */
export async function sendRichMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  input: RichMessageInput,
): Promise<{ waMessageId: string }> {
  const { text, mediaType, mediaUrl, buttonText, buttonUrl } = input;

  if (buttonText && buttonUrl) {
    const interactive: Record<string, unknown> = {
      type: "cta_url",
      body: { text },
      action: {
        name: "cta_url",
        parameters: { display_text: buttonText, url: buttonUrl },
      },
    };
    if (mediaUrl && mediaType && mediaType !== "document") {
      interactive.header = { type: mediaType, [mediaType]: { link: mediaUrl } };
    }
    return postMessage(phoneNumberId, accessToken, { to, type: "interactive", interactive });
  }

  if (mediaUrl && mediaType) {
    return postMessage(phoneNumberId, accessToken, {
      to,
      type: mediaType,
      [mediaType]: { link: mediaUrl, caption: text || undefined },
    });
  }

  return sendTextMessage(phoneNumberId, accessToken, to, text);
}

export async function sendTemplateMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  templateName: string,
  templateLanguage: string,
): Promise<{ waMessageId: string }> {
  return postMessage(phoneNumberId, accessToken, {
    to,
    type: "template",
    template: { name: templateName, language: { code: templateLanguage } },
  });
}

export type MessageTemplate = {
  name: string;
  language: string;
  category: string;
  bodyPreview?: string;
};

/**
 * Busca os templates de mensagem da conta (WABA), retornando só os aprovados —
 * são os únicos que a Meta permite usar pra iniciar conversa (broadcasts).
 */
export async function fetchApprovedTemplates(
  wabaId: string,
  accessToken: string,
): Promise<MessageTemplate[]> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/message_templates?fields=name,language,category,status,components&limit=100`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message ?? "Erro ao buscar templates da Meta";
    throw new Error(message);
  }

  type RawTemplate = {
    name: string;
    language: string;
    category: string;
    status: string;
    components?: { type: string; text?: string }[];
  };

  return ((data.data ?? []) as RawTemplate[])
    .filter((t) => t.status === "APPROVED")
    .map((t) => ({
      name: t.name,
      language: t.language,
      category: t.category,
      bodyPreview: t.components?.find((c) => c.type === "BODY")?.text,
    }));
}
