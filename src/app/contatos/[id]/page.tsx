import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { getContactById } from "@/lib/data/contacts";
import { updateContact, deleteContact } from "@/lib/actions/contacts";

export default async function EditarContatoPage({
  params,
  searchParams,
}: PageProps<"/contatos/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const contact = await getContactById(id);
  if (!contact) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{contact.name}</h1>
        <form action={deleteContact}>
          <input type="hidden" name="id" value={contact.id} />
          <button
            type="submit"
            className="rounded-md border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Excluir contato
          </button>
        </form>
      </div>
      <ContactForm contact={contact} action={updateContact} error={error} />
    </div>
  );
}
