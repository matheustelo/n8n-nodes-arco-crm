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

## Desenvolvimento

```bash
pnpm install
pnpm dev      # sobe n8n local em :5678 com o node linkado
pnpm lint
pnpm build
```

## Changelog

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
