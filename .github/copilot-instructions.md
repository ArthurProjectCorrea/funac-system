# Copilot Instructions for funac-system Monorepo

## Visão Geral da Arquitetura

- Monorepo gerenciado com Turborepo, usando workspaces do pnpm.
- Principais apps:
  - `apps/web`: Frontend Next.js (autenticação, dashboard, UI moderna com shadcn/ui).
  - `apps/api`: Backend NestJS (autenticação JWT, controle de usuários, MongoDB via Mongoose).
  - `apps/docs`: Documentação Next.js.
- Pacotes compartilhados:
  - `packages/ui`: Componentes React compartilhados (com Tailwind CSS).
  - `packages/eslint-config`, `packages/typescript-config`, `packages/tailwind-config`: Configurações compartilhadas.

## Fluxos e Convenções

- **Autenticação**: API expõe endpoints REST sob `/auth` e `/user`, protegidos por JWT. Frontend consome esses endpoints e armazena o token no localStorage.
- **Padrão de UI**: Uso extensivo de shadcn/ui e Tailwind. Componentes customizados ficam em `apps/web/components/ui`.
- **Testes**: API possui testes unitários e e2e (Jest). Testes ficam em `src/**/*.spec.ts` e `test/`.
- **Commits**: Uso obrigatório de Conventional Commits, Husky, lint-staged e Commitizen. Commits semânticos validados em pre-commit.
- **CI/CD**: Workflow de release automatizado em `.github/workflows/release.yml` usando Changesets e GitHub Actions.

## Comandos Essenciais

- Instalar dependências: `pnpm install`
- Rodar frontend: `pnpm --filter web dev`
- Rodar backend: `pnpm --filter api start:dev`
- Rodar testes API: `pnpm --filter api test` e `pnpm --filter api test:e2e`
- Lint (monorepo): `pnpm lint` (executa turbo run lint)
- Commit semântico: `pnpm commit`

## Integrações e Padrões Específicos

- **Integração web/api**: URLs de API são configuradas via `NEXT_PUBLIC_API_URL` no frontend.
- **MongoDB**: Configuração via `.env` na raiz da API.
- **Configuração de UI**: Tailwind e shadcn/ui centralizados, com aliases definidos em `components.json`.
- **Scripts customizados**: Atualização de secrets do GitHub via `scripts/update-github-secret.js`.

## Dicas para Agentes AI

- Sempre classifique arquivos modificados por grupo (web, api, docs, ui, configs) e tipo de alteração (feat, fix, chore, etc) ao sugerir commits.
- Siga as instruções de `.github/instructions/commit.instructions.md` para análise de commit.
- Para novos endpoints, siga o padrão de controllers/services/modules do NestJS.
- Para novos componentes, siga o padrão de composição e estilização do shadcn/ui.
- Use os pacotes de configuração compartilhados para garantir consistência de lint, TS e Tailwind.

## Exemplos de Arquivos-Chave

- API: `apps/api/src/auth/auth.service.ts`, `apps/api/src/user/user.controller.ts`
- Web: `apps/web/app/auth/signin/page.tsx`, `apps/web/components/ui/button.tsx`
- Config: `packages/eslint-config/base.js`, `packages/typescript-config/base.json`

Seções ou padrões não documentados? Peça feedback ao usuário para detalhar fluxos ou integrações específicas.
