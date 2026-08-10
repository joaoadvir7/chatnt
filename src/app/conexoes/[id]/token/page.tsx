import Link from "next/link";
import { notFound } from "next/navigation";
import { updateConnectionToken } from "@/lib/actions/connections";
import { getConnectionById } from "@/lib/data/connections";

export default async function AtualizarTokenPage({ params, searchParams }: PageProps<"/conexoes/[id]/token">) {
  const { id } = await params;
  const query = await searchParams;
  const connection = await getConnectionById(id);
  if (!connection) notFound();

  const error = typeof query.error === "string" ? query.error : undefined;

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <div>
        <Link href="/conexoes" className="text-sm text-foreground/60 hover:underline">
          ← Voltar para conexões
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Atualizar token do WhatsApp</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {connection.name} · {connection.phoneNumber}
        </p>
      </div>

      <form action={updateConnectionToken} className="flex max-w-xl flex-col gap-5">
        <input type="hidden" name="id" value={connection.id} />
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <p className="rounded-lg border border-black/10 p-4 text-sm text-foreground/70 dark:border-white/15">
          Cole aqui o token permanente gerado para o usuário do sistema. Ele será validado com a Meta antes de ser salvo.
        </p>
        <label className="flex flex-col gap-1 text-sm">
          Token de acesso permanente
          <textarea
            name="accessToken"
            required
            autoFocus
            rows={5}
            autoComplete="off"
            spellCheck={false}
            className="rounded-md border border-black/10 px-3 py-2 font-mono text-xs dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <button type="submit" className="w-fit rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark">
          Salvar e validar token
        </button>
      </form>
    </div>
  );
}
