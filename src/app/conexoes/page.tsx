import Link from "next/link";
import { getConnections } from "@/lib/data/connections";
import { deleteConnection, refreshConnection, toggleConnectionActive } from "@/lib/actions/connections";

const QUALITY_LABELS: Record<string, { label: string; className: string }> = {
  GREEN: { label: "Alta", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  HIGH: { label: "Alta", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  YELLOW: { label: "Média", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300" },
  MEDIUM: { label: "Média", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300" },
  RED: { label: "Baixa", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  LOW: { label: "Baixa", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  UNKNOWN: { label: "Desconhecida", className: "bg-black/10 text-foreground/70 dark:bg-white/10" },
};

export default async function ConexoesPage() {
  const connections = await getConnections();

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conexões</h1>
        <Link
          href="/conexoes/nova"
          className="rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark"
        >
          Nova conexão
        </Link>
      </div>

      {connections.length === 0 && (
        <div className="rounded-lg border border-black/10 px-4 py-10 text-center text-sm text-foreground/60 dark:border-white/15">
          Nenhuma conexão cadastrada ainda. Clique em &quot;Nova conexão&quot; para conectar um
          número do WhatsApp Business (API oficial da Meta).
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {connections.map((c) => {
          const quality = c.qualityRating ? QUALITY_LABELS[c.qualityRating] : undefined;
          return (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-foreground/60">{c.phoneNumber}</p>
                  {c.verifiedName && (
                    <p className="text-xs text-foreground/50">{c.verifiedName}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    c.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-black/10 text-foreground/60 dark:bg-white/10"
                  }`}
                >
                  {c.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    c.businessVerified
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-black/10 text-foreground/60 dark:bg-white/10"
                  }`}
                >
                  {c.businessVerified ? "Empresa verificada" : "Não verificada"}
                </span>
                {quality && (
                  <span className={`rounded-full px-2 py-0.5 ${quality.className}`}>
                    Qualidade: {quality.label}
                  </span>
                )}
              </div>

              <p className="text-xs text-foreground/50">
                {c.lastValidatedAt
                  ? `Validado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(c.lastValidatedAt)}`
                  : "Ainda não validado"}
              </p>

              <div className="flex flex-wrap gap-3 border-t border-black/10 pt-3 text-sm dark:border-white/10">
                <form action={refreshConnection}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-foreground/70 hover:underline">
                    Revalidar
                  </button>
                </form>
                <form action={toggleConnectionActive}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="isActive" value={String(c.isActive)} />
                  <button type="submit" className="text-foreground/70 hover:underline">
                    {c.isActive ? "Desativar" : "Ativar"}
                  </button>
                </form>
                <form action={deleteConnection}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-red-700 hover:underline dark:text-red-400">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
