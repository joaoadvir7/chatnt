/**
 * Normaliza um telefone para o formato E.164 (+DDI + número, só dígitos depois do +).
 * Aceita entradas com espaços, parênteses, traços, com ou sem "+".
 * Mantém consistência entre contatos criados manualmente, via CSV e via webhook do WhatsApp
 * (que já manda o número sem "+").
 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");

  // O webhook do WhatsApp pode entregar celulares brasileiros sem o nono
  // dígito (ex.: 559184405733). A Cloud API, porém, exige o E.164 atual
  // para responder (ex.: 5591984405733). Só ajustamos números de celular
  // brasileiros de 8 dígitos, preservando linhas fixas e outros países.
  if (digits.startsWith("55") && digits.length === 12 && /^[6-9]/.test(digits.slice(4))) {
    digits = `${digits.slice(0, 4)}9${digits.slice(4)}`;
  }

  return `+${digits}`;
}
