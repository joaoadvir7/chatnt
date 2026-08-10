"use client";

import { useState, useTransition, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { createDeal, createPipelineStage, moveDeal } from "@/lib/actions/crm";

type Contact = { id: string; name: string; phone: string };
type Deal = {
  id: string;
  title: string;
  temperature: number;
  contact: {
    name: string;
    phone: string;
    tags: { id: string; name: string; color: string }[];
  };
};
type Stage = { id: string; name: string; color: string; deals: Deal[] };

function heat(temperature: number) {
  if (temperature >= 70) return { icon: "🔥", label: "Quente", className: "bg-orange-50 text-orange-700" };
  if (temperature <= 30) return { icon: "❄️", label: "Frio", className: "bg-sky-50 text-sky-700" };
  return { icon: "🌡️", label: "Morno", className: "bg-amber-50 text-amber-700" };
}

export function CrmKanbanBoard({ pipelineId, initialStages, contacts }: { pipelineId: string; initialStages: Stage[]; contacts: Contact[] }) {
  const router = useRouter();
  const [stages, setStages] = useState(initialStages);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dropStageId, setDropStageId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function onDragStart(event: DragEvent<HTMLElement>, dealId: string, stageId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", dealId);
    event.dataTransfer.setData("application/chatnt-stage", stageId);
    setDraggedDealId(dealId);
  }

  function onDrop(event: DragEvent<HTMLElement>, destinationStageId: string) {
    event.preventDefault();
    const dealId = event.dataTransfer.getData("text/plain") || draggedDealId;
    const sourceStageId = event.dataTransfer.getData("application/chatnt-stage");
    setDropStageId(null);
    setDraggedDealId(null);
    if (!dealId || !sourceStageId || sourceStageId === destinationStageId) return;

    setStages((current) => {
      const source = current.find((stage) => stage.id === sourceStageId);
      const deal = source?.deals.find((item) => item.id === dealId);
      if (!deal) return current;
      return current.map((stage) => {
        if (stage.id === sourceStageId) return { ...stage, deals: stage.deals.filter((item) => item.id !== dealId) };
        if (stage.id === destinationStageId) return { ...stage, deals: [...stage.deals, deal] };
        return stage;
      });
    });

    const formData = new FormData();
    formData.set("dealId", dealId);
    formData.set("stageId", destinationStageId);
    startTransition(async () => {
      await moveDeal(formData);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto pb-5">
      <div className="flex min-w-max items-start gap-5">
        {stages.map((stage) => {
          const isDropTarget = dropStageId === stage.id && draggedDealId;
          return (
            <section
              key={stage.id}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
              onDragEnter={() => setDropStageId(stage.id)}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropStageId(null); }}
              onDrop={(event) => onDrop(event, stage.id)}
              className={`w-[320px] rounded-2xl border p-3 transition ${isDropTarget ? "border-brand-green bg-brand-green/10 ring-2 ring-brand-green/20" : "border-[#d7e5df] bg-[#edf4f1]"}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-3 shadow-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: stage.color }} /><h2 className="truncate font-semibold text-foreground">{stage.name}</h2></div>
                  <p className="mt-1 text-xs font-medium text-foreground/55">Acompanhamento de alunos</p>
                </div>
                <span className="rounded-full bg-brand-green px-2 py-0.5 text-xs font-bold text-white">{stage.deals.length}</span>
              </div>

              <div className="flex min-h-28 flex-col gap-3">
                {stage.deals.length === 0 ? <p className="px-5 py-8 text-center text-sm text-foreground/45">Solte um aluno aqui</p> : null}
                {stage.deals.map((deal) => {
                  const temperature = heat(deal.temperature);
                  return (
                    <article
                      key={deal.id}
                      draggable
                      onDragStart={(event) => onDragStart(event, deal.id, stage.id)}
                      onDragEnd={() => { setDraggedDealId(null); setDropStageId(null); }}
                      className={`cursor-grab rounded-xl border border-[#d7e2df] bg-white p-3 shadow-sm transition hover:border-brand-green/50 hover:shadow-md active:cursor-grabbing ${draggedDealId === deal.id ? "opacity-45" : ""}`}
                      title="Arraste este cartão para outra etapa"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0"><h3 className="truncate font-semibold">{deal.contact.name}</h3><p className="mt-0.5 truncate text-xs text-foreground/55">{deal.contact.phone}</p></div>
                        <span className="text-lg text-foreground/35" aria-hidden>⠿</span>
                      </div>
                      <p className="mt-3 text-sm text-foreground/75">{deal.title}</p>
                      {deal.contact.tags.length > 0 ? <div className="mt-3 flex flex-wrap gap-1">{deal.contact.tags.slice(0, 3).map((tag) => <span key={tag.id} className="max-w-32 truncate rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${tag.color}1f`, color: tag.color }}>{tag.name}</span>)}</div> : null}
                      <div className="mt-3 border-t border-black/5 pt-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${temperature.className}`}>{temperature.icon} {deal.temperature}°</span></div>
                    </article>
                  );
                })}

                <form action={createDeal} className="rounded-xl border border-dashed border-brand-green/35 bg-white/70 p-3">
                  <input type="hidden" name="pipelineId" value={pipelineId} /><input type="hidden" name="stageId" value={stage.id} />
                  <select name="contactId" required defaultValue="" className="mb-2 w-full rounded-lg border border-black/10 bg-white px-2 py-2 text-xs"><option value="" disabled>Escolher aluno…</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} — {contact.phone}</option>)}</select>
                  <input name="title" required placeholder="Ex.: Visita à igreja" className="mb-2 w-full rounded-lg border border-black/10 bg-white px-2 py-2 text-xs" />
                  <input name="temperature" aria-label="Temperatura" type="number" min="0" max="100" defaultValue="50" className="w-full rounded-lg border border-black/10 bg-white px-2 py-2 text-xs" />
                  <button className="mt-2 w-full rounded-lg bg-brand-green px-2 py-2 text-xs font-semibold text-white hover:bg-brand-green-dark">+ Adicionar aluno</button>
                </form>
              </div>
            </section>
          );
        })}
        <form action={createPipelineStage} className="flex w-64 items-start rounded-2xl border border-dashed border-brand-green/35 bg-white/70 p-4"><input type="hidden" name="pipelineId" value={pipelineId} /><div className="w-full"><input name="name" required placeholder="Nova etapa" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm" /><button className="mt-2 text-sm font-semibold text-brand-green hover:underline">+ Adicionar etapa</button></div></form>
      </div>
    </div>
  );
}
