# n8n-nodes-arco-crm

n8n community node para o [Arco CRM](https://crm.grupoarco.cc) via Public API.

Permite criar workflows automatizados consumindo a API do Arco CRM — leads, deals, pessoas, organizações, atividades, notas, tags, pipelines, memberships, origens e tipos de atividade — com seleção por dropdown (sem precisar colar UUIDs).

## Instalação

Na sua instância n8n:

1. Vá em **Settings → Community Nodes**.
2. Clique em **Install** e digite `n8n-nodes-arco-crm`.
3. Aceite os riscos (n8n exige confirmação explícita para community nodes) e instale.

## Configuração

1. Crie uma chave de API no Arco CRM (Configurações → API Keys), com os escopos necessários:
   - `leads:read`, `leads:write`
   - `deals:read`, `deals:write`
   - `people:read`, `people:write`
   - `organizations:read`, `organizations:write`
   - `activities:read`, `activities:write`
   - `notes:read`, `notes:write`
   - `tags:read`
   - `origins:read`
   - `memberships:read`
   - `activity_types:read`
   - `loss_reasons:read`

> `Lead Pipelines` reusa `leads:read`. `Deal Pipelines` reusa `deals:read`. Não existe scope `pipelines:read` dedicado.
2. No n8n, crie uma credencial **Arco CRM API**:
   - **Base URL**: `https://crm.grupoarco.cc/api` (ou a URL da sua instância)
   - **API Key**: a chave `ark_…` gerada
3. Use o botão **Test** para validar.

> Se algum dropdown ficar **vazio** (Origin, Membership, Loss Reason) é porque o scope correspondente está ausente na sua API key — o node trata `SCOPE_DENIED` silenciosamente para não quebrar o formulário inteiro.

## Recursos suportados

| Recurso | Operações |
|---|---|
| **Lead** | Create · Get · List · Update · Change Stage · Disqualify · Convert · Convert Preview · Claim · Stage History · List/Add/Remove Tags |
| **Deal** | Create · Get · List · Update · Change Stage · Mark Won · Mark Lost · Reopen · Claim · Stage History · List/Add/Remove Tags |
| **Person** | Create · Get · List · Update · Claim |
| **Organization** | Create · Get · List · Update · Claim |
| **Activity** | Create · Get · List · Update · Complete |
| **Activity Type** | List (read-only) |
| **Note** | Create · Get · List · Update |
| **Tag** | List (read-only) |
| **Pipeline** | List (Lead ou Deal, com `Include Stages` opcional) |
| **Membership** | List · Get (read-only) |
| **Origin** | List · Get (read-only) |

Todas as operações usam o contrato `/v1/*` da Public API.

## Dropdowns inteligentes

Campos que referenciam outras entidades (`organization_id`, `person_id`, `pipeline_id`, `stage_id`, `lead_pipeline_id`, `lead_stage_id`, `owner_membership_id`, `disqualification_reason_id`, `loss_reason_id`, `origin_id` etc.) oferecem 3 modos:

- **From List** — dropdown paginado com busca por nome.
- **By ID** — UUID direto, útil em loops e expressions.
- **By URL** — cola o link da UI do CRM; o node extrai o UUID.

Selects de Stage dependem do Pipeline correspondente — escolha o pipeline primeiro para que os stages carreguem.

## Idempotência

As operações **Create** de Lead, Deal, Person, Organization, Activity e Note têm um campo opcional **Idempotency Key**. Quando preenchido, é enviado no header `Idempotency-Key`:

- A mesma chave + o mesmo body em até 24h retornam a resposta original — evita duplicatas em retries (timeout, re-execução do workflow).
- A mesma chave com body diferente retorna `409 IDEMPOTENCY_CONFLICT`.

Use um valor estável por requisição lógica (ex.: um UUID derivado do registro de origem). Deixe vazio para desativar.

## Desenvolvimento

```bash
pnpm install
pnpm dev      # sobe n8n local em :5678 com o node linkado
pnpm lint
pnpm build
```

## Changelog

### 0.6.1

- **Fix**: operações POST sem corpo (`Reopen`, `Claim` de Lead/Deal) ou com campos opcionais vazios (`Disqualify`, `Mark Won`, `Mark Lost`) falhavam com `Body cannot be empty when content-type is set to 'application/json'`. Agora enviam `{}` como corpo padrão; campos preenchidos continuam sendo mesclados normalmente.

### 0.6.0

- **Mover Lead/Deal de funil no `Change Stage`**: o campo `Lead Pipeline` (Lead) e `Deal Pipeline` (Deal) do `Change Stage` agora é enviado no corpo (`lead_pipeline_id` / `pipeline_id`). Escolha um pipeline diferente para mover a entidade para outro funil (precisa estar `open`); mantenha o atual — ou deixe vazio — para apenas trocar de estágio. Retrocompatível: só é enviado quando preenchido, então workflows que só mudam de etapa continuam idênticos.
- **Nova operação `Reopen` no Lead** (`POST /v1/leads/:id/reopen`): reverte um lead `disqualified` para `open`, preservando a etapa atual. Espelha o `Reopen` já existente em Deal.

### 0.5.0

- **Novo recurso `Campaign`** (API v1.10, scopes `campaigns:read:all` / `campaigns:operate:all`): `List`, `Get`, `Get Stages`, `Get Summary`, `List Participants` (filtros `Stage`/`Outcome`), `Add Participants` (listas de Lead IDs / Person IDs + `Force`), `Change Participant Stage`, `Qualify Participant` (payload JSON, _kind-aware_), `Disqualify Participant` (`Loss Reason` / `Comment`) e `Remove Participant`. Dropdowns `From List` para **Campaign** e **Campaign Stage** (a etapa lê a campanha escolhida no formulário).
- **Campo `Campaign` no Create de Lead e Person**: `resourceLocator` (From List / By ID / By URL) que envia `campaign_id`, criando o registro já vinculado como participante na primeira etapa da campanha. Requer também o scope `campaigns:operate:all`; a operação é atômica (rollback se o vínculo falhar). Disponível apenas no Create — a API não aceita `campaign_id` no update.

### 0.4.0

- **Busca textual nas listagens** (`List`) de Lead, Deal, Person, Organization e Membership via o novo parâmetro `search` da API (substring, case-insensitive, combinado com os demais filtros via AND, máx. 200 caracteres). Lead/Person buscam por nome, e-mail ou telefone; Deal por título; Organization por nome; Membership por e-mail.
- **Dropdowns (`From List`) agora buscam no servidor** para Lead, Deal, Person e Organization: em vez de carregar os primeiros 50 registros e filtrar no navegador, enviam `?search=` e pesquisam a base inteira. O debounce do campo é feito pelo próprio editor do n8n. Tags, Origins, Pipelines, Stages, Loss Reasons e Membership seguem com filtro local (o backend não expõe `search` neles, ou — no caso de Membership — só busca por e-mail enquanto a lista exibe o nome).

### 0.3.0

- **Idempotency Key** opcional nas operações Create de Lead, Deal, Person, Organization, Activity e Note (header `Idempotency-Key`, TTL 24h). Vazio = comportamento anterior.

### 0.2.0

Cobertura completa do contrato `/v1/*` (após o backend expor `deal-pipelines`, `loss-reasons` e o ciclo completo de Deal).

**Novos recursos**
- **Deal**: `Change Stage`, `Mark Won`, `Mark Lost`, `Reopen`, `Claim`, `Stage History`, `List/Add/Remove Tags`.
- Dropdowns de **Deal Pipeline** e **Deal Stage** em Deal (Create/List/Change Stage) e em Lead Convert.
- Dropdowns de **Lead Pipeline** e **Lead Stage** no filtro de Lead List.
- Dropdown de **Loss Reason** em Lead Disqualify e Deal Mark Lost.
- `Pipeline → List` aceita `Type` (lead ou deal) para escolher o endpoint.

**Correções**
- Dropdowns sem scope (Origin, Membership, Loss Reason) ficam vazios em vez de pintar vermelho. O erro `SCOPE_DENIED` deixa de poluir o formulário.
- Busca em Lead/Person/Organization/Deal passa a filtrar no cliente (o backend ignorava `?search=`).

**Breaking changes**
- `pipeline_id` / `stage_id` no Deal Create deixam de ser `string` e viram `resourceLocator` (3 modos: From List / By ID / By URL). Workflows existentes preservam o UUID via modo "By ID".
- `lead_pipeline_id` no filtro de Lead List idem.
- `deal_pipeline_id` / `deal_stage_id` no Lead Convert idem.
- `disqualification_reason_id` no Lead Disqualify idem.
- `Pipeline → List` agora exige escolher `Type` (default `Lead Pipelines` mantém o comportamento anterior).

### 0.1.2

Alinhamento à Public API v1.4.9.3.

**Novos recursos**
- `Membership`, `Origin`, `Activity Type` (read-only).
- Dropdown de `Owner Membership` em Lead, Deal, Person, Organization e Activity.
- `Pipeline → List` aceita `Include Stages` para retornar stages embutidos.

**Breaking changes** (rotas/campos que não existem no contrato público `/v1/*`)
- `Tag`: removidas operações `Create`, `Update`, `Delete` (Tag agora é read-only).
- `Activity`: removidas `Delete` e `Uncomplete`. Campo `activity_type_id` renomeado para `type_id`; `description` renomeado para `notes`; `owner_membership_id` agora é obrigatório no Create; filtros `due_after`/`due_before` removidos; `status` removido do Update.
- `Note`: removida operação `Delete`. Campo `body` renomeado para `content`.
- `Pipeline`: removidas `Get` e `List Stages` (use `List` com `Include Stages: true`). Agora aponta para `/v1/lead-pipelines` (deal pipelines não eram expostos pela Public API).
- `Deal`: campo `name` renomeado para `title` (Create e Update).

**Correções**
- Todas as rotas internas (`/activities`, `/notes`, `/tags`, `/pipelines`, `/origins`, `/activity-types`) migradas para o prefixo público `/v1/`.

## Licença

[MIT](LICENSE.md)
