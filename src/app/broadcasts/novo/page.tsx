import { getTags } from "@/lib/data/tags";
import { getConnections } from "@/lib/data/connections";
import { fetchApprovedTemplates } from "@/lib/meta/graph-api";
import { prisma } from "@/lib/prisma";
import { BroadcastForm } from "@/components/broadcast-form";

export default async function NovoBroadcastPage({ searchParams }: PageProps<"/broadcasts/novo">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  const [tags, connections] = await Promise.all([getTags(), getConnections()]);
  const activeConnection = connections.find((c) => c.isActive);

  let templates: { name: string; language: string; category: string; bodyPreview?: string }[] = [];
  let templatesError: string | undefined;

  if (activeConnection) {
    const full = await prisma.whatsAppConnection.findUnique({
      where: { id: activeConnection.id },
    });
    if (full) {
      try {
        templates = await fetchApprovedTemplates(full.wabaId, full.accessToken);
      } catch (e) {
        templatesError = e instanceof Error ? e.message : "Erro ao buscar templates";
      }
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold">Novo broadcast</h1>

      {!activeConnection && (
        <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Nenhuma conexão de WhatsApp ativa. Configure uma em Conexões antes de criar um
          broadcast.
        </p>
      )}

      {templatesError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar os templates da Meta: {templatesError}
        </p>
      )}

      {activeConnection && !templatesError && templates.length === 0 && (
        <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Nenhum template aprovado encontrado nessa conexão. Crie e aguarde a aprovação de um
          template no Business Manager da Meta antes de enviar um broadcast.
        </p>
      )}

      <BroadcastForm
        tags={tags}
        connectionId={activeConnection?.id ?? ""}
        templates={templates}
        error={error}
      />
    </div>
  );
}
