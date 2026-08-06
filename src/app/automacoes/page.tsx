import Link from "next/link";
import { getAutomationFolders, getAutomations } from "@/lib/data/automations";
import {
  createAutomationFolder,
  deleteAutomationFolder,
} from "@/lib/actions/automation-folders";
import { createAutomation, deleteAutomation, toggleAutomationActive } from "@/lib/actions/automations";

export default async function AutomacoesPage({ searchParams }: PageProps<"/automacoes">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const folderId = typeof params.folder === "string" ? params.folder : undefined;
  const q = typeof params.q === "string" ? params.q : "";

  const [folders, automations] = await Promise.all([
    getAutomationFolders(),
    getAutomations({ folderId, q: q || undefined }),
  ]);

  return (
    <div className="flex w-full gap-6">
      <aside className="flex w-64 shrink-0 flex-col gap-4 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground/70">Pastas</h2>
        <form action={createAutomationFolder} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="Nova pasta"
            required
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm outline-none focus:border-brand-green"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-brand-green px-2 py-1.5 text-xs text-white hover:bg-brand-green-dark"
          >
            Criar
          </button>
        </form>

        <nav className="flex flex-col gap-1">
          <Link
            href="/automacoes"
            className={`rounded-md px-2 py-1.5 text-sm ${
              !folderId ? "bg-brand-green/10 font-medium text-brand-green" : "text-foreground/70 hover:bg-black/5"
            }`}
          >
            Todas
          </Link>
          {folders.map((folder) => (
            <div key={folder.id} className="group flex items-center justify-between">
              <Link
                href={`/automacoes?folder=${folder.id}`}
                className={`flex-1 truncate rounded-md px-2 py-1.5 text-sm ${
                  folderId === folder.id
                    ? "bg-brand-green/10 font-medium text-brand-green"
                    : "text-foreground/70 hover:bg-black/5"
                }`}
              >
                {folder.name} ({folder._count.automations})
              </Link>
              <form action={deleteAutomationFolder}>
                <input type="hidden" name="id" value={folder.id} />
                <button
                  type="submit"
                  className="hidden px-1 text-xs text-red-500 hover:underline group-hover:inline"
                >
                  apagar
                </button>
              </form>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Automações</h1>
          <form action={createAutomation} className="flex gap-2">
            {folderId && <input type="hidden" name="folderId" value={folderId} />}
            <input
              type="text"
              name="name"
              placeholder="Nome da nova automação"
              required
              className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
            <button
              type="submit"
              className="rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark"
            >
              Nova automação
            </button>
          </form>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <form className="flex gap-3" action="/automacoes">
          {folderId && <input type="hidden" name="folder" value={folderId} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar automação..."
            className="w-72 rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green"
          />
          <button
            type="submit"
            className="rounded-md border border-black/10 px-4 py-2 text-sm hover:bg-black/[.03]"
          >
            Buscar
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-black/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/[.03]">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Pasta</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Execuções</th>
                <th className="px-4 py-3 font-medium">Atualizada em</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {automations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-foreground/60">
                    Nenhuma automação encontrada.
                  </td>
                </tr>
              )}
              {automations.map((a) => (
                <tr key={a.id} className="border-t border-black/10">
                  <td className="px-4 py-3">
                    <Link href={`/automacoes/${a.id}`} className="font-medium hover:underline">
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{a.folder?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        a.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-black/10 text-foreground/60"
                      }`}
                    >
                      {a.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{a._count.runs}</td>
                  <td className="px-4 py-3 text-foreground/60">
                    {new Intl.DateTimeFormat("pt-BR").format(a.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <form action={toggleAutomationActive}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="isActive" value={String(a.isActive)} />
                        <button type="submit" className="text-foreground/60 hover:underline">
                          {a.isActive ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <form action={deleteAutomation}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="text-red-600 hover:underline">
                          Apagar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
