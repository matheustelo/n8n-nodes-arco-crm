# n8n-nodes-arco-crm

n8n community node para o [Arco CRM](https://crm.grupoarco.cc) via Public API.

Permite criar workflows automatizados consumindo a API do Arco CRM — leads, deals, pessoas, organizações, atividades, notas, tags e pipelines — com seleção por dropdown (sem precisar colar UUIDs).

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
| **Activity** | Create · Get · List · Update · Delete · Complete · Uncomplete |
| **Note** | Create · Get · List · Update · Delete |
| **Tag** | Create · List · Update · Delete |
| **Pipeline** | List · Get · List Stages (read-only) |

## Dropdowns inteligentes

Campos que referenciam outras entidades (`organization_id`, `person_id`, `pipeline_id` etc.) oferecem 3 modos:

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

## Licença

[MIT](LICENSE.md)
