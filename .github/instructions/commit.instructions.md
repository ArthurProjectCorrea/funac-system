---
applyTo: '**'
---

# Instruções para Análise e Classificação de Commits

## Comando de Ativação
Quando o usuário digitar **"faça o relatorio de commit"**, execute o fluxo completo de análise de commits conforme descrito abaixo.

## Fluxo de Execução

### 1. Preparação Git
Execute os seguintes comandos na raiz do workspace:
```bash
git add .
git status --porcelain=v1 -z
git diff --cached --no-color --find-renames --unified=0 -z
```

### 2. Classificação por Tipo (Conventional Commits)

Classifique cada arquivo modificado usando as seguintes regras determinísticas:

#### **ci** 
- `.github/workflows/**`
- `azure-pipelines*`
- `.circleci/**`
- `.gitlab-ci.yml`

#### **build**
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig*.json`
- `eslint*`
- `prettier*`
- `vite*`, `webpack*`, `rollup*`
- `Dockerfile*`
- `docker-compose*`

#### **docs**
- `**/*.md`
- `docs/**`
- `apps/docs/**`

#### **test**
- `**/*.(spec|test).{js,ts,tsx}`
- `tests/**`
- `__tests__/**`

#### **style**
- Diffs apenas com whitespace/pontuação/formatação
- Verificar se mudanças são puramente estéticas

#### **chore**
- Mudanças fora de `src|app` que não se enquadram nas categorias acima

#### **feat**
- Adição de novos arquivos em `src|app|controller|route|component`
- Novas rotas/métodos exportados
- Criação de API/endpoint
- Novas props/interfaces públicas

#### **fix**
- Alterações em condicionais/guardas/validações
- Correção de testes falhos
- Remoção de anti-patterns
- Presença de palavras: `fix`, `bug`, `hotfix`, `null check`

#### **refactor**
- Mudanças internas sem alteração de I/O público
- Renomeações de arquivos (status 'R')
- Extração de métodos
- Reorganização de código

#### **perf**
- Implementação de cache/memoização
- Troca de algoritmos
- Remoção de loops redundantes
- Presença de palavras: `memo`, `cache`, `performance`

### 3. Detecção de Breaking Changes

Marcar `breakingChanges=true` se detectar:
- Exclusão/renome de exportações públicas
- Alteração de assinaturas (parâmetros/tipos de retorno)
- Mudanças em contratos de API (`@Get`, `@Post`, etc.)
- Alterações em DTOs/interfaces públicas

### 4. Agrupamento por Pacote

Mapear cada arquivo para um grupo:
- `apps/api`
- `apps/docs` 
- `apps/web`
- `packages/eslint-config`
- `packages/tailwind-config`
- `packages/typescript-config`
- `packages/ui`
- `root` (qualquer outro caminho)

### 5. Estrutura do JSON de Saída

Gerar um arquivo JSON em `./temp/YYYY-MM-DD_HH-mm-ss.json` com a seguinte estrutura:

```json
{
  "apps/api": {
    "git": "git add apps/api/src/users.service.ts apps/api/src/users.controller.ts",
    "type": "feat",
    "scope": "users",
    "shortDescription": "Adicionar endpoint GET /users",
    "longDescription": "Suporta paginação e filtro por status.",
    "breakingChanges": false,
    "breakingChangesDescription": "",
    "affectsOpenIssues": true,
    "issuesRef": "closes #123"
  },
  "apps/web": {
    "git": "git add apps/web/components/ui/button.tsx",
    "type": "refactor",
    "scope": "ui",
    "shortDescription": "Extrair componente Button reutilizável",
    "longDescription": "",
    "breakingChanges": false,
    "breakingChangesDescription": "",
    "affectsOpenIssues": false,
    "issuesRef": ""
  }
}
```

### 6. Preenchimento dos Campos

#### **git**: Comando git add com todos os arquivos do grupo
#### **type**: Tipo conventional commits baseado na análise
#### **scope**: Área/módulo afetado (opcional)
#### **shortDescription**: Resumo ≤ 89 caracteres
#### **longDescription**: Descrição detalhada (opcional)
#### **breakingChanges**: Boolean indicando se há breaking changes
#### **breakingChangesDescription**: Descrição dos breaking changes se houver
#### **affectsOpenIssues**: Boolean se resolve/afeta issues
#### **issuesRef**: Referência a issues (ex: "closes #123, ref #456")

### 7. Regras de Priorização

Quando múltiplos tipos forem detectados no mesmo grupo, usar a seguinte prioridade:
1. `fix` (maior prioridade)
2. `feat`
3. `perf`
4. `refactor`
5. `docs`
6. `test`
7. `build`
8. `ci`
9. `style`
10. `chore` (menor prioridade)

### 8. Validações

- Verificar se o diretório `temp` existe, criar se necessário
- Garantir que o timestamp seja único para evitar sobrescrita
- Validar que todos os arquivos staged foram classificados
- Confirmar que o JSON gerado é válido

### 9. Formato de Saída

Após gerar o relatório, informar:
- ✅ **Relatório gerado com sucesso**
- 📁 **Caminho**: `./temp/2025-08-24_10-30-45.json`
- 📊 **Grupos analisados**: X grupos encontrados
- 🔄 **Arquivos processados**: Y arquivos staged

### 10. Casos Especiais

#### Arquivos não classificáveis
Se um arquivo não se enquadrar claramente em um tipo, usar `chore` como fallback e sugerir revisão manual.

#### Múltiplas alterações no mesmo arquivo
Priorizar o tipo mais significativo baseado no volume e impacto das mudanças.

#### Renames complexos
Para arquivos renomeados com modificações, analisar o conteúdo das mudanças para classificação.

## Observações Importantes

- Execute sempre `git add .` antes da análise para garantir que todos os arquivos sejam incluídos
- Use `--unified=0` para análise mais precisa dos diffs
- Mantenha heurística conservadora para breaking changes
- Campos de texto podem ficar vazios para preenchimento manual posterior
- O comando `git` em cada grupo serve para conferência e uso manual