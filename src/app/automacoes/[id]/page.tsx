import { notFound } from "next/navigation";
import { getAutomationById, getAutomations } from "@/lib/data/automations";
import { getTags } from "@/lib/data/tags";
import { AutomationEditor } from "@/components/automation-editor";

export default async function AutomationEditorPage({ params }: PageProps<"/automacoes/[id]">) {
  const { id } = await params;

  const [automation, tags, allAutomations] = await Promise.all([
    getAutomationById(id),
    getTags(),
    getAutomations({}),
  ]);
  if (!automation) notFound();

  const otherAutomations = allAutomations
    .filter((a) => a.id !== id)
    .map((a) => ({ id: a.id, name: a.name }));

  return <AutomationEditor automation={automation} tags={tags} automations={otherAutomations} />;
}
