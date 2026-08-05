# Mapeamento do Sistema — CRM de Automação WhatsApp

> Sistema de referência: Unnichat (uso atual). Objetivo: construir sistema próprio com funcionalidades equivalentes, adaptado ao fluxo da Escola Bíblica / Novo Tempo.

Status geral: 🟢 Mapeamento funcional 100% completo — todos os 14 módulos da sidebar cobertos (Redirect excluído do escopo).

---

## Contexto de uso (fluxo atual)

- Captação de alunos via TV, revistas e formulários de cadastro
- Contatos chegam em listas de Excel e são importados para o sistema
- Cada contato recebe **tags** e **campos customizados** (ex: distrito, variante/turma)
- Disparos de mensagens **segmentados** (por tag, distrito ou variante), via **API oficial do WhatsApp**
- Necessidades centrais: Live Chat, atendimento via IA, chatbot para diálogo + salvar campos personalizados

---

## 1. Painel / Início — 🟢 Mapeado

Tela de relatório/dashboard inicial. Precisa ser adaptado à realidade do negócio.

**Métricas exibidas hoje (Unnichat):**
- Contatos (novos hoje / total)
- Conversas em andamento (com janela aberta)
- Mensagens recebidas (hoje / média)
- Automações acionadas (respostas automáticas enviadas)
- Faturamento
- Satisfação (nota média)

**Métricas que PRECISAMOS adaptar/adicionar (específico do negócio):**
- [ ] Contatos na fila de atendimento
- [ ] Atendimentos por atendente (quantos cada um atendeu)
- [ ] Alunos atendidos (total)
- [ ] Visitas agendadas (número)
- [ ] Estudos bíblicos agendados (número)
- [ ] Satisfação

**Outros elementos:**
- Seletor de "Perfil de conexão" (multi-número de WhatsApp)
- Filtro de período (Hoje / etc.)
- Alertas e notificações
- Seletor de quantos perfis selecionados

---

## 2. Contatos — 🟢 Mapeado (módulo crítico — "não retiro nada")

Módulo central do sistema segundo o usuário.

**Funcionalidades:**
- Listagem de contatos (nome, telefone, data de criação)
- Criação de **Tags** (etiquetas coloridas, ex: #ativaIA, #Ex Adventistas Quente)
- Criação de **Campos customizados**
- **Segmentos** salvos (filtros pré-configurados)
- Filtro de contatos por tag
- Importação de contatos (upload, provavelmente CSV/Excel)
- Criação manual de "Novo contato"
- Busca/pesquisa de contatos
- Ações em massa (seleção múltipla via checkbox)
- Ação individual por contato (menu de 3 pontinhos) — **"consegue fazer uma infinidade de coisas"** → detalhar quando enviar o print dessa parte

**Pendente de detalhamento:**
- [ ] O que exatamente aparece no menu de ações de um contato individual
- [ ] Estrutura completa da tela de filtros (mencionado que vai enviar em separado)
- [ ] Tipos de campo customizado suportados (texto, data, lista, etc.)

---

## 3. Automações — 🟡 Parcialmente mapeado

**Funcionalidades identificadas:**
- Organização de automações em **Pastas** (ex: Novo Tempo, Desativadas, Anúncios, Central NT, Rascunhos, Campos Customizados)
- Criação de nova pasta
- Criação de nova automação
- Edição via menu de 3 pontinhos
- Lista de automações com busca e ordenação (ex: "Mais recentes")
- Regras do sistema atual: histórico de envios/falhas/entregas/cliques mantido por 6 meses; contato pode acionar o mesmo gatilho até 20x a cada 24h

**Pendente de detalhamento:**
- [ ] Estrutura de um fluxo de automação aberto (gatilhos, condições, ações, nós)
- [ ] Tipos de gatilho disponíveis (palavra-chave, tag aplicada, novo contato, etc.)
- [ ] Tipos de ação disponíveis (enviar mensagem, aplicar tag, mover fila, chamar IA, etc.)

---

## 3.1 Construtor de fluxo (detalhe de Automações) — 🟢 Mapeado

Editor visual tipo node-based (canvas com nós conectados por linhas), estilo "abrir automação".

**Ações disponíveis para montar um passo do fluxo:**
- Envio de mensagem
- Condicional
- Atraso inteligente (delay)
- Encaminhar automação (chama outro fluxo)
- Requisição HTTP (webhook de saída)
- OptOut (descadastro)
- Randomizador (split A/B)
- Ações de contato (ex: aplicar tag, editar campo)
- **Ações de CRM** (ex: "Atribuir negócio à etapa do pipeline")
- Ações de Sistema
- API de Conversação
- SMS e Áudio na Ligação
- Google Sheets (integração, marcado como BETA)

**Gatilhos identificados (ao menos parcialmente, via CRM):**
- Negócio criado no pipeline
- Negócio apagado do pipeline
- Fechar negócio perdido
- (provavelmente também: novo contato, tag aplicada, palavra-chave recebida — confirmar)

**Cada bloco/nó tem:**
- Ícone + nome da ação
- Resumo do conteúdo configurado
- Botões de duplicar e excluir
- Conector "Próximo passo" para encadear com o bloco seguinte

**Ações de pasta (nos "3 pontinhos"):** Detalhes, Renomear, Mover, Apagar

---

## 4. Live Chat — 🟢 Mapeado

Layout de 3 colunas: lista de conversas | conversa ativa | painel de detalhes do contato.

**Coluna 1 — Lista de conversas:**
- Abas: "Novos" e "Meus" (com contador)
- Busca de conversa
- Filtro (funil): por Tags (possui/não possui, lógica OU/E), por Status, por Data, por CRM
- Ordenar por: mensagem mais recente / mais antiga
- Menu de filas/filtros rápidos (ícone hambúrguer): filas por atendente, filas de IA (ex: "IA de resgate/fallback", "Atendimento IA"), "Finalizados", "Todas as conversas" — cada uma com contador
- Cada item mostra: avatar, nome, indicador de status (bolinha verde = online), telefone, "há X horas", preview da última mensagem com check de lida/entregue

**Coluna 1 — Busca de conversas (detalhe):**
Busca com **prefixos/atalhos por tipo de conteúdo** (dropdown ao clicar no campo, cada um com uma tecla de atalho associada):
- `@` Contatos
- `#` Notas
- `$` Mensagens

→ Ou seja, a busca não é só "por nome" — é uma busca global tipada, filtrando se você quer achar um contato, uma nota interna ou o conteúdo de mensagens trocadas.

**Coluna 1 — Configurações (engrenagem):**
- Dashboard
- Adicionar contato
- Conversa (nova)
- Atribuição automática
- Configurar avaliação de atendimento
- Iniciadores de conversa
- Ativar notificação em som
- Desativar notificações do Live Chat
- Desativar envio com Enter

**Coluna 2 — Conversa ativa:**
- Cabeçalho: nome do contato, badge "Atribuída", contador de mensagens, ícones de ações (transferir, atribuir, marcar como resolvido, ligar, mais opções, fechar)
- Tags aplicadas à conversa (chips coloridos)
- Corpo da conversa: bolhas de mensagem (cliente à esquerda, atendente/sistema à direita), suporte a áudio (player com play/pause/tempo), texto, indicação de qual automação/IA enviou cada mensagem (com ID), log de eventos do sistema (ex: "conversa atribuída a X", "transferida por Y")
- Campo de digitação com atalho "/" para Respostas Rápidas
- Log de eventos confirma **handoff automático**: uma automação pode atribuir a conversa primeiro à IA ("Atendimento IA") e depois transferir para um atendente humano específico — importante padrão a replicar (fila de IA → escalonamento pra humano)
- Barra de ações: mensagem, ligação, novo, template, imagem/mídia, emoji, áudio (gravar)

**Coluna 2 — Barra de ações do composer (detalhe completo):**
Ícones da barra inferior (esquerda pra direita, conforme print):
1. 💬 Mensagem de texto rápida / respostas rápidas
2. 📞 Ligação (chamada de voz via WhatsApp)
3. 📄 Novo / anotação (adicionar nota interna)
4. ▤ Template (enviar mensagem-modelo aprovada pela Meta)
5. 🔀 Enviar automação (disparar um fluxo de automação dentro da conversa)
6. 🖼️ Imagem / mídia (anexar foto, vídeo, documento — tudo que o WhatsApp permite)
7. 😊 Emoji
8. 🎭 (a confirmar função exata — possivelmente figurinha/sticker)
9. 🎤 Gravar áudio e enviar

**Requisito explícito do usuário — todas essas ações precisam existir no composer do Live Chat:**
- [ ] Enviar mensagem de texto
- [ ] Fazer ligação
- [ ] Anotar (nota interna, não visível ao contato)
- [ ] Enviar template aprovado
- [ ] Enviar/disparar uma automação a partir da conversa
- [ ] Enviar imagem, vídeo, documento, áudio — todos os tipos de mídia que o WhatsApp permite
- [ ] Emojis
- [ ] Gravar e enviar áudio
- [ ] **Gerar resposta com IA dentro do chat** — um botão/atalho pra IA sugerir/gerar a resposta que o atendente vai mandar ao aluno (assistência ao atendente humano, diferente do agente de IA autônomo do módulo InteligêncIA)

**Coluna 3 — Painel do contato (accordions):**
- Anotações
- Lembretes
- Atividades
- Unni IA (config da IA para aquele contato)
- Campos customizados
- CRM - Negócios
- Tags do contato

---

## 5. Broadcasts (disparos em massa) — 🟢 Mapeado

**Fluxo de criação de um broadcast:**
1. Nome do broadcast
2. Tipo de disparo (ex: Imediato / agendado)
3. **Público-alvo** — segmentação por abas: Por Tags (possui/não possui, lógica OU/E), Janela (de conversa), Campos Do Contato, Colunas Do CRM
4. Contador em tempo real de quantos contatos serão atingidos pelo filtro
5. Seleção do template de mensagem aprovado pela Meta
6. **Configuração do fluxo** — cada broadcast tem um mini fluxo de automação acoplado (mesmo construtor de nós), disparado a partir da resposta do contato aos botões do template (ex: cliques em botões do template acionam automações diferentes)
7. Métricas do broadcast: enviados, entregues, lidos, falhas, cliques (com %)
8. Ações: Salvar como rascunho / Enviar

---

## 6. InteligêncIA (atendimento via IA) — 🟢 Mapeado

Tela central de gestão dos agentes de IA. Abas:
- **Unni Agent** — lista de IAs configuradas (nome, plataforma/modelo — ex: OpenAI gpt-4o —, data de criação, status ativo/inativo, ações)
- **Unni Insights**
- **Unni Action**

Aviso institucional sobre política de uso da Meta para não simular ser humano (relevante para compliance da API oficial).

**Pendente de detalhamento:** o que tem dentro de "Adicionar" um agente (prompt, base de conhecimento, gatilhos de handoff para humano, etc.), e o que fazem Unni Insights / Unni Action.

---

## 7. Chatbot (diálogo + salvar campos personalizados)

Não é uma tela separada — é a combinação de: **Automações** (fluxo/gatilhos) + **InteligêncIA** (Unni Agent) + **Ações de contato/CRM** dentro do construtor de fluxo, que permitem capturar resposta do usuário e salvar em campo customizado. Já coberto pelos módulos 3.1 e 6.

---

## 8. Painel Meta — 🟢 Mapeado

Gestão de templates e flows da Meta. Abas:
- **Templates** — lista com nome, status (Aprovado/etc.), tags, categoria (Utilidade, Marketing...), ações
- **Flows**
- **Ligações**

Ações no topo: Nova Pasta, Configurar, Atualizar, Tags, Adicionar

---

## 9. Conexões — 🟢 Mapeado

Gestão das conexões oficiais com a Meta/WhatsApp Business API (WABA).

Cada card de conexão mostra:
- Nome da conexão + número de telefone + identificador (@handle)
- Limite de mensagens (ex: 100.000 conversas/24h)
- Verificação Empresarial (Verificado/não)
- Status da Conta (Aprovado/etc.)
- Qualidade (Alta/Média/Baixa — métrica da própria Meta)
- Ações: editar, excluir, desconectar

Ações no topo: Grupos de conexões, Atualizar, Nova conexão

**Confirma:** usa API oficial (WABA) — não é solução não-oficial tipo Baileys.

---

## 10. Webhooks — 🟢 Mapeado

Lista de webhooks organizados em pastas, cada card com:
- Nome
- Origem/tipo (ex: "api", "greatPages" — indica integração com formulários externos)
- Data de criação / atualização
- Ações: duplicar, excluir, editar

Ações no topo: Nova Pasta, Adicionar, Lixeira (soft delete), Ordenação

---

## 11. Atendentes — 🟢 Mapeado

Gestão de usuários/operadores do sistema.

Lista com colunas: Nome, Email, **Área** (perfil de acesso — ex: Coordenador Base, Intermediário, Admin Master), Tags, Status (Online/Offline)

Ações no topo: **Áreas** (gestão de perfis/permissões — RBAC), Adicionar atendente

→ Confirma necessidade de **controle de permissões por papel/área**, não só atendente comum vs. admin.

---

## 12. CRM (Pipeline / Kanban) — 🟢 Mapeado

Módulo "bem legal" segundo o usuário — pipeline de vendas/oportunidades em formato Kanban.

- Múltiplos pipelines (ex: "Tec dos Não Ativos [Visitas e Estudos Bíblicos] [2026]")
- Colunas = etapas customizáveis ("Adicionar etapa"), cada uma com contador de cards e valor total
- Cada card = um "negócio" vinculado a um contato: nome, telefone, tags, indicador de "temperatura" (ícone + número, ex: 🔥70° "quente" / ❄️5° "frio" — provavelmente prioridade/engajamento), valor (R$), tempo na etapa (ex: "44d"), atalho pra atribuir/comentar
- Barra de ferramentas: buscar contatos, filtro por Atendentes, por Tags, ordenação, filtros avançados, exportar
- Resumo no topo: valor total do pipeline, total de negócios
- Ação "Adicionar etapa" e "Exportar"

**Pendente de detalhamento:** como a "temperatura" é calculada (manual ou automática/IA), regras de entrada automática de negócio em etapa via automação (já vimos gatilhos "negócio criado/apagado do pipeline")

---

## 13. Monitoramento — 🟢 Mapeado

Painel de auditoria (audit log) das ações em massa executadas na conta.

**Lista de ações em massa** — colunas:
- Tipo (ex: Exportar contatos, Adicionar tags, Importar contatos, Remover tags)
- Status (ex: Concluído)
- Qtd (quantidade de contatos afetados)
- Dados (contexto extra — ex: qual tag foi adicionada/removida)
- Autor (usuário que executou a ação)
- Data de criação
- Ações (menu de 3 pontinhos — provavelmente ver detalhes/desfazer)

Tem filtro (ícone de funil) no topo da lista.

→ Serve como **trilha de auditoria**: essencial pra rastrear quem fez o quê em massa (import/export, mudança de tags em lote), especialmente relevante com múltiplos atendentes/áreas de acesso.

---

## 14. Treinamentos — 🟢 Mapeado

Central de conteúdo/onboarding da plataforma (não é uma funcionalidade de negócio, é material de apoio).

- Listagem "Todos os cursos" em cards estilo capa de curso
- Conteúdo: aulas em vídeo sobre como usar o sistema, disponível em 3 idiomas (PT, ES, EN)
- Cada card: selo "Unni Class", bandeira do idioma, título, categoria (Treinamentos/Entrenamientos/Training)

→ **Baixa prioridade pro MVP de vocês**: é basicamente uma central de ajuda em vídeo sobre a própria ferramenta. Pode ficar pra depois (ou nem existir — vocês podem usar algo mais simples tipo uma página de FAQ/link pro manual).

---

## ✅ Mapeamento 100% completo — todos os 14 módulos identificados na sidebar foram cobertos (Redirect excluído do escopo por decisão do usuário).

---

## Roteiro da primeira sessão no Claude Code

Ordem prevista pra primeira sessão de construção (pode variar um pouco na prática):

1. **Criar a pasta do projeto** no seu computador e abrir com o Claude Code
2. **Estruturar o projeto Next.js** (frontend + backend juntos) com TypeScript
3. **Criar o projeto no Railway** direto pelo terminal/integração — provisionar Postgres e Redis
4. **Conectar o projeto ao banco** (variáveis de ambiente, sem senha aparecer pra mim)
5. **Desenhar as primeiras tabelas do banco** (schema): Contatos, Tags, Campos Customizados, Atendentes
6. **Construir o módulo de Contatos** — listagem, criar, editar, aplicar tag, campo customizado, importar (CSV/Excel)
7. **Testar tudo localmente** antes de publicar
8. **Publicar (deploy) a primeira versão no Railway** — gerar uma URL de teste
9. Só depois disso entramos em Conexões (WhatsApp oficial), Live Chat, Automações etc.

**O que você vai precisar fazer na hora (pequenas coisas, eu aviso cada uma):**
- Confirmar cliques em telas do Railway/GitHub
- Colar valores em campos de configuração quando eu pedir (nunca me mostrando senha/token no chat)
- Testar as telas conforme forem ficando prontas e me dizer se está do jeito esperado

---

## Checklist de pré-requisitos

- [x] Conta de desenvolvedor Meta com WABA (já tinha) — app novo a ser configurado dentro do Claude Code
- [x] Conta GitHub criada/logada
- [x] Conta Railway criada/logada (via GitHub)
- [ ] Chave de API da OpenAI — a criar quando chegarmos na etapa de IA
- [ ] Projeto criado no Railway (Postgres + Redis) — próximo passo, junto com o Claude Code

## Stack técnica escolhida

- **API do WhatsApp:** Oficial da Meta (Cloud API) — confirmado pelo usuário
- **Framework:** Next.js (React) — frontend + backend no mesmo projeto
- **Banco de dados:** PostgreSQL
- **Filas/automações/broadcasts:** Redis + BullMQ
- **Chat em tempo real (Live Chat):** Socket.io ou Pusher (decidir na implementação)
- **Armazenamento de mídia:** Cloudflare R2
- **IA:** API da OpenAI (ChatGPT) — escolhido pelo usuário — agente de atendimento + geração de resposta assistida
- **Hospedagem:** Railway (app + Postgres + Redis no mesmo painel — escolhido por simplicidade, já que o usuário não vai administrar infraestrutura sozinho)
- **Perfil do usuário:** não programa — desenvolvimento guiado passo a passo via Claude Code

## Decisões técnicas em aberto (discutir durante a construção)
- [ ] Volume esperado (hoje: ~56 mil contatos, 500 mil de limite mencionado na tela; um pipeline sozinho já tem 537 negócios)
- [ ] Como calcular a "temperatura" dos leads no CRM (regra própria ou IA)
- [ ] Estrutura de permissões por Área/perfil (RBAC) — quais ações cada área pode fazer

---

## Módulos priorizados para o MVP (sugestão)

Dado o volume de módulos, sugiro construir nessa ordem (cada um já é utilizável isoladamente):

1. **Contatos** + Tags + Campos customizados (base de tudo)
2. **Conexões** (integração oficial WhatsApp Business API)
3. **Live Chat** (atendimento manual básico)
4. **Automações** (fluxo simples: gatilho → mensagem → ação de contato)
5. **Broadcasts** (disparo segmentado)
6. **CRM/Pipeline** (kanban de negócios)
7. **Atendentes** + Áreas/permissões
8. **InteligêncIA** (agente de IA)
9. **Painel/Relatórios** (métricas do negócio)
10. Webhooks, Painel Meta (templates)
11. **Monitoramento** (audit log) — pode entrar cedo no roadmap já que é simples e dá rastreabilidade desde o início
12. **Treinamentos** — última prioridade, ou substituir por algo simples (FAQ/manual)

---

## Histórico de atualizações
- **[envio 1]**: Mapeamento inicial a partir do documento MAPEAMENTO_DE_SISTEMA_UNNICHAT.docx — Painel, Contatos e Automações mapeados (parcial).
- **[envio 2]**: Documento atualizado com todos os módulos — Live Chat, Broadcasts, InteligêncIA, Painel Meta, Conexões, Webhooks, Atendentes e CRM/Pipeline mapeados. Identificados 3 itens de menu ainda sem detalhe (Redirect, Treinamentos, Monitoramento).
- **[envio 3]**: Redirect marcado como fora do escopo (não será construído).
- **[envio 4]**: Monitoramento (audit log de ações em massa) mapeado a partir de print. Falta apenas Treinamentos.
- **[envio 5]**: Treinamentos mapeado (central de vídeo-aula da plataforma, baixa prioridade). Mapeamento funcional 100% completo.
- **[envio 6]**: Detalhe da busca do Live Chat — busca tipada com prefixos @ (Contatos), # (Notas), $ (Mensagens).
- **[envio 7]**: Detalhe completo da barra de ações do composer do Live Chat (mensagem, ligação, anotação, template, automação, mídia, emoji, áudio) + requisito de geração de resposta com IA para o atendente + padrão de handoff IA→humano confirmado no log de eventos.
