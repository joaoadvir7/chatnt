import { CrmKanbanBoard } from "@/components/crm-kanban-board";
import { createPipeline } from "@/lib/actions/crm";
import { getContactsForDeals, getPipelineBoard, getPipelines } from "@/lib/data/crm";

export default async function CrmPage({ searchParams }: PageProps<"/crm">) {
  const params = await searchParams;
  const pipelines = await getPipelines();
  const selectedId = typeof params.pipeline === "string" ? params.pipeline : pipelines[0]?.id;
  const [board, contacts] = await Promise.all([selectedId ? getPipelineBoard(selectedId) : null, getContactsForDeals()]);

  return (
    <div className="flex min-h-full flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
        <div><p className="text-sm font-medium text-brand-green">CRM</p><h1 className="text-2xl font-semibold">Visitas e Estudos Bíblicos</h1><p className="mt-1 text-sm text-foreground/60">Acompanhe cada aluno desde o primeiro contato até o estudo agendado.</p></div>
        <form action={createPipeline} className="flex flex-wrap gap-2"><input name="name" required placeholder="Nome do novo pipeline" className="rounded-md border border-black/10 px-3 py-2 text-sm" /><button className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white hover:bg-brand-green-dark">Novo pipeline</button></form>
      </div>

      {pipelines.length === 0 ? <div className="rounded-xl border border-dashed border-brand-green/30 bg-white p-12 text-center"><h2 className="text-lg font-semibold">Crie o primeiro pipeline</h2><p className="mt-2 text-sm text-foreground/60">Ex.: Visitas e Estudos Bíblicos 2026.</p></div> : board ? <>
        <div className="flex flex-wrap items-center justify-between gap-3"><form className="flex items-center gap-2" action="/crm"><label className="text-sm font-medium">Pipeline</label><select name="pipeline" defaultValue={board.id} className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm">{pipelines.map((pipeline) => <option key={pipeline.id} value={pipeline.id}>{pipeline.name}</option>)}</select><button className="rounded-md bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-black/10">Abrir</button></form><div className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm"><span className="text-foreground/60">Negócios: </span><strong>{board.stages.reduce((total, stage) => total + stage.deals.length, 0)}</strong></div></div>
        <CrmKanbanBoard pipelineId={board.id} contacts={contacts} initialStages={board.stages.map((stage) => ({ id: stage.id, name: stage.name, color: stage.color, deals: stage.deals.map((deal) => ({ id: deal.id, title: deal.title, temperature: deal.temperature, value: deal.value.toNumber(), contact: { name: deal.contact.name, phone: deal.contact.phone, tags: deal.contact.tags.map(({ tag }) => ({ id: tag.id, name: tag.name, color: tag.color })) } })) }))} />
      </> : null}
    </div>
  );
}
