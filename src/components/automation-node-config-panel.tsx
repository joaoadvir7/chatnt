"use client";

import { X } from "lucide-react";
import type { AutomationNodeType } from "@/generated/prisma/enums";

type Tag = { id: string; name: string; color: string };
type AutomationOption = { id: string; name: string };

export function AutomationNodeConfigPanel({
  nodeType,
  config,
  tags,
  automations,
  onChange,
  onClose,
}: {
  nodeType: AutomationNodeType;
  config: Record<string, unknown>;
  tags: Tag[];
  automations: AutomationOption[];
  onChange: (config: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  function set(key: string, value: unknown) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <h2 className="text-sm font-semibold">Configurar passo</h2>
        <button onClick={onClose} className="text-foreground/50 hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {nodeType === "TRIGGER" && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Tipo de gatilho
              <select
                value={(config.triggerType as string) ?? ""}
                onChange={(e) => set("triggerType", e.target.value)}
                className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
              >
                <option value="">Selecione...</option>
                <option value="KEYWORD">Palavra-chave recebida</option>
                <option value="TAG_APPLIED">Tag aplicada ao contato</option>
                <option value="NEW_CONTACT">Novo contato criado</option>
              </select>
            </label>

            {config.triggerType === "KEYWORD" && (
              <label className="flex flex-col gap-1 text-sm">
                Palavra-chave (a automação dispara quando a mensagem recebida contém esse texto)
                <input
                  type="text"
                  value={(config.keyword as string) ?? ""}
                  onChange={(e) => set("keyword", e.target.value)}
                  placeholder="ex: quero estudar"
                  className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
                />
              </label>
            )}

            {config.triggerType === "TAG_APPLIED" && (
              <label className="flex flex-col gap-1 text-sm">
                Tag
                <select
                  value={(config.tagId as string) ?? ""}
                  onChange={(e) => set("tagId", e.target.value)}
                  className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
                >
                  <option value="">Selecione...</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        {nodeType === "SEND_MESSAGE" && (
          <label className="flex flex-col gap-1 text-sm">
            Mensagem
            <textarea
              rows={5}
              value={(config.message as string) ?? ""}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Escreva a mensagem que será enviada ao contato..."
              className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
            />
          </label>
        )}

        {nodeType === "APPLY_TAG" && (
          <label className="flex flex-col gap-1 text-sm">
            Tag a aplicar
            <select
              value={(config.tagId as string) ?? ""}
              onChange={(e) => set("tagId", e.target.value)}
              className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
            >
              <option value="">Selecione...</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {nodeType === "DELAY" && (
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Tempo
              <input
                type="number"
                min={1}
                value={(config.amount as number) ?? ""}
                onChange={(e) => set("amount", Number(e.target.value))}
                className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Unidade
              <select
                value={(config.unit as string) ?? "MINUTES"}
                onChange={(e) => set("unit", e.target.value)}
                className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
              >
                <option value="MINUTES">Minutos</option>
                <option value="HOURS">Horas</option>
                <option value="DAYS">Dias</option>
              </select>
            </label>
          </div>
        )}

        {nodeType === "CONDITIONAL" && (
          <label className="flex flex-col gap-1 text-sm">
            O contato tem a tag:
            <select
              value={(config.tagId as string) ?? ""}
              onChange={(e) => set("tagId", e.target.value)}
              className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
            >
              <option value="">Selecione...</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-foreground/50">
              Conecte a saída &quot;Sim&quot; e &quot;Não&quot; a passos diferentes no canvas.
            </p>
          </label>
        )}

        {nodeType === "HTTP_REQUEST" && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Método
              <select
                value={(config.method as string) ?? "GET"}
                onChange={(e) => set("method", e.target.value)}
                className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              URL
              <input
                type="text"
                value={(config.url as string) ?? ""}
                onChange={(e) => set("url", e.target.value)}
                placeholder="https://exemplo.com/webhook"
                className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
              />
            </label>
            <p className="text-xs text-foreground/50">
              A automação chama esse endereço e segue para o próximo passo (não bloqueia o fluxo
              esperando resposta).
            </p>
          </>
        )}

        {nodeType === "OPT_OUT" && (
          <p className="text-sm text-foreground/60">
            Marca o contato como descadastrado. A partir daí, o passo &quot;Enviar mensagem&quot;
            não envia mais nada pra ele em nenhuma automação.
          </p>
        )}

        {nodeType === "RANDOMIZER" && (
          <p className="text-sm text-foreground/60">
            Divide o fluxo aleatoriamente: metade dos contatos segue pela saída &quot;A&quot;,
            metade pela &quot;B&quot;. Conecte cada saída a um caminho diferente no canvas.
          </p>
        )}

        {nodeType === "FORWARD_AUTOMATION" && (
          <label className="flex flex-col gap-1 text-sm">
            Automação a iniciar
            <select
              value={(config.targetAutomationId as string) ?? ""}
              onChange={(e) => set("targetAutomationId", e.target.value)}
              className="rounded-md border border-black/10 px-2 py-1.5 text-sm"
            >
              <option value="">Selecione...</option>
              {automations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
