"use client";

import { useActionState } from "react";
import { importContactsFromCsv } from "@/lib/actions/contacts";

export function ImportContactsForm() {
  const [result, formAction, isPending] = useActionState(importContactsFromCsv, null);

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Arquivo CSV
          <input
            type="file"
            name="file"
            accept=".csv"
            required
            className="rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-md bg-brand-green px-4 py-2 text-sm text-white hover:bg-brand-green-dark disabled:opacity-50"
        >
          {isPending ? "Importando..." : "Importar contatos"}
        </button>
      </form>

      {result && (
        <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
          <p className="font-medium text-green-700 dark:text-green-400">
            {result.createdCount} contato(s) criado(s) com sucesso.
          </p>
          {result.skipped.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-foreground/80">
                {result.skipped.length} linha(s) ignorada(s):
              </p>
              <ul className="flex flex-col gap-1 text-foreground/60">
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    Linha {s.row}: {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
