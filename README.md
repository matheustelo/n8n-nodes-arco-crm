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
   - `pipelines:read`
   - `origins:read`
   - `memberships:read`
   - `activity_types:read`
2. No n8n, crie uma credencial **Arco CRM API**:
   - **Base URL**: `https://crm.grupoarco.cc/api` (ou a URL da sua instância)
   - **API Key**: a chave `ark_…` gerada
3. Use o botão **Test** para validar.

## Recursos suportados

| Recurso | Operações |
|---|---|
| **Lead** | Create · Get · List · Update · Change Stage · Disqualify · Convert · Convert Preview · Claim · Stage History · List/Add/Remove Tags |
| **Deal** | Create · Get · List · Update |
| **Person** | Create · Get · List · Update · Claim |
| **Organization** | Create · Get · List · Update · Claim |
| **Activity** | Create · Get · List · Update · Complete |
| **Activity Type** | List (read-only) |
| **Note** | Create · Get · List · Update |
| **Tag** | List (read-only) |
| **Pipeline** | List (com `Include Stages` opcional, retorna lead pipelines) |
| **Membership** | List · Get (read-only) |
| **Origin** | List · Get (read-only) |

Todas as operações usam o contrato `/v1/*` da Public API (alinhado à v1.4.9.3).

## Dropdowns inteligentes

Campos que referenciam outras entidades (`organization_id`, `person_id`, `pipeline_id`, `owner_membership_id` etc.) oferecem 3 modos:

- **From List** — dropdown paginado com busca por nome.
- **By ID** — UUID direto, útil em loops e expressions.
- **By URL** — cola o link da UI do CRM; o node extrai o UUID.

## Desenvolvimento

```bash
pnpm install
pnpm dev      # sobe n8n local em :5678 com o node linkado
pnpm lint
pnpm build
```

## Changelog

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
- `Pipeline`: removidas `Get` e `List Stages` (use `List` com `Include Stages: true`). Agora aponta para `/v1/lead-pipelines` (deal pipelines não são expostos pela Public API).
- `Deal`: campo `name` renomeado para `title` (Create e Update).

**Correções**
- Todas as rotas internas (`/activities`, `/notes`, `/tags`, `/pipelines`, `/origins`, `/activity-types`) migradas para o prefixo público `/v1/`.

## Licença

[MIT](LICENSE.md)
