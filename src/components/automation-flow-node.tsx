"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap, MessageSquare, Tag as TagIcon, Clock, GitBranch, Copy, X } from "lucide-react";
import type { AutomationNodeType } from "@/generated/prisma/enums";

export type FlowNodeData = {
  nodeType: AutomationNodeType;
  config: Record<string, unknown>;
  tagsById: Record<string, { name: string; color: string }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  selected?: boolean;
};

const NODE_META: Record<AutomationNodeType, { label: string; icon: typeof Zap; color: string }> = {
  TRIGGER: { label: "Gatilho", icon: Zap, color: "#128c5f" },
  SEND_MESSAGE: { label: "Enviar mensagem", icon: MessageSquare, color: "#2563eb" },
  APPLY_TAG: { label: "Aplicar tag", icon: TagIcon, color: "#9333ea" },
  DELAY: { label: "Atraso", icon: Clock, color: "#d97706" },
  CONDITIONAL: { label: "Condicional", icon: GitBranch, color: "#dc2626" },
};

const UNIT_LABEL: Record<string, string> = { MINUTES: "min", HOURS: "h", DAYS: "dias" };
const TRIGGER_LABEL: Record<string, string> = {
  KEYWORD: "Palavra-chave recebida",
  TAG_APPLIED: "Tag aplicada",
  NEW_CONTACT: "Novo contato",
};

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
    default:
      return "";
  }
}

export function AutomationFlowNode({ id, data }: NodeProps & { data: FlowNodeData }) {
  const meta = NODE_META[data.nodeType];
  const Icon = meta.icon;

  return (
    <div
      className={`w-64 rounded-lg border-2 bg-white shadow-sm ${
        data.selected ? "border-brand-green" : "border-black/10"
      }`}
      onClick={() => data.onEdit(id)}
    >
      {data.nodeType !== "TRIGGER" && <Handle type="target" position={Position.Top} />}

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

      <div className="px-3 py-2 text-xs text-foreground/70">{getSummary(data)}</div>

      {data.nodeType === "CONDITIONAL" ? (
        <div className="flex justify-between px-3 pb-1.5 text-[10px] text-foreground/50">
          <span>Não</span>
          <span>Sim</span>
        </div>
      ) : null}

      {data.nodeType === "CONDITIONAL" ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: "25%" }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: "75%" }}
          />
        </>
      ) : (
        <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
}
