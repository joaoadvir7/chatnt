import Link from "next/link";
import { getBroadcasts } from "@/lib/data/broadcasts";
import { deleteBroadcast } from "@/lib/actions/broadcasts";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-black/10 text-foreground/60" },
  SENDING: { label: "Enviando...", className: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Concluído", className: "bg-green-100 text-green-800" },
};

export default async function BroadcastsPage() {
  const broadcasts = await getBroadcasts();

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Broadcasts</h1>
        <Link
          href="/broadcasts/novo"
          className="rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark"
        >
          Novo broadcast
        </Link>
      </div>

      {broadcasts.length === 0 && (
        <div className="rounded-lg border border-black/10 px-4 py-10 text-center text-sm text-foreground/60">
          Nenhum broadcast criado ainda.
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-black/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03]">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Destinatários</th>
              <th className="px-4 py-3 font-medium">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {broadcasts.map((b) => {
              const status = STATUS_LABELS[b.status];
              return (
                <tr key={b.id} className="border-t border-black/10">
                  <td className="px-4 py-3">
                    <Link href={`/broadcasts/${b.id}`} className="font-medium hover:underline">
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{b.templateName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{b._count.recipients}</td>
                  <td className="px-4 py-3 text-foreground/60">
                    {new Intl.DateTimeFormat("pt-BR").format(b.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {b.status === "DRAFT" && (
                      <form action={deleteBroadcast} className="inline">
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" className="text-red-600 hover:underline">
                          Apagar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
