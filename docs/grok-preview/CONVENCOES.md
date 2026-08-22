# Convenções

- Paleta marinho/ouro. Sem verde Unnichat.
- Demo off. `isDemo` oculto na operação.
- Zustand: nunca `useCrmStore(s => s.x.filter())` — loop React #185.
- Estado novo: `types.ts` + `seed()` + `partialize` + `merge`.
- Token Meta nunca no log.
- `tsc --noEmit` depois de mudar tipos/store.
- Mudou automação → fluxo do broadcast acompanha.
