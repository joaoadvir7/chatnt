/**
 * Normaliza um telefone para o formato E.164 (+DDI + número, só dígitos depois do +).
 * Aceita entradas com espaços, parênteses, traços, com ou sem "+".
 * Mantém consistência entre contatos criados manualmente, via CSV e via webhook do WhatsApp
 * (que já manda o número sem "+").
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  return `+${digits}`;
}
