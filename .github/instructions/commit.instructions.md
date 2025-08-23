---
applyTo: '**'
---

Sempre que solicitado com "faça a analise para o commit", siga o procedimento abaixo:

Antes de iniciar a análise, utilize comandos como git status para listar todos os arquivos modificados, garantindo que a análise seja feita sobre todos os arquivos alterados no repositório.

1. Analise todas as alterações de arquivos modificados listados no git status.
2. Classifique cada arquivo modificado em grupos de projetos, conforme abaixo:
   - #file:web
   - #file:api
   - #file:docs
   - #file:ui
   - #file:typescript-config
   - #file:eslint-config
   - #file:tailwind-config
   - Arquivos que não pertencem a esses projetos devem ser agrupados como "grupo raiz".
3. Dentro de cada grupo, classifique as alterações por tipo:
   - feat
   - fix
   - chore
   - (outros tipos conforme Conventional Commits: docs, style, refactor, perf, test, build, ci, etc.)
4. Para cada grupo classificado, responda às seguintes perguntas:
   - Select the type of change that you're committing:
     (feat, fix, chore, docs, style, refactor, perf, test, build, ci, etc.)
   - What is the scope of this change (e.g. component or file name): (opcional)
   - Write a short, imperative tense description of the change (max 89 chars):
   - Provide a longer description of the change: (pressione enter para pular)
   - Are there any breaking changes? (y/N)
   - Does this change affect any open issues? (y/N)
     (Se sim, peça para listar os issues)
5. Com todas as respostas, gere um arquivo .json em uma pasta temp na raiz do monorepo contendo o resultado da análise.
   - Para cada grupo, inclua no .json o comando git add com os nomes dos arquivos daquele grupo, para agilizar o trabalho de preparação do commit.
