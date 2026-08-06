import { ContactForm } from "@/components/contact-form";
import { createContact } from "@/lib/actions/contacts";

export default async function NovoContatoPage({ searchParams }: PageProps<"/contatos/novo">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Novo contato</h1>
      <ContactForm action={createContact} error={error} />
    </div>
  );
}
