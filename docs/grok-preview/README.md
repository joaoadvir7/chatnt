# ChatNT — leia isto primeiro

**ChatNT** é o CRM de atendimento WhatsApp da **Escola Bíblica Novo Tempo**.
Não é um clone comercial do Unnichat: o Unnichat é só a referência de UX.
O funil é de captação de alunos (Lead → Aluno → Jornada → Visita → Estudo), **sem valores financeiros**.

Data desta documentação: **22 de agosto de 2026**.

---

## Há dois códigos. Não misture.

| | Repositório GitHub `joaoadvir7/chatnt` | Preview Grok (workspace TanStack) |
|---|---|---|
| Última atualização | 10/08/2026 | 22/08/2026 (fonte de verdade da UX) |
| Stack | Next.js App Router + Prisma + Redis queues | TanStack Start + Zustand persist + Graph API |
| Banco | PostgreSQL (Prisma) | `localStorage` (`atendimento-nt-v17-name-fix`) + PGLite só para auth |
| Live Chat / automação visual | Parcial | Quase paridade Unnichat |
| O que é | Base persistente pensada para produção | Protótipo operacional real (número de teste WABA já envia) |

**O próximo programador deve:**

1. Tratar o **preview Grok** como especificação viva (telas, fluxos, regras de negócio).
2. Tratar o **GitHub Next.js** como candidato a backend persistente (Prisma já tem Contact, Conversation, Automation, Broadcast, CRM).
3. **Não** reescrever a UX do zero. Portar o que está no Grok para o GitHub **ou** promover o stack Grok e ligar Prisma por trás do Zustand.

João (produto): [joaoadvir7](https://github.com/joaoadvir7) · `joao.advir@gmail.com`.

---

## Como rodar o preview Grok

```bash
npm install
npm run dev          # 0.0.0.0:8080
npx tsc --noEmit
```

Persistência do CRM: Zustand `persist` no navegador. Limpar o storage apaga conversas reais do preview.

---

## Índice

1. [HANDOFF.md](./HANDOFF.md) — o que está pronto, o que falta, riscos
2. [ARQUITETURA.md](./ARQUITETURA.md) — pastas, dados, rotas
3. [DOMINIO.md](./DOMINIO.md) — sedes, funil, tags, papéis
4. [WHATSAPP.md](./WHATSAPP.md) — Cloud API, webhook, coexistência, ice breakers
5. [MODULOS.md](./MODULOS.md) — cada tela e o arquivo correspondente
6. [CONVENCOES.md](./CONVENCOES.md) — como continuar sem quebrar o produto
7. [DIARIO.md](./DIARIO.md) — encerramento do dia e histórico
