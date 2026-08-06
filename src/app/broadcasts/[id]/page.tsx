import { notFound } from "next/navigation";
import Link from "next/link";
import { getBroadcastById } from "@/lib/data/broadcasts";
import { sendBroadcast, deleteBroadcast } from "@/lib/actions/broadcasts";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-black/10 text-foreground/60" },
  SENDING: { label: "Enviando...", className: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Concluído", className: "bg-green-100 text-green-800" },
};

const RECIPIENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  SENT: "Enviado",
  DELIVERED: "Entregue",
  READ: "Lido",
  FAILED: "Falhou",
};

export default async function BroadcastDetailPage({ params }: PageProps<"/broadcasts/[id]">) {
  const { id } = await params;
  const broadcast = await getBroadcastById(id);
  if (!broadcast) notFound();

  const counts = broadcast.recipients.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  const status = STATUS_LABELS[broadcast.status];

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{broadcast.name}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-foreground/60">
            Template: {broadcast.templateName} ({broadcast.templateLanguage}) · Conexão:{" "}
            {broadcast.connection.name}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {broadcast.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          {broadcast.status === "DRAFT" && (
            <>
              <form action={sendBroadcast}>
                <input type="hidden" name="id" value={broadcast.id} />
                <button
                  type="submit"
                  className="rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark"
                >
                  Enviar agora
                </button>
              </form>
              <form action={deleteBroadcast}>
                <input type="hidden" name="id" value={broadcast.id} />
                <button
                  type="submit"
                  className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  Apagar
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          ["Destinatários", broadcast.recipients.length],
          ["Pendentes", counts.PENDING ?? 0],
          ["Enviados", counts.SENT ?? 0],
          ["Lidos", counts.READ ?? 0],
          ["Falhas", counts.FAILED ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-black/10 p-4 text-center">
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-foreground/60">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03]">
            <tr>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Erro</th>
            </tr>
          </thead>
          <tbody>
            {broadcast.recipients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-foreground/60">
                  {broadcast.status === "DRAFT"
                    ? "Ainda não enviado — clique em \"Enviar agora\"."
                    : "Nenhum destinatário."}
                </td>
              </tr>
            )}
            {broadcast.recipients.map((r) => (
              <tr key={r.id} className="border-t border-black/10">
                <td className="px-4 py-3">
                  <Link href={`/contatos/${r.contact.id}`} className="hover:underline">
                    {r.contact.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">{r.contact.phone}</td>
                <td className="px-4 py-3">{RECIPIENT_STATUS_LABELS[r.status] ?? r.status}</td>
                <td className="px-4 py-3 text-red-600">{r.error ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
