---
applyTo: '**'
---

Instruções para análise de versionamento e geração de relatório para preenchimento do changeset:

1. Para cada projeto do monorepo (identificado pelo escopo nos commits, ex: web, api, docs, ui, etc), analise todos os commits feitos desde o último merge para a branch main.
2. Classifique cada commit pelo Conventional Commits e determine se ele é versionável (tipos versionáveis: feat, fix, perf, BREAKING CHANGE, etc). Commits não versionáveis (chore, docs, style, test, build, ci, refactor sem breaking change) não alteram o versionamento.
3. Para cada projeto, defina o maior tipo de versionamento necessário:
   - Se houver BREAKING CHANGE ou tipo major, classifique como major.
   - Se houver feat (mas não major), classifique como minor.
   - Se houver apenas fix/perf, classifique como patch.
   - Se não houver commits versionáveis, não gere entrada para o projeto.
4. Gere um relatório em temp na raiz do monorepo, detalhando para cada projeto:
   - O tipo de versionamento (major, minor, patch)
   - Lista dos commits que justificam o versionamento
   - Se o changeset exigir descrição, inclua uma descrição resumida baseada nos commits relevantes
5. O relatório deve ser salvo em um novo arquivo na pasta temp, com nome único para cada execução, seguindo o padrão temistemp-<timestamp>.json (exemplo: temistemp-20250823-153000.json), garantindo que cada solicitação gere um novo arquivo sem sobrescrever anteriores. Esse relatório servirá de base para preencher o changeset manualmente ou automatizar sua criação.
6. Exemplo de estrutura do relatório:

```json
{
  "web": {
    "releaseType": "minor",
    "commits": [
      { "hash": "abc123", "type": "feat", "description": "adiciona novo componente de login" }
    ],
    "summary": "Adiciona novo componente de login ao frontend."
  },
  "api": {
    "releaseType": "patch",
    "commits": [{ "hash": "def456", "type": "fix", "description": "corrige autenticação JWT" }],
    "summary": "Correções de autenticação JWT."
  }
}
```

7. Use este relatório para preencher o changeset, garantindo que cada projeto só seja promovido para um tipo de release maior se houver commits que justifiquem.
