import { createDeal, createPipeline, createPipelineStage, moveDeal } from "@/lib/actions/crm";
import { getContactsForDeals, getPipelineBoard, getPipelines } from "@/lib/data/crm";

function heatLabel(temperature: number) {
  if (temperature >= 70) return { icon: "🔥", label: "Quente", className: "text-orange-600" };
  if (temperature <= 30) return { icon: "❄️", label: "Frio", className: "text-sky-600" };
  return { icon: "🌡️", label: "Morno", className: "text-amber-600" };
}

function money(value: { toNumber(): number }) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value.toNumber());
}

export default async function CrmPage({ searchParams }: PageProps<"/crm">) {
  const params = await searchParams;
  const pipelines = await getPipelines();
  const selectedId = typeof params.pipeline === "string" ? params.pipeline : pipelines[0]?.id;
  const [board, contacts] = await Promise.all([
    selectedId ? getPipelineBoard(selectedId) : null,
    getContactsForDeals(),
  ]);

  return (
    <div className="flex min-h-full flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-brand-green">CRM</p>
          <h1 className="text-2xl font-semibold">Visitas e Estudos Bíblicos</h1>
          <p className="mt-1 text-sm text-foreground/60">Acompanhe cada aluno desde o primeiro contato até o estudo agendado.</p>
        </div>
        <form action={createPipeline} className="flex flex-wrap gap-2">
          <input name="name" required placeholder="Nome do novo pipeline" className="rounded-md border border-black/10 px-3 py-2 text-sm" />
          <button className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark">Novo pipeline</button>
        </form>
      </div>

      {pipelines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-green/30 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold">Crie o primeiro pipeline</h2>
          <p className="mt-2 text-sm text-foreground/60">Ex.: Visitas e Estudos Bíblicos 2026.</p>
        </div>
      ) : board ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <form className="flex items-center gap-2" action="/crm">
              <label className="text-sm font-medium">Pipeline</label>
              <select name="pipeline" defaultValue={board.id} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm">
                {pipelines.map((pipeline) => <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>)}
              </select>
              <button className="rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-black/10">Abrir</button>
            </form>
            <div className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm"><span className="text-foreground/60">Negócios: </span><strong>{board.stages.reduce((total, stage) => total + stage.deals.length, 0)}</strong></div>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex min-w-max gap-4">
              {board.stages.map((stage) => {
                const total = stage.deals.reduce((sum, deal) => sum + deal.value.toNumber(), 0);
                return (
                  <section key={stage.id} className="w-80 rounded-xl bg-[#e5efeb] p-3">
                    <div className="mb-3 flex items-start justify-between gap-3 px-1">
                      <div>
                        <h2 className="font-semibold">{stage.name} <span className="text-sm font-normal text-foreground/55">({stage.deals.length})</span></h2>
                        <p className="text-xs text-foreground/55">{money({ toNumber: () => total })}</p>
                      </div>
                      <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ background: stage.color }} />
                    </div>
                    <div className="flex flex-col gap-3">
                      {stage.deals.map((deal) => {
                        const heat = heatLabel(deal.temperature);
                        return (
                          <article key={deal.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0"><h3 className="truncate font-medium">{deal.contact.name}</h3><p className="truncate text-xs text-foreground/55">{deal.contact.phone}</p></div>
                              <span title={heat.label} className={`text-sm ${heat.className}`}>{heat.icon} {deal.temperature}°</span>
                            </div>
                            <p className="mt-3 text-sm text-foreground/75">{deal.title}</p>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {deal.contact.tags.slice(0, 3).map(({ tag }) => <span key={tag.id} className="rounded-full px-2 py-0.5 text-[11px]" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>{tag.name}</span>)}
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-2 border-t border-black/5 pt-3"><strong className="text-sm">{money(deal.value)}</strong><form action={moveDeal} className="flex items-center gap-1"><input type="hidden" name="dealId" value={deal.id} /><select name="stageId" defaultValue={stage.id} className="max-w-28 rounded border border-black/10 bg-white px-1 py-1 text-xs">{board.stages.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select><button className="text-xs font-medium text-brand-green hover:underline">Mover</button></form></div>
                          </article>
                        );
                      })}
                      <form action={createDeal} className="rounded-lg border border-dashed border-brand-green/35 bg-white/60 p-3">
                        <input type="hidden" name="pipelineId" value={board.id} /><input type="hidden" name="stageId" value={stage.id} />
                        <select name="contactId" required defaultValue="" className="mb-2 w-full rounded border border-black/10 bg-white px-2 py-1.5 text-xs"><option value="" disabled>Escolher aluno…</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} — {contact.phone}</option>)}</select>
                        <input name="title" required placeholder="Ex.: Visita à igreja" className="mb-2 w-full rounded border border-black/10 bg-white px-2 py-1.5 text-xs" />
                        <div className="flex gap-2"><input name="temperature" type="number" min="0" max="100" defaultValue="50" className="w-16 rounded border border-black/10 bg-white px-2 py-1.5 text-xs" /><input name="value" type="number" min="0" step="0.01" defaultValue="0" className="min-w-0 flex-1 rounded border border-black/10 bg-white px-2 py-1.5 text-xs" /></div>
                        <button className="mt-2 w-full rounded bg-brand-green px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-green-dark">+ Adicionar aluno</button>
                      </form>
                    </div>
                  </section>
                );
              })}
              <form action={createPipelineStage} className="flex w-64 items-start rounded-xl border border-dashed border-brand-green/35 bg-white/60 p-4"><input type="hidden" name="pipelineId" value={board.id} /><div className="w-full"><input name="name" required placeholder="Nova etapa" className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm" /><button className="mt-2 text-sm font-medium text-brand-green hover:underline">+ Adicionar etapa</button></div></form>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
