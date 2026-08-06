"use client";

import Link from "next/link";
import { X, Pencil, ChevronDown, StickyNote, Bell, ClipboardList, SlidersHorizontal, Layers } from "lucide-react";
import { createNote, deleteNote } from "@/lib/actions/notes";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { getConversationById } from "@/lib/data/conversations";

type Contact = NonNullable<Awaited<ReturnType<typeof getConversationById>>>["contact"];

function AccordionSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-black/10" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Icon size={16} />
          {title}
        </span>
        <ChevronDown size={16} className="text-foreground/40 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

function ComingSoon() {
  return <p className="text-xs text-foreground/40">Em breve.</p>;
}

export function ContactInfoPanel({
  contact,
  conversationId,
  onClose,
}: {
  contact: Contact;
  conversationId: string;
  onClose: () => void;
}) {
  return (
    <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-black/10">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <h2 className="font-semibold">Informações do contato</h2>
        <button onClick={onClose} className="text-foreground/50 hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 border-b border-black/10 py-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-bg text-xl font-semibold text-white">
          {contact.name.slice(0, 1).toUpperCase()}
        </span>
        <p className="font-semibold">{contact.name}</p>
        <p className="text-sm text-foreground/50">{contact.phone}</p>
      </div>

      <AccordionSection title="Anotações" icon={StickyNote} defaultOpen>
        <form action={createNote} className="mb-3 flex flex-col gap-2">
          <input type="hidden" name="contactId" value={contact.id} />
          <input type="hidden" name="conversationId" value={conversationId} />
          <textarea
            name="content"
            required
            placeholder="Escrever uma anotação..."
            rows={2}
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm outline-none focus:border-brand-green"
          />
          <button
            type="submit"
            className="w-fit rounded-md bg-brand-green px-3 py-1 text-xs text-white hover:bg-brand-green-dark"
          >
            Salvar anotação
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {contact.notes.length === 0 && (
            <p className="text-xs text-foreground/40">Nenhuma anotação ainda.</p>
          )}
          {contact.notes.map((note) => (
            <div key={note.id} className="rounded-md bg-black/[.03] px-2 py-1.5 text-xs">
              <p className="whitespace-pre-wrap">{note.content}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-foreground/40">
                <span>{formatRelativeTime(note.createdAt)}</span>
                <form action={deleteNote}>
                  <input type="hidden" name="id" value={note.id} />
                  <input type="hidden" name="contactId" value={contact.id} />
                  <input type="hidden" name="conversationId" value={conversationId} />
                  <button type="submit" className="text-red-500 hover:underline">
                    apagar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Lembretes" icon={Bell}>
        <ComingSoon />
      </AccordionSection>

      <AccordionSection title="Atividades" icon={ClipboardList}>
        <ComingSoon />
      </AccordionSection>

      <AccordionSection title="Campos customizados" icon={SlidersHorizontal}>
        {contact.customFieldValues.length === 0 ? (
          <p className="text-xs text-foreground/40">Nenhum campo preenchido.</p>
        ) : (
          <dl className="flex flex-col gap-2 text-xs">
            {contact.customFieldValues.map((v) => (
              <div key={v.id}>
                <dt className="text-foreground/50">{v.customField.name}</dt>
                <dd className="font-medium">{v.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <Link
          href={`/contatos/${contact.id}`}
          className="mt-2 inline-block text-xs text-brand-green hover:underline"
        >
          Editar no cadastro do contato
        </Link>
      </AccordionSection>

      <AccordionSection title="CRM - Negócios" icon={Layers}>
        <ComingSoon />
      </AccordionSection>

      <div className="px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tags do contato</h3>
          <Link href={`/contatos/${contact.id}`} className="text-foreground/40 hover:text-foreground">
            <Pencil size={14} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.length === 0 && <p className="text-xs text-foreground/40">Sem tags.</p>}
          {contact.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="rounded-full px-2 py-0.5 text-xs text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
