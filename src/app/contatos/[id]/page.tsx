import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { getContactById } from "@/lib/data/contacts";
import { updateContact, deleteContact } from "@/lib/actions/contacts";
import { getConnections } from "@/lib/data/connections";
import { startConversation } from "@/lib/actions/conversations";

export default async function EditarContatoPage({
  params,
  searchParams,
}: PageProps<"/contatos/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;

  const [contact, connections] = await Promise.all([getContactById(id), getConnections()]);
  if (!contact) notFound();

  const activeConnections = connections.filter((c) => c.isActive);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{contact.name}</h1>
        <div className="flex items-center gap-3">
          {activeConnections.length > 0 && (
            <form action={startConversation}>
              <input type="hidden" name="contactId" value={contact.id} />
              <input type="hidden" name="connectionId" value={activeConnections[0].id} />
              <button
                type="submit"
                className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
              >
                Iniciar conversa
              </button>
            </form>
          )}
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
      </div>
      <ContactForm contact={contact} action={updateContact} error={error} />
    </div>
  );
}
