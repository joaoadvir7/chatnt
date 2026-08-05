"use client";

import { useActionState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "@/lib/actions/conversations";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [state, formAction, isPending] = useActionState(sendMessage, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isPending && !state?.error) {
      formRef.current?.reset();
    }
  }, [isPending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <input type="hidden" name="conversationId" value={conversationId} />
        <input
          type="text"
          name="content"
          required
          placeholder="Digite uma mensagem..."
          className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark disabled:opacity-50"
        >
          <Send size={16} />
          {isPending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
