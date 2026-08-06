import { notFound } from "next/navigation";
import { getAutomationById } from "@/lib/data/automations";
import { getTags } from "@/lib/data/tags";
import { AutomationEditor } from "@/components/automation-editor";

export default async function AutomationEditorPage({ params }: PageProps<"/automacoes/[id]">) {
  const { id } = await params;

  const [automation, tags] = await Promise.all([getAutomationById(id), getTags()]);
  if (!automation) notFound();

  return <AutomationEditor automation={automation} tags={tags} />;
}
