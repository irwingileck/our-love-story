# Lista cumulativa de testes de regressão

Esta lista deve crescer junto com o produto. **Toda nova funcionalidade deve
acrescentar um cenário principal com ID sequencial (T03, T04, …), sua cobertura e
comando de execução**, sem remover ou enfraquecer os cenários existentes. Detalhes
adicionais de uma funcionalidade existente entram como subpassos (`test.step`) no
seu cenário. Hoje existem exatamente **T01 e T02**; cada um roda nos projetos
`desktop` e `mobile`, totalizando quatro execuções por suíte.

Arquivo executável: `tests/theme.spec.js`. Configuração: `playwright.config.js`.
O projeto mobile usa emulação Pixel 5 no Chromium, não um aparelho físico nem WebKit.

## T01 — Site abre e as animações existentes continuam funcionando

- Página e mensagem original visíveis; ilustração SVG com tamanho visível.
- Moldura atinge opacidade 1 após a entrada.
- Os oito elementos da cena mantêm animações CSS calculadas (não apenas presença de SVG).
- Nuvem inferior atinge opacidade 1 e mantém a animação infinita.
- A API `getAnimations()` confirma progresso ativo e avanço de `currentTime`;
  a transformação CSS efetivamente muda com o tempo, sem desativar animações.
- Contador apresenta anos/meses/dias/horas/minutos/segundos e seu texto avança.
- Nenhum `pageerror` nem erro de console, incluindo diagnósticos de hidratação.

```bash
npm test -- --grep T01
```

## T02 — Modo escuro funciona

Subpassos cumulativos:

1. Claro original sem preferência salva, inclusive com preferência de sistema escura.
2. Botão acessível “Modo escuro”, estado `aria-pressed`, alternância para fundo e
   texto escuros legíveis, mantendo ilustração, título e contador.
3. Retorno ao fundo verde-claro e ao texto original legível.
4. Posição fixa no canto superior direito em desktop/celular e após rolagem,
   área de toque mínima de 44 × 44 px e ausência de overflow horizontal.
5. Tab alcança o botão; foco com contorno de 3 px; Enter e Espaço alternam o tema.
6. Reload preserva escolhas explícitas nos dois sentidos (`dark` e `light`).
7. JavaScript da aplicação é temporariamente retido: o atributo do tema salvo
   já deve estar aplicado. No build de produção, a cor de fundo também é verificada
   antes de liberar os scripts. Depois da hidratação, o botão reflete o estado salvo.
8. Preferência inválida volta ao claro.
9. Gravação bloqueada (`QuotaExceededError`) não impede alternância.
10. Acesso ao próprio `localStorage` negado (`SecurityError`) não quebra a página;
    alternância funciona nos dois sentidos e reload volta ao claro.
11. Nenhum erro de página/console durante todo o fluxo, inclusive hidratação.

```bash
npm test -- --grep T02
```

## Executar tudo

```bash
npm ci
npx playwright install chromium
npm test
# Um projeto específico:
npm test -- --project=mobile
# Build/start local, sem deploy:
NEXT_TELEMETRY_DISABLED=1 npm run build
PLAYWRIGHT_TEST_PRODUCTION=1 npm test
```

Não executar dev e build ao mesmo tempo: ambos usam `.next`. A porta 3100 deve
estar livre; não reutilizamos silenciosamente um servidor antigo. Rastros de falhas
ficam em `test-results/` (ignorado pelo Git).

## Disciplina de TDD e evidências

Para cada novo comportamento: escrever uma verificação, executar e observar a
falha esperada pela ausência do comportamento (RED); implementar o mínimo e
executar toda a suíte (GREEN). Falha de instalação/navegador não conta como RED.
Verificações de comportamento já existente, como a animação original, são
caracterizações de regressão e podem passar sem alterar código de produção.

Nesta implementação, ciclos RED/GREEN cobriram: controle/tema claro; mudança para
escuro; retorno ao claro; posição fixa; foco de teclado; persistência; aplicação
pré-hidratação; tolerância a storage negado. Valor inválido e gravação negada
receberam verificações adicionais sobre o comportamento já coberto pela comparação
estrita e pelos blocos `try/catch` — não exigiram código novo.

Evidências RED/GREEN devem ficar fora do repositório, em `$TMPDIR`, com comando,
saída real e status, para revisão. Não salvar credenciais, perfis de navegador ou
arquivos de ambiente nos artefatos de testes. Sempre rodar os cenários anteriores
junto do novo antes de solicitar revisão. Na entrega original do modo escuro,
os avisos de Browserslist e a árvore Next antiga foram registrados como pendências;
a atualização de segurança abaixo resolve essa pendência sem mudar a lista T01/T02.

## Atualização de segurança — 18/10/2026

- RED antes de editar dependências: `npm audit --omit=dev --json` retornou **1**,
  com **4 pacotes** (3 high, 1 critical); `npm audit --json` retornou **1**, com
  **10** (1 low, 1 moderate, 7 high, 1 critical). JSONs e árvore antiga salvos em
  `$TMPDIR/our-love-story-security/`.
- Upgrade: Next **16.4.2**, React/ReactDOM **19.3.1**, estáveis consultados no npm;
  transitivas atualizadas dentro das faixas compatíveis com `npm update`.
  Sem `audit fix --force`, overrides ou supressão de alertas.
- `.nvmrc`: Node **22.x**; engines aceitam 22.x/24.x. Next 16 exige >=20.9.0.
  Playwright **1.60.0** e SVGR **8.1.0** foram mantidos. Scripts Next usam
  `--webpack` para preservar o loader SVG e styled-jsx existentes.
- GREEN: `npm ci`, `npm audit --omit=dev`, `npm audit`, `npm run security:audit`
  e `NEXT_TELEMETRY_DISABLED=1 npm run build` retornaram **0**. As duas consultas
  de auditoria tiveram **zero alertas conhecidos**, não uma garantia universal.
- PostCSS real instalado: **8.5.23**, com nanoid **3.3.20** e source-map-js
  **1.2.2**. A inspeção dos compilados do Next e seus loaders/minificador mostrou
  que o core é externo via `require('postcss')`; não existe diretório compilado
  `next/dist/compiled/postcss`. Nenhum override esconde uma cópia interna antiga.
- Regressão real em Chromium: **4/4 dev e 4/4 produção**, em Node **22.23.3** e
  também **24.22.0**, sem erro de console/página/hidratação. Ilustração, animações,
  contador, cores, teclado, persistência e tolerância a storage negado preservados.
- A primeira execução após o upgrade expôs uma corrida do teste: Tab enviado
  imediatamente após reload, antes da prontidão de CSS/hidratação, podia deixar
  o foco no body. RED registrado em `dev-initial.log` (2 passam/2 falham), com
  repro adicional em `focus-probe-2.log`. Apenas T02 foi sincronizado, esperando
  botão visível e contador atualizado pelo efeito cliente antes de enviar Tab.
  Nenhuma asserção de foco/Enter/Espaço ou de erros foi removida. Repetição adicional
  de T02 em desktop/mobile: **10/10**, status **0** (`focus-green-repeat.log`).
  Não houve erro real de hidratação que exigisse mudança no código da aplicação.
- O navegador padrão deste ambiente não tem bibliotecas Linux necessárias.
  Reutilizamos Chromium compatível já extraído em `$TMPDIR/chromium`, fontes e
  bibliotecas locais via `FONTCONFIG_PATH`, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
  e `LD_LIBRARY_PATH`; sem instalar pacotes do sistema. Os logs preservam as
  execuções reais, não resultados simulados.

Gate de segurança (falha em qualquer alerta, de qualquer severidade):

```bash
npm ci
npm run security:audit
# Equivalente:
npm audit --omit=dev && npm audit
```

Os logs finais são `node22-ci.log`, `node22-security-gate.log`, `node22-build.log`,
`node22-dev.log`, `node22-production.log`, `dev-green.log`, `production-green.log`,
`green-production-audit.json` e `green-full-audit.json` na pasta de evidências.
Nada foi publicado; validação manual da prévia e aprovação explícita continuam
obrigatórias antes de produção.
