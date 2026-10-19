# Estudos de paisagem da home

São três composições **opt-in**. `/` continua exibindo a home anterior, sem fundo
novo nem navegação de propostas. Não existe seleção persistida, login ou mudança
na mensagem. A escolha definitiva depende de revisão e aprovação antes de integrar.

| Rota local | Nome | Composição |
| --- | --- | --- |
| `/propostas/serra` | Serra Serena | Serras em quatro planos nas laterais, nuvens altas e montanhas gravadas nos cantos baixos. A mais próxima da referência. |
| `/propostas/brisa` | Brisa Entre Vales | Margem esquerda mais alta, direita mais baixa, colinas curvas e três linhas de vento em ritmo assimétrico. |
| `/propostas/estelar` | Céu de Casa | Horizonte mais baixo, céu aberto, arcos lunares e pequenas constelações nas bordas. |

Os links discretos “Serra / Brisa / Céu” só aparecem nessas rotas. Cada uma tem
`noindex, nofollow` para não se apresentar como página final aos buscadores;
**isso não é controle de acesso**. Nenhuma rota foi publicada nesta etapa.

## Implementação

- `pages/index.js`: recebe a propriedade opcional `landscape`; sem ela, o DOM e
  os estilos visuais anteriores permanecem. Desenho, contador e textos são reutilizados.
- `pages/propostas/*.js`: entradas estáticas, uma por composição.
- `components/Landscape.jsx`: geometria vetorial própria, reutilização da nuvem SVG
  já existente, posições e tempos fixos — sem aleatoriedade nem diferença de hidratação.
- `components/Landscape.module.css`: composição, máscaras de desvanecimento,
  tokens, tema e movimento. Classes locais evitam interferência em `/` e em `.scene`.
- `components/ProposalNav.jsx`: links de comparação, título e metadado de prévia.

### Três camadas reais

1. `data-layer="mountains"`: quatro silhuetas de cada lado, profundidade por opacidade
   e máscara lateral para dissolver as serras antes do canal central da mensagem.
2. `data-layer="ornaments"`: montanhas hachuradas, nuvens e ventos; Estelar acrescenta
   arcos e pontos conectados. Nuvens flutuam entre 28–36 s e vento em 32 s.
3. `data-layer="particles"`: pequenos pontos/estrelas nas bordas, flutuando apenas
   4 × 9 px, com períodos de 18–54 s conforme a quantidade da composição.

As camadas preenchem o **contêiner inteiro da página**, inclusive além da primeira
viewport quando o conteúdo cresce. O fundo é absoluto, não um painel de altura
fixa. A paisagem inteira tem `aria-hidden="true"`, `pointer-events: none`, nenhum
controle/tabindex; todos os seus SVGs declaram `focusable="false"`.

### Responsividade real

Abaixo de 700 px há **outras geometrias de silhuetas e outros SVGs ornamentais**:
montanhas menores nos cantos, nuvens reposicionadas, menos partículas e opacidades
menores. Não se trata de recortar um único SVG desktop ampliado. O desenho central
original continua usando suas dimensões/animações anteriores. Controles mantêm
alvos de 44 px e a navegação não invade o botão de tema, inclusive a 320 px.

### Paleta e movimento

| Token local | Claro | Escuro |
| --- | --- | --- |
| `--landscape-wash` | `#548d75` | `#83b09a` |
| `--landscape-ink` | `#426d5a` | `#9ab7a5` |

O atributo de tema existente controla esses tokens. Tinta e preenchimentos fazem
transição de 600 ms; ornamentos escuros têm opacidade contida. Não há `invert()`,
filtro na página, WebGL, imagens externas, fonte remota ou dependência adicional.
As máscaras são apenas para dissolver os planos, não um efeito brilhante de interface.

`prefers-reduced-motion: reduce` desativa animações e transições **do novo fundo**.
As animações originais permanecem como antes; não foram reescritas por esta exploração.

## Verificação e evidências

A lista cumulativa está em [TESTES.md](TESTES.md), cenário **T04**. Os testes anteriores
T01–T03 não foram modificados. Suíte completa: **12/12 dev e 12/12 produção local**;
build e auditorias completa/produção sem falhas ou vulnerabilidades conhecidas.

Evidências temporárias: `$TMPDIR/our-love-story-landscapes/`.

- `dev-final.log`, `production-final.log`, `build-final.log`, `audit.log`.
- Ciclos RED/GREEN numerados de `01` a `10` (último GREEN: `dev-final.log`).
- `final-{serra,brisa,estelar}-{desktop,mobile}-{light,dark}.png`: 12 capturas reais
  da versão construída, todas revisadas visualmente. As primeiras capturas revelaram
  ornamentos mobile grandes demais; foram substituídos por versões menores próprias.
- `baseline-default-*` e `final-default-*`: quatro comparações de `/` sem diferenças
  visuais fora do selo dev do Next. `default-pixel-comparison.json` registra zero
  pixels diferentes com animações sincronizadas e contador oculto nas duas capturas.
- `capture.cjs`, `compare-default.cjs`, `run.sh`: reprodução das evidências neste ambiente.

Limites: Chromium e celular emulado, não Safari/aparelho físico. Os planos são
vetoriais suaves, não uma cópia pixel a pixel da textura aquarelada da referência.
Preservados fonte, texto e vermelho originais, inclusive no modo escuro. Nada foi
commitado, enviado ao remoto ou implantado; a revisão independente precede a prévia.
