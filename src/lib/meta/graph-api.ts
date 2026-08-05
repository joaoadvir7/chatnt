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

export async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  body: string,
): Promise<{ waMessageId: string }> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message ?? "Erro ao enviar mensagem via WhatsApp";
    throw new Error(message);
  }

  return { waMessageId: data.messages?.[0]?.id };
}
