import { getTags } from "@/lib/data/tags";
import { getCustomFields } from "@/lib/data/custom-fields";
import type { getContactById } from "@/lib/data/contacts";

type Contact = NonNullable<Awaited<ReturnType<typeof getContactById>>>;

export async function ContactForm({
  contact,
  action,
  error,
}: {
  contact?: Contact;
  action: (formData: FormData) => void;
  error?: string;
}) {
  const [tags, customFields] = await Promise.all([getTags(), getCustomFields()]);

  const selectedTagIds = new Set(contact?.tags.map((t) => t.tagId) ?? []);
  const valuesByFieldId = new Map(
    contact?.customFieldValues.map((v) => [v.customFieldId, v.value]) ?? [],
  );

  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      {contact && <input type="hidden" name="id" value={contact.id} />}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Nome *
        <input
          type="text"
          name="name"
          required
          defaultValue={contact?.name}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Telefone *
        <input
          type="text"
          name="phone"
          required
          placeholder="+5511999999999"
          defaultValue={contact?.phone}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          defaultValue={contact?.email ?? ""}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Origem
        <input
          type="text"
          name="source"
          placeholder="TV, revista, formulário..."
          defaultValue={contact?.source ?? ""}
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Tags</legend>
        {tags.length === 0 && (
          <p className="text-sm text-foreground/60">
            Nenhuma tag cadastrada ainda. Crie em Tags.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                defaultChecked={selectedTagIds.has(tag.id)}
              />
              <span
                className="rounded-full px-2 py-0.5 text-xs text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {customFields.length > 0 && (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-sm font-medium">Campos customizados</legend>
          {customFields.map((field) => {
            const value = valuesByFieldId.get(field.id) ?? "";
            const inputName = `cf_${field.id}`;

            if (field.type === "SELECT") {
              const options = Array.isArray(field.options) ? (field.options as string[]) : [];
              return (
                <label key={field.id} className="flex flex-col gap-1 text-sm">
                  {field.name}
                  <select
                    name={inputName}
                    defaultValue={value}
                    className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
                  >
                    <option value="">Selecione...</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field.type === "BOOLEAN") {
              return (
                <label key={field.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={inputName} value="true" defaultChecked={value === "true"} />
                  {field.name}
                </label>
              );
            }

            const inputType =
              field.type === "DATE" ? "date" : field.type === "NUMBER" ? "number" : "text";

            return (
              <label key={field.id} className="flex flex-col gap-1 text-sm">
                {field.name}
                <input
                  type={inputType}
                  name={inputName}
                  defaultValue={value}
                  className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
                />
              </label>
            );
          })}
        </fieldset>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          {contact ? "Salvar alterações" : "Criar contato"}
        </button>
      </div>
    </form>
  );
}
