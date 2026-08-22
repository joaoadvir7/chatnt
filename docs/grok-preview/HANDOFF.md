# Handoff para o próximo programador

Última revisão: **22/08/2026**. Produto em uso real no número de teste WABA.

## Objetivo do produto

CRM de atendimento da Escola Bíblica Novo Tempo:

- Vários números WhatsApp (central + sedes regionais / uniões).
- Live Chat humano + automações + broadcasts (templates Meta).
- Funil: **Lead → Aluno → Jornada → Visita → Estudo**.
- Relatório consolidado na central; cada sede só vê o próprio território.
- Sem faturamento. Tags e campos customizados geram as métricas.

Referência visual: Unnichat. Paleta ChatNT: marinho `#031c45` / `#003878` / `#0050a0` e ouro NT `#f5c400`. **Não copiar o verde Unnichat.**

## O que já funciona no preview Grok

- Live Chat real (envio/recebimento Cloud API, filas Novos/Meus/IA/Finalizados, papel de parede, composer com Enter, templates, áudio, arquivos).
- Nome do contato WhatsApp gravado (`waProfileName`).
- Ice breakers (iniciadores): até 4 × 80 chars, GET/POST `conversational_automation`.
- Automações: canvas com zoom/pan, ligar porta a porta, exclusão de linha, randomizador, condicional, encaminhar (só automações, sem fluxos de broadcast), HTTP, mensagem 24h (texto, mídia, lista, contexto, carrossel, reply + link).
- Broadcasts: pastas, rascunhos, 4 origens, construtor de fluxo próprio, arrastar pastas/cards.
- Conexões: cards Unnichat, Embedded Signup (nova / migrar / existente / coexistência), sem números fictícios.
- Sedes regionais (ícone no header).
- Funil + alertas de gargalo por etiqueta.
- Toggle de automação sem ativar duas; persist merge `uniqueById`.
- Menu da conta: mapa, docs, políticas, encerrar o dia + PIN.

## O que NÃO está pronto (produção)

1. **Dois stacks.** GitHub é Next+Prisma (parado). Grok é TanStack+Zustand (atual). Precisa de uma decisão e um plano de união.
2. **Estado do CRM no Grok vive no `localStorage`.** Não escala, não é multi-usuário de verdade, some se limpar o browser.
3. Webhook inbound: fila em arquivo `/tmp/chatnt-wa-events.json` + poll 2s no cliente. Em deploy multi-instância isso quebra. Use Redis/Postgres.
4. Tokens WABA no Zustand (browser). Mover para servidor (Prisma `WhatsappConnection` no GitHub já existe).
5. Coexistência oficial: o botão dispara `featureType: whatsapp_business_app_onboarding`. Falta sync `history` / `smb_message_echoes` e SMB App Data API em 24h.
6. Mensagem pelo ChatNT **é cobrada pela Meta**. App/Web no modo coexistência não. Não existe “enviar pelo CRM de graça”.
7. Google Sheets, API de conversão, SMS/áudio na ligação: UI de bloco existe; execução incompleta.
8. Atribuição automática, avaliação de atendimento, dashboard da engrenagem: menu Unnichat ainda não portado por completo.
9. Auth Better Auth está no scaffold; o CRM não isola dados por usuário logado (só `sessionScope` central/regional no Zustand).
10. Testes: quase só scripts PWA. Sem suíte do motor de automação.

## Decisão recomendada

**Curto prazo (não perder o trabalho Grok):**
- Copiar `src/` deste preview para um branch `grok-preview` no GitHub.
- Este handoff + docs vão em `docs/grok-preview/`.

**Médio prazo:**
- Ou (A) promover TanStack Start e persistir o Zustand no Prisma.
- Ou (B) reaplicar as telas Grok no Next.js existente, reusando `src/lib/actions/*` e workers Redis.

Não rode os dois em produção.

## Riscos conhecidos

- `useCrmStore(s => s.connections.filter(...))` gera loop infinito (React #185). Sempre selecionar o array cru e filtrar com `useMemo`.
- Toggle de automação: usar `setAutomationActive(id, next)` explícito, não flip cego; não bump `updatedAt` no status.
- Encaminhar automação: excluir `source === "broadcast"` e nomes `Fluxo ·`.
- Botão de link **não** vira porta de fluxo; só reply buttons ramificam.
- Gatilho não tem porta de entrada.
- Demo (`isDemo`) deve permanecer oculto. Não religar seed fictício no Live Chat.

## Contatos / contas

- Produto: João Batista · `joao.advir@gmail.com` · GitHub `joaoadvir7`
- WABA de teste já usada no preview (Phone Number ID no Zustand da conexão `cx_central`).
- App Meta: “Novo Tempo Pará - Igreja Adventista”
