# Our Love Story

Um site sobre um relacionamento, feito com Next.js **16.4.2** e React/ReactDOM
**19.3.1** (versões estáveis verificadas no registro npm em 18/10/2026).
Use **Node 22.x** (`nvm use`, conforme `.nvmrc`); Node 24.x também é aceito.
O Next 16 exige Node >=20.9.0 e não suporta Node 18. Build, auditoria e testes
reais foram verificados com Node 22.23.3 e 24.22.0; Playwright segue em `1.60.0`.
Não houve mudança de configuração ou credenciais da Vercel.

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
sem filtros sobre os SVGs. No tema escuro, a ilustração usa o verde suave
`#79a991`, inspirado na referência visual. O tema claro mantém as cores originais;
geometria, animações, mensagem e contador são preservados.

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
Existem **sete cenários principais**, verificados em desktop e celular (Chromium):
**T01** site/animações/contador, **T02** modo escuro, **T03** ilustração acompanha
o tema, **T04** paisagens em camadas, **T05** kits vetoriais originais transparentes,
**T06** híbridos Serra + Estelar e **T07** refinamentos de Céu das Serras
(T04/T05/T06 parametrizados em três propostas cada; T07 em duas). A suíte
completa soma **28 execuções**; T01–T06 permanecem inalterados.
A lista cumulativa, cobertura, comandos e regra para novas funcionalidades estão em [docs/TESTES.md](docs/TESTES.md).

As três propostas anteriores continuam em `/propostas/serra`, `/propostas/brisa`
e `/propostas/estelar`. Três novos híbridos dos SVGs aceitos de Serra e Céu:

- `/propostas/serra-lunar` — Serra Lunar: moldura alpina, nuvens alongadas e luas altas.
- `/propostas/horizonte-sereno` — Horizonte Sereno: horizonte baixo, picos gêmeos e nuvens duplas de Serra.
- `/propostas/ceu-das-serras` — Céu das Serras: margem alpina alta à esquerda e picos gêmeos baixos à direita.

Dois refinamentos adicionais preservam o céu, os ventos e as silhuetas suaves de
Céu das Serras, alterando somente as gravuras dos cantos inferiores:

- `/propostas/ceu-aberto` — Céu Aberto: remove os dois picos gravados do DOM.
- `/propostas/brisa-das-serras` — Brisa das Serras: substitui os picos por duas
  gravuras originais de bruma/correntes de vale, transparentes e assimétricas.

As famílias anteriores mantêm seus três links; os híbridos usam
“Lua / Vale / Serras”. Os refinamentos mostram apenas “Aberto / Brisa”, com nomes
completos acessíveis. A home `/` mantém a
apresentação anterior, sem paisagem/navegação. Não há escolha publicada, login ou
seleção persistida. Arquitetura, mistura por margem e evidências locais estão em
[docs/PROPOSTAS.md](docs/PROPOSTAS.md).

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

## Segurança das dependências — atualização de 18/10/2026

A árvore anterior tinha **4 pacotes de produção com alertas (3 high, 1 critical)**;
a auditoria completa tinha **10 (1 low, 1 moderate, 7 high, 1 critical)**.
Ambos os comandos retornaram status **1** antes da atualização (RED).
Após o upgrade, reinstalação limpa com `npm ci` e atualização compatível das
transitivas, **`npm audit --omit=dev` e `npm audit` retornaram status 0, sem alertas
conhecidos na consulta** (GREEN). Isso não garante ausência universal de falhas
nem substitui novas consultas ao registro.

```bash
npm ci
npm run security:audit
```

O gate executa `npm audit --omit=dev && npm audit`, sem filtro por severidade,
supressões, `--force` ou overrides. Se houver alerta ou erro de consulta, falha.
Next, React e ReactDOM estão fixados; o lock mantém as versões transitivas
compatíveis atualizadas (incluindo Babel, Browserslist, SVGO, js-yaml, nanoid e
source-map-js). Não se adicionaram novas funcionalidades.

O Next 16 usa Turbopack por padrão. Os scripts `dev` e `build` usam `--webpack`
para preservar o loader SVGR de `next.config.js` e o styled-jsx da cena original.
O Next instalado exige PostCSS **8.5.23**, já fora das faixas afetadas encontradas
na auditoria. A inspeção real de `next/dist/compiled` não encontrou uma cópia do
core PostCSS: loaders/minificador usam `require('postcss')`, resolvido para essa
versão, com nanoid **3.3.20** e source-map-js **1.2.2**. Não se mascarou uma cópia
interna vulnerável com overrides.

Referências oficiais consultadas: guia de upgrade para Next 16 e política de
suporte do Next.js (16.x em Active LTS); versões, engines e peers conferidos com
`npm view next@16.4.2 version engines peerDependencies dependencies --json` e
`npm view react-dom@19.3.1 peerDependencies --json`.

Evidências JSON, árvore instalada e logs ficam fora do Git, em
`$TMPDIR/our-love-story-security/`. A verificação local cobriu build e **4/4 testes
em dev + 4/4 em produção**, sem publicar. Publicação em produção continua
condicionada à validação manual; esta atualização não executou push/deploy.
