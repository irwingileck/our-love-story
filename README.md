# Our Love Story

Um site sobre um relacionamento, feito com Next.js 13 e React 18.
O Playwright está fixado em `1.60.0`, cuja faixa de Node inclui o Node 18 já
indicado por `.nvmrc`; essa configuração antiga não foi alterada. Esta alteração
foi verificada com Node 24.22.0.

## Executar localmente

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`. Para validar o build e executá-lo localmente:

```bash
NEXT_TELEMETRY_DISABLED=1 npm run build
npm start
```

Esses comandos não publicam nem fazem deploy.

## Modo escuro

O botão **Modo escuro** fica fixo no canto superior direito. Pode ser acionado
com clique/toque ou com Tab seguido de Enter/Espaço; o foco fica visível.
`aria-pressed` informa se o modo escuro está ativo. As cores usam variáveis CSS,
sem filtros sobre os SVGs. Ilustração, animações, mensagem e contador são preservados.

O padrão é o verde-claro original (`#ECFDF5`), independentemente do tema do sistema.
A escolha explícita é salva na chave `theme` do `localStorage` (`light`/`dark`).
Valor inválido ou acesso bloqueado resulta no tema claro. Se a gravação for
bloqueada, o botão continua funcionando na visita atual, sem garantir persistência.
Um pequeno script no `<head>` aplica o tema salvo antes da pintura; o primeiro
render React permanece igual ao HTML do servidor e sincroniza o estado do botão
após a montagem, evitando divergência de hidratação.

## Testes de navegador

```bash
npx playwright install chromium
npm test
# Também disponível: npm run test:e2e
```

O Playwright inicia e encerra o servidor local em `127.0.0.1:3100`.
Existem **dois cenários principais**, repetidos em desktop e celular (Chromium):
**T01** site/animações/contador e **T02** modo escuro. A lista cumulativa, cobertura,
comandos e regra para novas funcionalidades estão em [docs/TESTES.md](docs/TESTES.md).

Para testar o build de produção localmente, sem publicar nada:

```bash
NEXT_TELEMETRY_DISABLED=1 npm run build
PLAYWRIGHT_TEST_PRODUCTION=1 npm test
```

O navegador precisa das bibliotecas compartilhadas e fontes apropriadas ao ambiente.
É possível apontar um Chromium compatível existente com
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/caminho/do/chromium npm test`.
Não é necessário alterar dependências de produção para isso.

## TDD

A implementação foi feita em ciclos verticais: adicionar uma verificação de
comportamento, observar a falha esperada no navegador, implementar o mínimo e
executar a suíte completa. Novos detalhes de uma funcionalidade entram como
`test.step` no seu cenário; novas funcionalidades acrescentam cenários à lista
cumulativa. Não escrever toda a implementação antes dos testes.

## Pendências anteriores a esta alteração

`npm audit --omit=dev` continua indicando **4 pacotes de produção vulneráveis
(3 high, 1 critical)** na árvore antiga do Next.js. A atualização requer trabalho
separado; não foi executado `npm audit fix` nem upgrade de Next/React. O build
continua mostrando o aviso já existente de Browserslist/caniuse-lite desatualizado.
