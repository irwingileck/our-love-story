# Estudos de paisagem da home — iteração 2

São três composições **opt-in**. `/` continua exibindo a home anterior, sem fundo
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
