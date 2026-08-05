import { getCustomFields } from "@/lib/data/custom-fields";
import { createCustomField, deleteCustomField } from "@/lib/actions/custom-fields";

const TYPE_LABELS: Record<string, string> = {
  TEXT: "Texto",
  NUMBER: "Número",
  DATE: "Data",
  BOOLEAN: "Sim/Não",
  SELECT: "Lista de opções",
};

export default async function CamposCustomizadosPage({
  searchParams,
}: PageProps<"/campos-customizados">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const fields = await getCustomFields();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Campos Customizados</h1>

      <form action={createCustomField} className="flex max-w-lg flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Nome do campo
          <input
            type="text"
            name="name"
            required
            placeholder="Distrito, Turma, Variante..."
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select
            name="type"
            defaultValue="TEXT"
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Opções (apenas para tipo &quot;Lista de opções&quot;, separadas por vírgula)
          <input
            type="text"
            name="options"
            placeholder="Opção A, Opção B, Opção C"
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <button
          type="submit"
          className="mt-2 w-fit rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Criar campo
        </button>
      </form>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <ul className="flex flex-col divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/15">
        {fields.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-foreground/60">
            Nenhum campo customizado cadastrado ainda.
          </li>
        )}
        {fields.map((field) => (
          <li key={field.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{field.name}</span>
              <span className="text-xs text-foreground/60">
                {TYPE_LABELS[field.type]} · chave: {field.key} · {field._count.values} valor(es)
                preenchido(s)
              </span>
            </div>
            <form action={deleteCustomField}>
              <input type="hidden" name="id" value={field.id} />
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
