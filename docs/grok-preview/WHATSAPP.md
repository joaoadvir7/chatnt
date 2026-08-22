# WhatsApp Cloud API no ChatNT

Graph: `https://graph.facebook.com/v21.0` (`src/lib/whatsapp-api.ts`).

## Credenciais por conexão

`WabaConfig`: `appId`, `wabaId`, `phoneNumberId`, `accessToken`, `webhookVerifyToken`, `coexistence?`, `iceBreakers?`.

Pronto para enviar: `wabaReady()` — token real (>20 chars, não `DEMO_`) + phoneNumberId.

## Webhook

- Callback: `{origin}/api/whatsapp/webhook`
- GET: verificação `hub.mode=subscribe` + `hub.verify_token`
- POST: mensagens e statuses
- Poll interno: `?poll=1` (Live Chat) — **não é a Meta**

Verify token padrão: `chatnt_verify_token`.

Assinar: `subscribeWabaWebhook` (subscribed_apps + override_callback_uri).

## Envio

- Texto: `sendWabaTextMessage`
- Interativo (botões, lista, CTA URL): `sendWabaInteractive`
- Template: `sendWabaTemplate`

Janela 24h: sessão. Fora: template aprovado.

## Ice breakers (iniciadores)

- UI: Live Chat → engrenagem → Iniciadores de conversa
- GET `/{phone-number-id}?fields=conversational_automation`
- POST `/{phone-number-id}/conversational_automation` `{ prompts: string[] }`
- Máx. 4, 80 chars, sem emoji
- Só no **primeiro** chat; `wa.me` com texto pronto **não** mostra

## Embedded Signup

| Tipo | `featureType` |
|---|---|
| Nova | `""` |
| Migrar | `only_waba_sharing` |
| Coexistência | `whatsapp_business_app_onboarding` + `sessionInfoVersion: "3"` |
| Existente | lista WABAs (`listMetaWhatsAppAccounts`) |

## Cobrança (não negociável)

| Origem | Meta cobra? |
|---|---|
| WhatsApp Business App / Web (coexistência) | Não |
| ChatNT (live, automação, broadcast) | Sim — Cloud API |

A partir de **1º/out/2026** resposta de serviço na API também é cobrada. O app continua grátis.

Não implementar Baileys/QR não oficial.
