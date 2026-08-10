# Passagem do projeto para o Grok — ChatNT

## Objetivo

ChatNT é o CRM de atendimento via WhatsApp da Escola Bíblica / Novo Tempo. Ele substitui gradualmente o Unnichat e usa exclusivamente a API oficial WhatsApp Cloud API da Meta.

## Tecnologias

- Next.js 16, React 19, TypeScript e Tailwind CSS
- PostgreSQL com Prisma 7 (`@prisma/adapter-pg`)
- Redis + BullMQ para automações e broadcasts
- WhatsApp Cloud API (Meta)
- Docker Compose para PostgreSQL e Redis locais

## Como executar localmente

```bash
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para receber eventos da Meta durante o desenvolvimento local, execute em outro terminal:

```bash
ngrok http 3000
```

O Callback URL da Meta deve apontar para:

```text
https://SEU-ENDERECO-NGROK/api/webhooks/whatsapp
```

## Variáveis de ambiente

Nunca versionar nem pedir que tokens sejam colocados em arquivos rastreados pelo Git.

- `DATABASE_URL`
- `REDIS_URL`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

O token permanente da Meta fica salvo apenas no banco local/servidor, dentro da conexão WhatsApp cadastrada no ChatNT. Não deve ser exposto em logs, commits, prints ou conversas.

## Estado atual

Implementado e funcional localmente:

- Contatos, tags, campos customizados e importação CSV
- Conexão oficial WhatsApp Cloud API
- Live Chat com recebimento e envio de mensagens
- Automações visuais horizontais: gatilho, mensagem, tag, atraso, condição, webhook, opt-out, randomizador e encaminhamento
- Broadcasts segmentados por tags e templates da Meta
- Atualização segura de token permanente pela tela de Conexões
- Logo e identidade visual do ChatNT

## Automação WhatsApp: pontos importantes

- Endpoint do webhook: `src/app/api/webhooks/whatsapp/route.ts`
- Motor/fila: `src/lib/automations/trigger.ts` e `src/lib/queue/automation-worker.ts`
- O worker é iniciado por `src/instrumentation.ts` quando o Next inicia.
- A Meta precisa ter o campo de webhook `messages` assinado.
- Para números móveis brasileiros, o webhook pode enviar o número sem o nono dígito. `src/lib/phone.ts` corrige esse formato para E.164 antes de procurar/criar o contato e responder.

## Próximos passos sugeridos

1. Criar autenticação e permissões por área (RBAC).
2. Completar Live Chat: filas, atribuição, notas, lembretes e painel do aluno.
3. Evoluir o construtor de automações com todos os tipos de ação mapeados.
4. Criar CRM Kanban, atendentes e painel de relatórios.
5. Migrar de ngrok/local para deploy no Railway, com webhook público estável e workers separados.

## Diretriz de produto

Preservar a paleta verde do ChatNT/Novo Tempo e a inspiração visual do WhatsApp, mantendo a interface responsiva e sem margens vazias em telas grandes.
