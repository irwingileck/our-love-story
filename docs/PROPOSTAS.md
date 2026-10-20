# Estudos de paisagem da home — iterações 2, 3 e 4

São oito composições **opt-in**: duas famílias de três, mais dois refinamentos de
Céu das Serras. As iterações 2 e 3 permanecem disponíveis e visualmente intactas;
a iteração 4 altera somente as gravuras inferiores da composição selecionada.
`/` continua exibindo a home anterior, sem fundo
novo nem navegação de propostas. Não existe seleção persistida, login ou mudança
na mensagem. A escolha definitiva depende de revisão e aprovação antes de integrar.

| Rota local | Nome | Composição |
| --- | --- | --- |
| `/propostas/serra` | Serra Serena | Quatro planos nas laterais, dois conjuntos de nuvens orgânicas desencontrados, ventos de espessura afilada e picos alpinos gravados nos cantos baixos. |
| `/propostas/brisa` | Brisa Entre Vales | Margem esquerda mais alta, direita mais baixa, colinas curvas, nuvens horizontais e um vale gravado assimétrico. |
| `/propostas/estelar` | Céu de Casa | Horizonte baixo, céu aberto, conjuntos de nuvens baixos e gravuras originais de lua crescente e vento no alto. |

Os links discretos “Serra / Brisa / Céu” só aparecem nessas rotas. Cada uma tem
`noindex, nofollow` para não se apresentar como página final aos buscadores;
**isso não é controle de acesso**. Esta iteração não publicou nem alterou prévia
remota ou produção.

## Origem das novas ilustrações

Os **nove mestres SVG** em `assets/landscapes/{serra,brisa,estelar}/` foram
produzidos originalmente por **três agentes LLM de ilustração independentes**,
um kit por composição, e revisados visualmente antes desta integração. Cada kit
contém `mountain.svg`, `clouds.svg` e `wind.svg`. A autoria aqui significa desenho
vetorial por LLM; não é alegação de uso de API externa de geração de imagens.

A origem local dos mestres revisados foi
`$TMPDIR/our-love-story-art-v2/{serra,brisa,estelar}/`. Somente os nove SVGs foram
copiados; PNGs de apresentação, montagens e evidências não entraram no repositório.
Os arquivos são idênticos byte a byte aos originais aceitos, comprovados pelos
SHA-256 fixados em T05 e pelo relatório de preservação. Não foram redesenhados,
recortados ou adulterados para a integração.

| Kit | Montanha (viewBox) | Nuvens (viewBox) | Vento (viewBox) |
| --- | --- | --- | --- |
| Serra | 480 × 300 | 480 × 260 | 480 × 190 |
| Brisa | 600 × 290 | 620 × 205 | 620 × 160 |
| Estelar | 640 × 280 | 640 × 210 | 520 × 230 |

São gravuras com silhuetas de rocha naturais, linhas seguindo as encostas,
espirais orgânicas e espaços abertos; não uma montanha procedural hachurada.
Todos têm fundo transparente, `fill="none"` na raiz e tintas `currentColor`/`none`,
sem raster, retângulo de fundo, recursos externos ou cópia de arte da cena central.
A nuvem antiga `assets/nuvem_inf.svg` **não é reutilizada em nenhum fundo**;
permanece exclusivamente na ilustração central original, que não foi alterada.

## Implementação

- `pages/index.js`: recebe a propriedade opcional `landscape`; sem ela, o DOM e
  os estilos visuais anteriores permanecem. Desenho, contador e textos são reutilizados.
- `pages/propostas/*.js`: entradas estáticas, uma por composição.
- `components/Landscape.jsx`: nove imports SVGR, seleção explícita de kit e
  instâncias desktop/mobile dos mestres, posições e tempos determinísticos.
  Foram removidos `MountainDrawing`, a importação da nuvem central, ventos ad hoc
  e os arcos de céu procedurais da iteração anterior.
- `components/Landscape.module.css`: composição, tokens, tema e movimento.
  Classes locais evitam interferência em `/` e em `.scene`.
- `components/ProposalNav.jsx`: links de comparação, título e metadado de prévia.

### Três camadas reais

1. `data-layer="mountains"`: quatro silhuetas de cada lado, profundidade por
   opacidade e máscara lateral. **Os seis arrays de caminhos, markup e regras de
   layout/opacidade desses planos aprovados permanecem inalterados.**
2. `data-layer="ornaments"`: apenas os novos mestres importados. Cada raiz tem
   `data-artwork="{variante}-{tipo}"` e `focusable="false"`; a nuvem mantém
   `data-decorative-cloud` e a montanha `data-corner-mountain` para regressão real.
   Nuvens flutuam em 28/37 s e ventos em 32/41 s, sem alongar a arte.
3. `data-layer="particles"`: pequenos pontos/estrelas nas bordas, flutuando apenas
   4 × 9 px, com períodos de 18–54 s conforme a quantidade da composição.

As camadas preenchem o **contêiner inteiro da página**, inclusive além da primeira
viewport quando o conteúdo cresce. O fundo é absoluto, não um painel de altura
fixa. A paisagem inteira tem `aria-hidden="true"`, `pointer-events: none`, nenhum
controle/tabindex; todos os seus SVGs declaram `focusable="false"`.

### Composição e responsividade

No desktop, os bancos de gravura usam 31% da largura, com respiro de 1,5% nas
bordas. Nuvens e montanhas têm alturas desencontradas e espaços distintos em cada
proposta. Um canal central de pelo menos 35% permanece livre de ornamentos.
Os SVGs mantêm a proporção nativa, sem `preserveAspectRatio="none"`, filtros,
cortes de contorno ou máscaras que escondam uma ilustração inacabada. A dissolução
central continua nos planos de silhueta, não nas gravuras novas.

Abaixo de 700 px há **geometrias de silhueta mobile próprias e containers separados
para os ornamentos**. Montanhas ocupam 31% da tela (limite T04: 32%); nuvens usam
40,3% para que as espirais sejam reconhecíveis. As nuvens ladeiam o pé do losango,
com posição baseada na largura da cena, e os ventos ficam acima dos grupos
originais. Não se trata de esticar um único SVG para preencher a altura da página.
A revisão visual detectou a versão mobile inicialmente pequena/sobreposta e levou
a essa segunda composição, documentada por outro ciclo RED/GREEN.

O desenho central mantém suas dimensões/animações anteriores. Controles mantêm
alvos de 44 px e a navegação não invade o botão de tema, inclusive a 320 px.

### Paleta e movimento

| Token local | Claro | Escuro |
| --- | --- | --- |
| `--landscape-wash` | `#548d75` | `#83b09a` |
| `--landscape-ink` | `#426d5a` | `#9ab7a5` |

O atributo de tema existente controla esses tokens. Tinta e preenchimentos fazem
transição de 600 ms. Ornamentos têm opacidade .62 no claro/.58 no escuro em desktop
e .76 em mobile, para manter os traços finos legíveis sem competir com o centro.
Não há `invert()`, filtro na página, WebGL, imagens externas, fonte remota ou
qualquer dependência adicional. As máscaras preservadas são dos planos distantes.

`prefers-reduced-motion: reduce` desativa animações e transições **do novo fundo**.
As animações originais permanecem como antes; não foram reescritas por esta exploração.

## Verificação e evidências

A lista cumulativa está em [TESTES.md](TESTES.md), cenários **T04 e T05**.
T01–T04 não foram modificados. Suíte completa final: **18/18 dev (57,3 s)** e
**18/18 produção local (43,4 s)**, build status 0 e auditorias completa/produção
com zero vulnerabilidades conhecidas na consulta.

Evidências desta iteração: `$TMPDIR/our-love-story-art-v2/integration/`.

- `01-kit-{red,green}.log`, `02-composition-{red,green}.log`,
  `03-mobile-readability-{red,green}.log`: ciclos verticais reais, começando com
  falha por ausência de arte antes de copiar qualquer mestre ou editar produção.
- `production-final.log`, `build.log`, `audit.log`.
- `iteration2-{serra,brisa,estelar}-{desktop,mobile}-{light,dark}.png`: **12 capturas**
  finais do build em viewports 1440 × 960 e 393 × 851; PNGs 1440 × 960 e
  393 × 858 (página inteira), todos inspecionados visualmente; `before-mobile-refinement/` preserva as intermediárias.
- `preservation.json`: seis arrays idênticos, markup dos planos idêntico, 27 regras
  CSS dos planos preservadas literalmente e nove mestres byte a byte iguais.
- `default-pixel-comparison.json`: quatro comparações de `/` com a entrega anterior,
  **zero pixels diferentes**, sem máscara necessária; animações sincronizadas e
  contador dinâmico oculto nas duas capturas.
- `capture.cjs`, `compare-default.cjs`, `verify-preservation.py`: reprodução local.

Limites: Chromium e celular emulado, não Safari/aparelho físico. Os planos são
vetoriais suaves e a arte é gravura transparente, **não uma reprodução pixel a pixel
da textura aquarelada da referência**. Preservados fonte, texto e vermelho originais,
inclusive no modo escuro. Nada foi commitado, enviado ao remoto ou implantado nesta
iteração; a revisão independente precede a prévia.

## Iteração 3 — três híbridos de Serra + Céu (Estelar)

Os três candidatos anteriores continuam intactos. Estes estudos adicionais
**recombinam os SVGs aceitos**, sem criar desenhos substitutos, editar mestres ou
usar o kit Brisa. Todos usam a mesma paleta; as diferenças são arte selecionada,
posição, escala, densidade de horizonte e espaço negativo.

| Rota local | Nome / link curto | Margem esquerda: montanha / nuvens / vento | Margem direita: montanha / nuvens / vento | Silhuetas |
| --- | --- | --- | --- | --- |
| `/propostas/serra-lunar` | Serra Lunar / Lua | Serra / Estelar / Estelar | Serra / Estelar / Estelar | Serra em ambas |
| `/propostas/horizonte-sereno` | Horizonte Sereno / Vale | Estelar / Serra / Serra | Estelar / Serra / Estelar | Estelar em ambas |
| `/propostas/ceu-das-serras` | Céu das Serras / Serras | Serra / Estelar / Serra | Estelar / Serra / Estelar | Serra à esquerda, Estelar à direita |

- **Serra Lunar:** picos alpinos grandes nos cantos inferiores, planos altos de
  Serra, fitas de nuvem Estelar a 31%/43% da página e luas/ventos no alto (8%/15%).
  A moldura é mais envolvente, sem invadir o canal central.
- **Horizonte Sereno:** picos gêmeos menores (29% da largura), quatro planos baixos
  de Estelar e amplo céu vazio. Nuvens duplas de Serra sobem para 12%/27%; vento
  Serra à esquerda e lua Estelar alta à direita evitam uma simetria literal.
- **Céu das Serras:** pico alpino maior e margem alta à esquerda, picos gêmeos
  menores e horizonte baixo à direita (31%/28% no desktop). Nuvens e ventos trocam
  de kit entre margens; o vento esquerdo flutua entre nuvem e montanha, sem cruzar
  o pico. A composição é diagonal, não uma versão recolorida de Serra.

No celular, as montanhas continuam pequenas, abaixo do contador, com geometrias
mobile dos planos aprovados. Serra Lunar mantém duas gravuras alpinas; Horizonte
Sereno usa picos gêmeos menores e desencontrados; Céu das Serras combina alpine de
32% e picos gêmeos de 29%. Nuvens legíveis de cerca de 40% ladeiam o pé do losango;
ventos ficam a 60 px do alto, afastados dos grupos centrais. A posição acompanha
a largura da cena, não a altura variável do texto. Verificados 393 px e 320 px,
com os dois temas e controles sem colisão.

### Implementação e preservação

`components/proposals.js` centraliza nomes, links e a seleção dos três mestres e
da silhueta por margem. `Landscape.jsx` mantém um único renderer para as seis
propostas; as variantes anteriores continuam selecionando seus próprios kits.
Não há componente de desenho novo ou cópia triplicada da home.

A navegação identifica a família: os híbridos mostram apenas **Lua / Vale /
Serras**; as rotas anteriores mantêm **Serra / Brisa / Céu**. Cada link tem nome
completo em `aria-label`/`title`, alvo de pelo menos 44 px e indicação de página
atual. O título HTML identifica o estudo, sem adicionar heading visível ou mudar
a mensagem. Metadado continua `noindex, nofollow`, não controle de acesso.

Os seis arrays de silhueta são literalmente iguais ao HEAD de partida. O CSS
anterior permanece prefixo byte a byte do arquivo: somente seletores opt-in dos
três híbridos foram acrescentados. Os nove mestres, toda a arte central, home,
contador, tema, scripts, dependências e arquivos T01–T05 não foram modificados.
Persistência/fallback de storage, animações originais e três camadas integrais
continuam funcionando. Redução de movimento continua restrita à decoração nova.

### Verificação local desta iteração

Evidências: `$TMPDIR/our-love-story-hybrids/`, fora do Git.

- Baseline: **18/18**, antes de qualquer alteração de implementação.
- Ciclos verticais de rota/mistura: `hybrids-01-red.log` →
  `hybrids-01-green-retry.log` (**20/20**); `hybrids-02-*` (**22/22**);
  `hybrids-03-*` (**24/24**). As rotas foram implementadas uma de cada vez.
- `hybrids-04-composition-*`: RED real de posição/escala, seguido de **24/24**.
- `hybrids-05-center-red.log`: três falhas mobile reais de interseção com texto;
  `hybrids-05-center-green.log`: **24/24** após baixar montanhas e subir uma nuvem.
- Revisão visual detectou vento cruzando o pico esquerdo de Céu das Serras.
  `hybrids-06-summit-red.log` registra a falha antes da correção de posição;
  `hybrids-dev-final.log`: **24/24 dev, 1,6 min** após o ajuste.
- `hybrids-production-final-refined.log`: **24/24 produção local, 1,2 min**;
  `build-final.log`: build estático status 0; `audit.log`: produção e árvore
  completa com **zero vulnerabilidades conhecidas** na consulta, status 0.
- `final-{serra-lunar,horizonte-sereno,ceu-das-serras}-{desktop,mobile}-{light,dark}.png`:
  **12 capturas reais finais**, todas inspecionadas visualmente. Viewports
  1440 × 960 e 393 × 851; PNGs de página inteira 1440 × 960 e 393 × 858.
  `review-*.png` reúne as quatro comparações; `before-summit-refinement/`
  preserva as imagens anteriores ao último ajuste. Frames de captura pausados
  em 9 s para comparação; movimento real é comprovado em T06, não pelas imagens.
- `pixel-comparison.json`: **16 comparações** de `/`, Serra, Brisa e Estelar,
  em desktop/mobile e claro/escuro, com **zero pixels diferentes** frente ao
  build do HEAD inicial `c5075db`. Animações sincronizadas, somente o contador
  dinâmico oculto em ambos; sem máscaras de pixels. `capture.cjs` reproduz a coleta.
- `preservation.json`/`verify-preservation.py`: seis arrays, todos os SVGs e os
  arquivos protegidos iguais ao HEAD; CSS antigo preservado literalmente.

Limites: Chromium e celular emulado, não Safari/aparelho físico. Testes não
constituem aprovação artística do usuário. Os estudos continuam locais e
**não commitados** nesta entrega: nenhum push, deploy, merge ou alteração de PR /
produção. Revisão independente e escolha explícita continuam pendentes.

## Iteração 4 — Céu Aberto e Brisa das Serras

O usuário aprovou a composição de Céu das Serras, exceto os dois picos gravados
nos cantos inferiores, marcados em azul na referência. **As montanhas suaves de
fundo não foram removidas.** A rota selecionada original continua disponível.

| Rota | Nome / link | Diferença exclusiva na base |
| --- | --- | --- |
| `/propostas/ceu-aberto` | Céu Aberto / Aberto | Não renderiza nenhuma das duas gravuras de pico, inclusive no DOM do breakpoint oculto; não adiciona ornamento substituto. |
| `/propostas/brisa-das-serras` | Brisa das Serras / Brisa | Substitui os picos por duas gravuras novas de bruma e correntes de vale, horizontais, distintas e assimétricas. |

Ambas herdam `base: 'ceu-das-serras'` em `components/proposals.js`: mesma geometria
Serra à esquerda e Estelar à direita, mesmas nuvens Estelar/Serra, mesmos ventos
Serra/Estelar, mesmas larguras e posições superiores, partículas e paleta. O CSS
aprovado é herdado, não copiado. `Landscape.jsx` continua sendo um único renderer,
com seleção mínima do ornamento inferior. Cena central, mensagem, contador,
preferência de tema e animações originais não foram alterados.

### Arte nova, sem reciclagem das nuvens superiores

`assets/landscapes/refinements/mist-left.svg` e `mist-right.svg`: dois SVGs originais
LLM, finalizados e inspecionados em scratch antes da integração. Cada viewBox é
**600 × 150**, com contornos baixos orgânicos, pequenos redemoinhos e fitas de
vento afiladas; não são três senóides, picos pontudos nem cópias do topo. O mestre
esquerdo concentra a espiral à esquerda; o direito abre um curso mais longo antes
da espiral à direita. Não se espelhou uma estampa única.

Fundo transparente, raiz `fill="none"`, `currentColor`, `aria-hidden="true"`,
`focusable="false"`; sem raster, script, referências externas ou preenchimento de
fundo. Os nove mestres anteriores e toda a arte central permanecem byte a byte
iguais. Proporção natural 4:1, sem esticar, recortar, mascarar ou reduzir opacidade
para ocultar desenho. A opacidade é a mesma dos ornamentos aprovados.

Os bancos mantêm as larguras aprovadas de 31%/28% no desktop e 32%/29% no celular.
A bruma fica a 7%/4% da base no desktop e 2%/1% no celular: abaixo do contador,
sem invadir o canal central. Animação lateral de 46/53 s reutiliza o movimento
suave existente, com fases distintas; redução de movimento a desliga.

As novas rotas mostram somente **Aberto / Brisa**, com nomes completos acessíveis.
As famílias **Serra / Brisa / Céu** e **Lua / Vale / Serras** continuam sem mudança;
nenhum link adicional foi empilhado junto ao botão de tema a 320 px.

### Evidências e limites

Cenário cumulativo T07 em `docs/TESTES.md`: baseline **24/24**, RED de Céu Aberto
(rota ausente, 2 falhas) → **26/26**, RED de Brisa das Serras (rota ausente, 2
falhas) → **28/28 dev**. Build status 0; **28/28 produção local**, auditorias de
produção/completa com **zero vulnerabilidades conhecidas** na consulta.

Pasta `$TMPDIR/our-love-story-refinements/`: oito PNGs finais
`final-{ceu-aberto,brisa-das-serras}-{desktop,mobile}-{light,dark}.png`, todos
inspecionados; `isolated-assets.png` registra a revisão anterior à integração.
`pixel-comparison.json` comprova **28 comparações com zero pixels diferentes**
para a home e as seis rotas antigas, desktop/mobile e ambos os temas, contra build
independente do HEAD `463b338`. Frames sincronizados em 9 s, só contador dinâmico
oculto nos dois lados; sem máscaras. `preservation.json` verifica os arquivos,
arrays e prefixos CSS/configuração preservados. `capture.cjs` reproduz a coleta.

Chromium 153 e celular emulado, não Safari/aparelho físico. Nenhum commit, push,
deploy, merge ou escrita de PR/remoto; mudanças locais para revisão independente.
A qualidade artística permanece sujeita à escolha do usuário.
