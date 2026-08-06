"use client";

import { useState, useTransition } from "react";
import { previewAudienceCount, saveDraft, createAndSend } from "@/lib/actions/broadcasts";

type Tag = { id: string; name: string; color: string };
type Template = { name: string; language: string; category: string; bodyPreview?: string };

export function BroadcastForm({
  tags,
  connectionId,
  templates,
  error,
}: {
  tags: Tag[];
  connectionId: string;
  templates: Template[];
  error?: string;
}) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTag(tagId: string) {
    const next = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    setSelectedTagIds(next);
    startTransition(async () => {
      const c = await previewAudienceCount(next);
      setCount(c);
    });
  }

  return (
    <form className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="connectionId" value={connectionId} />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Nome do broadcast
        <input
          type="text"
          name="name"
          required
          placeholder="ex: Convite pra estudo bíblico — agosto"
          className="rounded-md border border-black/10 px-3 py-2 text-sm"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Público-alvo (contatos com alguma dessas tags)</legend>
        {tags.length === 0 && (
          <p className="text-sm text-foreground/60">Nenhuma tag cadastrada ainda.</p>
        )}
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
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
        <p className="mt-1 text-sm text-foreground/60">
          {isPending
            ? "Calculando..."
            : count === null
              ? "Selecione ao menos uma tag para ver quantos contatos serão atingidos."
              : `${count} contato(s) serão atingidos.`}
        </p>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Template aprovado
        <select
          name="template"
          required
          disabled={templates.length === 0}
          className="rounded-md border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Selecione...</option>
          {templates.map((t) => (
            <option key={`${t.name}|${t.language}`} value={`${t.name}|${t.language}`}>
              {t.name} ({t.language}) — {t.category}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          formAction={saveDraft}
          className="rounded-md border border-black/10 px-4 py-2 text-sm hover:bg-black/[.03]"
        >
          Salvar como rascunho
        </button>
        <button
          type="submit"
          formAction={createAndSend}
          disabled={!connectionId || templates.length === 0}
          className="rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark disabled:opacity-50"
        >
          Enviar agora
        </button>
      </div>
    </form>
  );
}
