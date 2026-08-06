"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, MessageSquare, Tag as TagIcon, Clock, GitBranch, Save } from "lucide-react";
import { AutomationFlowNode, type FlowNodeData } from "@/components/automation-flow-node";
import { AutomationNodeConfigPanel } from "@/components/automation-node-config-panel";
import { saveAutomationGraph, renameAutomation, toggleAutomationActive } from "@/lib/actions/automations";
import type { getAutomationById } from "@/lib/data/automations";
import type { AutomationNodeType } from "@/generated/prisma/enums";

type Automation = NonNullable<Awaited<ReturnType<typeof getAutomationById>>>;
type Tag = { id: string; name: string; color: string };

const nodeTypes = { flowNode: AutomationFlowNode };

const PALETTE: { type: AutomationNodeType; label: string; icon: typeof MessageSquare }[] = [
  { type: "SEND_MESSAGE", label: "Enviar mensagem", icon: MessageSquare },
  { type: "APPLY_TAG", label: "Aplicar tag", icon: TagIcon },
  { type: "DELAY", label: "Atraso", icon: Clock },
  { type: "CONDITIONAL", label: "Condicional", icon: GitBranch },
];

function toFlowNodes(automation: Automation, tagsById: Record<string, Tag>): Node<FlowNodeData>[] {
  return automation.nodes.map((n) => ({
    id: n.id,
    type: "flowNode",
    position: { x: n.positionX, y: n.positionY },
    data: {
      nodeType: n.type,
      config: (n.config as Record<string, unknown>) ?? {},
      tagsById,
      onEdit: () => {},
      onDelete: () => {},
      onDuplicate: () => {},
    },
  }));
}

function toFlowEdges(automation: Automation): Edge[] {
  return automation.edges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    sourceHandle: e.sourceHandle ?? undefined,
  }));
}

let tempIdCounter = 0;
function newTempId() {
  tempIdCounter += 1;
  return `new-${Date.now()}-${tempIdCounter}`;
}

export function AutomationEditor({ automation, tags }: { automation: Automation; tags: Tag[] }) {
  const tagsById = useMemo(() => Object.fromEntries(tags.map((t) => [t.id, t])), [tags]);

  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>(() => toFlowNodes(automation, tagsById));
  const [edges, setEdges] = useState<Edge[]>(() => toFlowEdges(automation));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [name, setName] = useState(automation.name);
  const [isActive, setIsActive] = useState(automation.isActive);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<FlowNodeData>>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
  );

  function addNode(type: AutomationNodeType) {
    const id = newTempId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "flowNode",
        position: { x: 120 + ((nds.length * 40) % 400), y: 260 + ((nds.length * 60) % 300) },
        data: { nodeType: type, config: {}, tagsById, onEdit: () => {}, onDelete: () => {}, onDuplicate: () => {} },
      },
    ]);
  }

  function deleteNode(id: string) {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }

  function duplicateNode(id: string) {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const newId = newTempId();
    setNodes((nds) => [
      ...nds,
      { ...node, id: newId, position: { x: node.position.x + 30, y: node.position.y + 30 } },
    ]);
  }

  function updateNodeConfig(id: string, config: Record<string, unknown>) {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, config } } : n)));
  }

  const nodesWithHandlers = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
        data: {
          ...n.data,
          selected: n.id === selectedNodeId,
          onEdit: setSelectedNodeId,
          onDelete: deleteNode,
          onDuplicate: duplicateNode,
        },
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, selectedNodeId],
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  async function handleSave() {
    setSaving(true);
    try {
      const { idMap } = await saveAutomationGraph(
        automation.id,
        nodes.map((n) => ({
          id: n.id,
          isNew: n.id.startsWith("new-"),
          type: n.data.nodeType,
          positionX: n.position.x,
          positionY: n.position.y,
          config: n.data.config,
        })),
        edges.map((e) => ({
          sourceNodeId: e.source,
          targetNodeId: e.target,
          sourceHandle: e.sourceHandle ?? null,
        })),
      );

      setNodes((nds) => nds.map((n) => ({ ...n, id: idMap[n.id] ?? n.id })));
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          source: idMap[e.source] ?? e.source,
          target: idMap[e.target] ?? e.target,
        })),
      );
      setSelectedNodeId((cur) => (cur ? (idMap[cur] ?? cur) : cur));
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  async function handleRename() {
    if (name.trim() && name !== automation.name) {
      const fd = new FormData();
      fd.set("id", automation.id);
      fd.set("name", name.trim());
      await renameAutomation(fd);
    }
  }

  async function handleToggleActive() {
    const fd = new FormData();
    fd.set("id", automation.id);
    fd.set("isActive", String(isActive));
    setIsActive((v) => !v);
    await toggleAutomationActive(fd);
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/automacoes" className="text-foreground/50 hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            className="rounded-md border border-transparent px-2 py-1 text-lg font-semibold hover:border-black/10 focus:border-brand-green focus:outline-none"
          />
          <button
            onClick={handleToggleActive}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isActive ? "bg-green-100 text-green-800" : "bg-black/10 text-foreground/60"
            }`}
          >
            {isActive ? "Ativa" : "Inativa"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-foreground/40">
              Salvo às {new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(savedAt)}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-52 shrink-0 flex-col gap-2 border-r border-black/10 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">
            Adicionar passo
          </p>
          {PALETTE.map((item) => (
            <button
              key={item.type}
              onClick={() => addNode(item.type)}
              className="flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-left text-sm hover:bg-black/[.03]"
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {selectedNode && (
          <AutomationNodeConfigPanel
            nodeType={selectedNode.data.nodeType}
            config={selectedNode.data.config}
            tags={tags}
            onChange={(config) => updateNodeConfig(selectedNode.id, config)}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
