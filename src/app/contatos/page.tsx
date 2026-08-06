import Link from "next/link";
import { getContacts } from "@/lib/data/contacts";
import { getTags } from "@/lib/data/tags";

export default async function ContatosPage({ searchParams }: PageProps<"/contatos">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const tagId = typeof params.tag === "string" ? params.tag : "";

  const [contacts, tags] = await Promise.all([
    getContacts({ q: q || undefined, tagId: tagId || undefined }),
    getTags(),
  ]);

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contatos</h1>
        <div className="flex gap-2">
          <Link
            href="/contatos/importar"
            className="rounded-md border border-black/10 px-4 py-2 text-sm hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
          >
            Importar
          </Link>
          <Link
            href="/contatos/novo"
            className="rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark"
          >
            Novo contato
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap gap-3" action="/contatos">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, telefone ou email"
          className="w-72 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
        />
        <select
          name="tag"
          defaultValue={tagId}
          className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
        >
          <option value="">Todas as tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-black/10 px-4 py-2 text-sm hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          Filtrar
        </button>
        {(q || tagId) && (
          <Link
            href="/contatos"
            className="rounded-md px-4 py-2 text-sm text-foreground/60 hover:text-foreground"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/15">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] dark:bg-white/[.06]">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-foreground/60">
                  Nenhum contato encontrado.
                </td>
              </tr>
            )}
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-3">
                  <Link href={`/contatos/${contact.id}`} className="hover:underline">
                    {contact.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{contact.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="rounded-full px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {new Intl.DateTimeFormat("pt-BR").format(contact.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
