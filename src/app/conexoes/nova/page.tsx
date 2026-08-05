import { createConnection } from "@/lib/actions/connections";

export default async function NovaConexaoPage({ searchParams }: PageProps<"/conexoes/nova">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nova conexão</h1>

      <div className="max-w-xl rounded-lg border border-black/10 p-4 text-sm text-foreground/70 dark:border-white/15">
        <p>
          Essas informações vêm do painel{" "}
          <span className="font-medium">developers.facebook.com</span>, dentro do seu App com o
          produto WhatsApp Business configurado. Se ainda não tem isso pronto, me avise que eu te
          guio passo a passo.
        </p>
      </div>

      <form action={createConnection} className="flex max-w-xl flex-col gap-5">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Nome da conexão *
          <input
            type="text"
            name="name"
            required
            placeholder="Ex: Número principal Novo Tempo"
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Número de telefone *
          <input
            type="text"
            name="phoneNumber"
            required
            placeholder="+5511999999999"
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          WhatsApp Business Account ID (WABA ID) *
          <input
            type="text"
            name="wabaId"
            required
            className="rounded-md border border-black/10 px-3 py-2 font-mono text-xs dark:border-white/15 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Phone Number ID *
          <input
            type="text"
            name="phoneNumberId"
            required
            className="rounded-md border border-black/10 px-3 py-2 font-mono text-xs dark:border-white/15 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Access Token (System User, permanente) *
          <textarea
            name="accessToken"
            required
            rows={3}
            className="rounded-md border border-black/10 px-3 py-2 font-mono text-xs dark:border-white/15 dark:bg-transparent"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            Conectar e validar
          </button>
        </div>
      </form>
    </div>
  );
}
