"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Zap,
  MessageSquare,
  Tag as TagIcon,
  Clock,
  GitBranch,
  Globe,
  UserX,
  Shuffle,
  Workflow,
  Copy,
  X,
} from "lucide-react";
import type { AutomationNodeType } from "@/generated/prisma/enums";

export type FlowNodeData = {
  nodeType: AutomationNodeType;
  config: Record<string, unknown>;
  tagsById: Record<string, { name: string; color: string }>;
  automationsById: Record<string, { name: string }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  selected?: boolean;
};

const NODE_META: Record<AutomationNodeType, { label: string; icon: typeof Zap; color: string }> = {
  TRIGGER: { label: "Gatilho", icon: Zap, color: "#128c5f" },
  SEND_MESSAGE: { label: "Enviar mensagem", icon: MessageSquare, color: "#2563eb" },
  APPLY_TAG: { label: "Aplicar tag", icon: TagIcon, color: "#9333ea" },
  DELAY: { label: "Atraso inteligente", icon: Clock, color: "#d97706" },
  CONDITIONAL: { label: "Condicional", icon: GitBranch, color: "#dc2626" },
  HTTP_REQUEST: { label: "Requisição HTTP", icon: Globe, color: "#ea580c" },
  OPT_OUT: { label: "OptOut", icon: UserX, color: "#e11d48" },
  RANDOMIZER: { label: "Randomizador", icon: Shuffle, color: "#7c3aed" },
  FORWARD_AUTOMATION: { label: "Encaminhar automação", icon: Workflow, color: "#db2777" },
};

const UNIT_LABEL: Record<string, string> = { MINUTES: "min", HOURS: "h", DAYS: "dias" };
const TRIGGER_LABEL: Record<string, string> = {
  KEYWORD: "Palavra-chave recebida",
  TAG_APPLIED: "Tag aplicada",
  NEW_CONTACT: "Novo contato",
};

// Tipos de nó com duas saídas (precisam de dois Handle "source")
const BRANCHING_TYPES = new Set(["CONDITIONAL", "RANDOMIZER"]);

function getSummary(data: FlowNodeData): string {
  const c = data.config;
  switch (data.nodeType) {
    case "TRIGGER": {
      const triggerType = c.triggerType as string | undefined;
      if (!triggerType) return "Configure o gatilho";
      if (triggerType === "KEYWORD") return `Palavra-chave: "${c.keyword ?? "..."}"`;
      if (triggerType === "TAG_APPLIED") {
        const tag = c.tagId ? data.tagsById[c.tagId as string] : undefined;
        return `Tag aplicada: ${tag?.name ?? "..."}`;
      }
      return TRIGGER_LABEL[triggerType] ?? triggerType;
    }
    case "SEND_MESSAGE":
      return c.message ? String(c.message).slice(0, 60) : "Configure a mensagem";
    case "APPLY_TAG": {
      const tag = c.tagId ? data.tagsById[c.tagId as string] : undefined;
      return tag ? `Tag: ${tag.name}` : "Escolha uma tag";
    }
    case "DELAY":
      return c.amount ? `Esperar ${c.amount} ${UNIT_LABEL[c.unit as string] ?? "min"}` : "Configure o atraso";
    case "CONDITIONAL": {
      const tag = c.tagId ? data.tagsById[c.tagId as string] : undefined;
      return tag ? `Contato tem a tag "${tag.name}"?` : "Escolha a condição";
    }
    case "HTTP_REQUEST":
      return c.url ? `${c.method ?? "GET"} ${c.url}` : "Configure a URL";
    case "OPT_OUT":
      return "Marca o contato como descadastrado";
    case "RANDOMIZER":
      return "Divide o fluxo 50/50 entre dois caminhos";
    case "FORWARD_AUTOMATION": {
      const target = c.targetAutomationId
        ? data.automationsById[c.targetAutomationId as string]
        : undefined;
      return target ? `Inicia: ${target.name}` : "Escolha a automação";
    }
    default:
      return "";
  }
}

export function AutomationFlowNode({ id, data }: NodeProps & { data: FlowNodeData }) {
  const meta = NODE_META[data.nodeType];
  const Icon = meta.icon;
  const branching = BRANCHING_TYPES.has(data.nodeType);
  const [labelA, labelB] = data.nodeType === "CONDITIONAL" ? ["Não", "Sim"] : ["A", "B"];
  const [handleA, handleB] = data.nodeType === "CONDITIONAL" ? ["false", "true"] : ["a", "b"];

  const isRichMessage =
    data.nodeType === "SEND_MESSAGE" && (data.config.mediaUrl || data.config.buttonText);

  return (
    <div
      className={`${isRichMessage ? "w-72" : "w-64"} rounded-lg border-2 bg-white shadow-sm ${
        data.selected ? "border-brand-green" : "border-black/10"
      }`}
      onClick={() => data.onEdit(id)}
    >
      {data.nodeType !== "TRIGGER" && <Handle type="target" position={Position.Left} />}

      <div
        className="flex items-center gap-2 rounded-t-md px-3 py-2 text-white"
        style={{ backgroundColor: meta.color }}
      >
        <Icon size={15} />
        <span className="flex-1 text-xs font-semibold">{meta.label}</span>
        {data.nodeType !== "TRIGGER" && (
          <div className="flex items-center gap-1">
            <button
              title="Duplicar"
              onClick={(e) => {
                e.stopPropagation();
                data.onDuplicate(id);
              }}
              className="rounded p-0.5 hover:bg-white/20"
            >
              <Copy size={13} />
            </button>
            <button
              title="Excluir"
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(id);
              }}
              className="rounded p-0.5 hover:bg-white/20"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {isRichMessage ? (
        <div>
          {data.config.mediaType === "image" && data.config.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={String(data.config.mediaUrl)}
              alt=""
              className="h-32 w-full rounded-none border-b border-black/5 object-cover"
            />
          ) : data.config.mediaType && data.config.mediaUrl ? (
            <div className="border-b border-black/5 bg-black/[.03] px-3 py-2 text-[11px] text-foreground/60">
              📎 {String(data.config.mediaType)}: {String(data.config.mediaUrl).slice(0, 30)}...
            </div>
          ) : null}
          <div className="px-3 py-2 text-xs text-foreground/70">
            {data.config.message ? String(data.config.message).slice(0, 90) : "Configure a mensagem"}
          </div>
          {data.config.buttonText ? (
            <div className="mx-3 mb-2 rounded-md border border-brand-green/40 bg-brand-green/5 px-2 py-1.5 text-center text-xs font-medium text-brand-green">
              {String(data.config.buttonText)}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="px-3 py-2 text-xs text-foreground/70">{getSummary(data)}</div>
      )}

      {branching ? (
        <div className="flex flex-col gap-2 px-3 pb-2 text-[10px] text-foreground/50">
          <div className="flex items-center justify-between">
            <span>{labelA}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{labelB}</span>
          </div>
        </div>
      ) : null}

      {branching ? (
        <>
          <Handle type="source" position={Position.Right} id={handleA} style={{ top: "55%" }} />
          <Handle type="source" position={Position.Right} id={handleB} style={{ top: "75%" }} />
        </>
      ) : (
        <Handle type="source" position={Position.Right} />
      )}
    </div>
  );
}
