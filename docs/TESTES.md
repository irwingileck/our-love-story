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
junto do novo antes de solicitar revisão. Avisos antigos de Browserslist e as
vulnerabilidades da árvore Next antiga são pendências separadas, não motivo para
alterar dependências de produção neste recurso.
