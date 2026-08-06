import { ImportContactsForm } from "@/components/import-contacts-form";

export default function ImportarContatosPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Importar contatos</h1>
      <div className="max-w-xl rounded-lg border border-black/10 p-4 text-sm text-foreground/70 dark:border-white/15">
        <p className="mb-2">O arquivo CSV deve ter uma linha de cabeçalho com estas colunas:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>nome</strong> (obrigatório)
          </li>
          <li>
            <strong>telefone</strong> (obrigatório, com DDI, ex: +5511999999999)
          </li>
          <li>email (opcional)</li>
          <li>tags (opcional, várias tags separadas por vírgula — são criadas automaticamente)</li>
        </ul>
        <p className="mt-2">
          Contatos com telefone já cadastrado são ignorados e listados no resultado.
        </p>
      </div>
      <ImportContactsForm />
    </div>
  );
}
