import { getTags } from "@/lib/data/tags";
import { createTag, deleteTag } from "@/lib/actions/tags";

export default async function TagsPage({ searchParams }: PageProps<"/tags">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const tags = await getTags();

  return (
    <div className="flex w-full flex-col gap-8 rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Tags</h1>

      <form action={createTag} className="flex max-w-lg flex-wrap items-end gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Nome
          <input
            type="text"
            name="name"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Cor
          <input
            type="color"
            name="color"
            defaultValue="#6366F1"
            className="h-[38px] w-14 rounded-md border border-black/10 dark:border-white/15"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark"
        >
          Criar tag
        </button>
      </form>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <ul className="flex flex-col divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/15">
        {tags.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-foreground/60">
            Nenhuma tag cadastrada ainda.
          </li>
        )}
        {tags.map((tag) => (
          <li key={tag.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="rounded-full px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
              <span className="text-sm text-foreground/60">
                {tag._count.contacts} contato(s)
              </span>
            </div>
            <form action={deleteTag}>
              <input type="hidden" name="id" value={tag.id} />
              <button type="submit" className="text-sm text-red-700 hover:underline dark:text-red-400">
                Apagar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
