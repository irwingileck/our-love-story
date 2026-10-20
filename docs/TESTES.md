# Lista cumulativa de testes de regressão

Esta lista deve crescer junto com o produto. **Toda nova funcionalidade deve
acrescentar um cenário principal com ID sequencial (T03, T04, …), sua cobertura e
comando de execução**, sem remover ou enfraquecer os cenários existentes. Detalhes
adicionais de uma funcionalidade existente entram como subpassos (`test.step`) no
seu cenário. Hoje existem **T01, T02, T03, T04, T05 e T06**; T01–T03 rodam em
`desktop` e `mobile` (seis execuções). T04 e T05 são parametrizados nas três paisagens
anteriores, e T06 nos três híbridos nesses mesmos projetos (mais seis cada),
totalizando **24 execuções** por suíte. Os registros abaixo de 12/18 execuções
são históricos das respectivas entregas, preservados cumulativamente.

Arquivos executáveis: `tests/theme.spec.js`, `tests/landscapes.spec.js`,
`tests/artwork.spec.js` e `tests/hybrids.spec.js`. Configuração: `playwright.config.js`.
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

## T03 — Ilustração acompanha o tema

- No tema escuro, todos os caminhos da moldura, montanha, nuvens, sol e ventos
  assumem o verde suave `#79a991`, sem filtro sobre a cena inteira.
- Os oito elementos mantêm as animações CSS; a nuvem continua mudando de
  transformação enquanto o tema escuro está ativo.
- A preferência escura salva reaplica a paleta ao recarregar.
- Voltar ao claro restaura as cores calculadas de todos os caminhos originais,
  incluindo o gradiente da montanha. Sem alteração dos arquivos SVG.
- Mesmas verificações de erros de página/console dos cenários anteriores.

```bash
npm test -- --grep T03
```

TDD: o novo cenário falhou em desktop/mobile com a cor original da moldura
(`rgb(9, 10, 9)`) antes do CSS do tema escuro; após a regra mínima, passou.
Verificações adicionais cobrem persistência, restauração e animação em movimento.
Logs RED/GREEN ficam em `$TMPDIR/our-love-story-tdd/illustration-*.log`.

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

## T04 — Três paisagens opt-in, responsivas e acessíveis

Arquivo novo: `tests/landscapes.spec.js`. T01–T03 permanecem intactos.
T04 roda separadamente em `/propostas/serra`, `/propostas/brisa` e
`/propostas/estelar`, em desktop e mobile: **seis execuções adicionais**.

Subpassos cumulativos:

1. Cada rota mantém desenho, mensagem e subtítulo originais. As geometrias de
   Brisa e Estelar diferem de Serra, não apenas as cores.
2. Três camadas DOM independentes (`mountains`, `ornaments`, `particles`),
   cada uma com SVG real e cobrindo a largura/altura do contêiner da página.
3. Decoração `aria-hidden`, `pointer-events: none`, sem controles/tabindex;
   todos os SVGs decorativos têm `focusable="false"`.
4. Silhuetas e ornamentos possuem versões mobile próprias. Montanhas ornamentais
   menores que 32% da largura do celular; sem overflow horizontal.
5. Tinta e lavagem mudam entre claro/escuro com transição CSS, retornam à paleta
   original e não substituem a ilustração. Sem filtro no HTML, body, página ou fundo.
6. Partículas de posição determinística têm durações independentes >=12 s;
   `getAnimations()` confirma avanço do tempo e a transformação realmente muda.
   Nuvens decorativas também se movem; nuvem original e contador continuam avançando.
7. `prefers-reduced-motion: reduce` remove todas as animações/transições **novas**;
   mantém as animações originais sem alterar seu comportamento anterior.
8. Navegação de comparação tem três links, rota atual indicada, alvos >=44 px,
   sem sobrepor botão de tema ou desenho. Mobile também verificado em 320 × 640.
9. Navegar entre propostas funciona; rotas recebem `noindex, nofollow`. Ao voltar
   a `/`, fundo, classes de proposta e navegação estão ausentes.
10. Nenhum erro de página/console, incluindo hidratação, em todos os fluxos.

```bash
npm test -- --grep T04
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
PLAYWRIGHT_TEST_PRODUCTION=1 npm test
npm run security:audit
```

### Evidências locais desta etapa

Pasta: `$TMPDIR/our-love-story-landscapes/` (fora do Git; temporária).

- Baseline antes de editar: **6/6** (`baseline.log`).
- Ciclos verticais RED → GREEN: `01-route-*`, `02-composition-*`, `03-theme-*`,
  `04-motion-*`, `05-reduced-*`, `06-brisa-*`, `07-estelar-*`, `08-navigation-*`,
  `09-mobile-ornaments-*`, `10-svg-focus-red.log`; o GREEN final desse último
  ciclo está em `dev-final.log`. Cada RED falhou pela ausência esperada, antes da
  implementação correspondente; todos os GREEN executaram a suíte cumulativa.
- `02-composition-green.log` registra um erro de configuração de CSS Modules:
  seletor global sem classe local. Corrigido com classe local opt-in;
  `02-composition-green-retry.log` passou. Não foi contado como RED funcional.
- O primeiro GREEN de navegação revelou aviso SSR de `<title>` com filhos múltiplos;
  refatorado para uma string única. Execuções finais e build sem esse aviso.
- Dev final: **12/12**, **45,6 s** (`dev-final.log`). Produção local: **12/12**,
  **36,7 s** (`production-final.log`), usando Node 24 e Chromium real com o fallback
  local de bibliotecas já documentado. Sem dependências novas ou pacotes de SO.
- Build: status 0, três novas rotas estáticas (`build-final.log`). Auditorias
  produção e completa: **zero vulnerabilidades conhecidas**, status 0 (`audit.log`).
- Capturas reais de produção em 1440 × 960 e 393 × 851, temas claro/escuro:
  `final-{serra,brisa,estelar}-{desktop,mobile}-{light,dark}.png` (**12 imagens**),
  todas inspecionadas visualmente. Revisão inicial levou a ornamentos mobile
  próprios e menores para não disputar espaço com a mensagem.
- `/` comparado pixel a pixel com capturas anteriores às mudanças, nos quatro
  tamanhos/temas: **zero pixels alterados**, excluindo somente o selo de ferramentas
  dev do Next no canto inferior esquerdo. Animações foram pausadas no mesmo tempo
  e contador dinâmico oculto nos dois lados. Ver `default-pixel-comparison.json`,
  `compare-default.cjs` e `capture.cjs` na pasta de evidências.
- Limites: Chromium emulado, não aparelho físico/Safari; desenho vetorial suave,
  não reprodução fotográfica da textura aquarelada da referência. As rotas são
  estudos visuais, não uma barreira de acesso. Nenhum push, deploy ou autenticação.

Arquitetura, rotas e tokens: `docs/PROPOSTAS.md`.


## T05 — Kits originais de gravura, transparentes e adaptados à composição

Arquivo: `tests/artwork.spec.js`. Parametrizado em Serra, Brisa e Estelar, em
`desktop` e `mobile`: **seis execuções adicionais**, **18 por suíte cumulativa**.
T01–T04 e suas asserções não foram editados, removidos ou enfraquecidos.

1. Cada rota renderiza duas instâncias visíveis de cada original (`mountain`,
   `clouds`, `wind`), com `data-artwork="{variante}-{tipo}"`; não basta declarar imports.
2. Os nove SVGs em `assets/landscapes/` são byte a byte os mestres originais
   revisados (SHA-256 fixado no teste), distintos da nuvem central `nuvem_inf.svg`.
3. XML válido, viewBox próprio, raiz `fill="none"`, tintas somente `currentColor`
   ou `none`; nenhum fundo retangular, raster, script, estilo, recurso externo ou
   referência `<use>`. SVG renderizado transparente e `focusable="false"`.
4. Nenhuma importação da nuvem central, componente `MountainDrawing` ou arco
   procedural antigo permanece em `Landscape.jsx`.
5. Proporções nativas preservadas, sem esticar; contornos dentro da largura da
   página, tamanhos legíveis, alturas de nuvem deliberadamente desencontradas,
   canal central livre no desktop e opacidade efetiva entre .45 e .80.
6. O traço real da montanha muda para `rgb(154, 183, 165)` no escuro e volta à
   cor clara; todos os originais acompanham o token e continuam transparentes.
7. Nuvens mobile têm largura >=39% da tela (a montanha continua <=32%, conforme
   T04); ficam junto ao pé afunilado do losango. Ventos ficam acima dos grupos
   centrais, não atrás das nuvens originais. A posição acompanha a largura da cena,
   não a altura do conteúdo textual.

```bash
npm test -- --grep T05
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
PLAYWRIGHT_TEST_PRODUCTION=1 npm test
npm run security:audit
```

### Iteração 2 — evidências reais

Pasta: `$TMPDIR/our-love-story-art-v2/integration/` (temporária, fora do Git).

- `01-kit-red.log`: **6 falhas funcionais** antes de copiar SVGs ou editar produção;
  nenhum marcador de arte original existia. `01-kit-green.log`: **18/18** após a
  integração mínima dos nove mestres e retirada dos ornamentos antigos.
- `02-composition-red.log`: **6 falhas** por nuvens sem composição assimétrica;
  `02-composition-green.log`: **18/18** após composição e tinta subordinada ao centro.
- Revisão visual encontrou nuvens mobile pequenas e ventos sobrepostos à cena.
  `03-mobile-readability-red.log`: **3 falhas** pela largura insuficiente, antes da
  correção; `03-mobile-readability-green.log`: **18/18 dev, 57,3 s** após ampliar e
  reposicionar apenas os ornamentos. As primeiras imagens ficam em
  `before-mobile-refinement/`, sem ocultar a revisão intermediária.
- `production-final.log`: **18/18 produção local, 43,4 s**, Chromium real/Node 24.
  `build.log`: build estático status 0; `audit.log`: produção e árvore completa com
  **zero vulnerabilidades conhecidas** na consulta. Nenhuma dependência nova.
- `preservation.json` e `verify-preservation.py`: **seis arrays de silhueta idênticos**,
  markup da camada `mountains` idêntico, **27 regras CSS dos planos preservadas
  literalmente** e **nove mestres byte a byte iguais** aos SVGs revisados.
- `default-pixel-comparison.json`: `/` comparada com a entrega anterior em quatro
  combinações tamanho/tema, **zero pixels alterados**, nenhuma máscara necessária;
  animações sincronizadas e contador dinâmico oculto em ambos os lados.
- `iteration2-{serra,brisa,estelar}-{desktop,mobile}-{light,dark}.png`: **12 capturas**
  finais reais do build (viewports 1440 × 960 e 393 × 851; PNGs desktop
  1440 × 960 e mobile 393 × 858 por captura de página inteira),
  inspecionadas visualmente; `capture.cjs`/`capture.log` reproduzem a coleta.
- Limites: Chromium e Pixel 5 emulado, não Safari/aparelho físico. Gravura vetorial,
  sem reprodução pixel a pixel da textura aquarelada. Nenhum commit, push, PR,
  deploy, merge ou mudança em produção nesta iteração.

## T06 — Três composições híbridas de kits aceitos

Arquivo acrescentado: `tests/hybrids.spec.js`. T01–T05 e os fingerprints de T05
permanecem byte a byte iguais. T06 é parametrizado em `serra-lunar`,
`horizonte-sereno` e `ceu-das-serras`, desktop/mobile: **seis execuções novas**,
**24 por suíte cumulativa**.

Cobertura:

1. Cada rota existe, mantém mensagem, cena e contador e tem título próprio /
   `noindex, nofollow`. Nenhuma arte Brisa participa dos híbridos.
2. A seleção por margem corresponde à tabela em `PROPOSTAS.md`. Cada SVG visível
   contém todos os caminhos do mestre real após a mesma normalização SVGO usada
   pelo SVGR, não um marcador ou desenho substituto. Fundo transparente,
   `fill="none"`, tintas `currentColor`/`none`, sem raster/retângulo/`use` e
   `focusable="false"`. T05 continua travando os hashes de todos os nove mestres.
3. Três camadas independentes preenchem a página inteira; `aria-hidden`, sem
   interação/foco, todos os SVGs não focáveis. Silhuetas selecionadas por margem.
4. Composição deliberadamente diferente: lua alta e nuvem baixa de Serra Lunar;
   nuvens altas e montanhas menores de Horizonte Sereno; margens desiguais de
   Céu das Serras. O vento esquerdo desta última deixa pelo menos 20 px até a
   caixa do pico alpino no desktop.
5. Partícula, nuvem decorativa e nuvem original realmente avançam `currentTime`
   e mudam `transform`. Partículas têm períodos independentes >=12 s. O contador
   realmente avança. Redução de movimento remove só animações novas.
6. Temas claro/escuro e reload preservam estado, tinta dos SVGs e mensagem.
   Acesso ao próprio `localStorage` bloqueado continua permitindo alternância;
   reload volta ao claro. T02 mantém todos os testes de falha de gravação,
   preferência inválida, pré-hidratação e teclado sem alterações.
7. Viewports 1440 × 960, 393 × 851 e 320 × 640 nos dois temas: sem overflow,
   proporção nativa, centro livre, nenhuma caixa de ornamento cruza os retângulos
   de texto efetivo (medidos por nó de texto, inclusive contador). Navegação não
   colide com botão de tema; links >=44 × 44 px. Formas desktop ficam nas laterais.
8. Só três links de híbridos, nomes acessíveis completos e indicador atual;
   navegação real para o híbrido seguinte funciona. `/` continua sem paisagem,
   classe de proposta ou navegação. Sem erros de página/console/hidratação.

```bash
npm test -- --grep T06
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
PLAYWRIGHT_TEST_PRODUCTION=1 npm test
npm run security:audit
git diff --check
```

### TDD vertical e evidências — híbridos

Pasta: `$TMPDIR/our-love-story-hybrids/`. Node real **24.22.0**, npm **11.19.1**;
Chromium com as bibliotecas/fontes locais já documentadas, sem pacote de SO,
dependência nova ou mudança de lockfile. `commands.md` lista comandos/status.

| Etapa | RED real | GREEN cumulativo |
| --- | --- | --- |
| Baseline, antes de produção | — | `baseline.log`: **18/18**, 56,9 s |
| Serra Lunar | `hybrids-01-red.log`: **2 falhas**, rota ausente | `hybrids-01-green-retry.log`: **20/20** |
| Horizonte Sereno | `hybrids-02-red.log`: **2 falhas**, rota ausente | `hybrids-02-green.log`: **22/22** |
| Céu das Serras | `hybrids-03-red.log`: **2 falhas**, rota ausente | `hybrids-03-green.log`: **24/24** |
| Ritmo, espaço negativo e escala | `hybrids-04-composition-red.log`: **5 falhas** | `hybrids-04-composition-green.log`: **24/24** |
| Legibilidade mobile | `hybrids-05-center-red.log`: **3 falhas mobile**, interseção com texto | `hybrids-05-center-green.log`: **24/24** |
| Vento afastado do pico, após revisão visual | `hybrids-06-summit-red.log`: **1 falha desktop** | `hybrids-dev-final.log`: **24/24**, 1,6 min |

O primeiro GREEN de mistura expôs uma asserção de teste inadequada: o SVGR
normaliza os caminhos pelo SVGO, logo comparar diretamente com o texto SVG bruto
falha mesmo renderizando o mestre correto. Só o novo teste foi corrigido para
comparar todos os caminhos após normalização equivalente; o log da tentativa
`hybrids-01-green.log` foi preservado. Não foi contado como RED funcional novo.

As primeiras caracterizações de área central (`hybrids-05-regression.log` /
`hybrids-05-probe.log`) incluíam wrappers block do contador como área de tinta de
largura total. O teste novo passou a medir cada nó de texto; a nova execução
`hybrids-05-center-red.log` então revelou os três problemas mobile reais, antes
da correção de layout. Nenhuma asserção existente foi alterada ou enfraquecida.

Verificação final:

- `hybrids-dev-final.log`: **24/24 dev**, 1,6 min, status 0; múltiplas execuções
  completas verdes durante os ciclos anteriores.
- `hybrids-production-final-refined.log`: **24/24 produção local**, 1,2 min,
  status 0, após o ajuste visual final.
- `build-final.log`: build status 0, seis rotas estáticas de propostas mais `/`.
- `audit.log`: `npm audit --omit=dev && npm audit`, **zero vulnerabilidades**
  conhecidas nas duas consultas, status 0, sem supressões ou novos pacotes.
- `preservation.json`: seis arrays idênticos, CSS anterior prefixo literal,
  arte central/mestres/arquivos protegidos intactos.
- `pixel-comparison.json`: **16 comparações** de `/` e três propostas antigas,
  desktop/mobile × claro/escuro, **zero pixels diferentes** contra build do HEAD
  inicial `c5075db`. Animações pausadas em 9 s e contador oculto nos dois lados;
  nenhuma máscara de pixels. Isso não afirma igualdade do contador dinâmico.
- **12 PNGs finais** `final-{slug}-{desktop,mobile}-{light,dark}.png`, capturados
  do build e inspecionados visualmente; viewports 1440 × 960 / 393 × 851 e
  página inteira 1440 × 960 / 393 × 858. `screenshots.json` é o inventário,
  `capture.cjs` reproduz capturas/comparação, `review-*.png` são pranchas de revisão.
  `before-summit-refinement/` preserva a versão anterior ao ajuste do vento.

Limites: testes em Chromium/celular emulado, sem Safari ou aparelho físico;
qualidade artística ainda depende da escolha do usuário. Sem commit, push,
publicação, merge, alteração de PR ou escrita remota nesta entrega.
