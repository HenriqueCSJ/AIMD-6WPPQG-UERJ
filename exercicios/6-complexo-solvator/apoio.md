# Apoio · Construir o ambiente com SOLVATOR

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

Esta página reúne as explicações extensas, preparações e **resultados originais de referência**. Os inputs completos que os produziram permanecem em cada pasta `resultados`. A atividade principal usa inputs concisos; os comentários foram reduzidos. No exercício 7, as medidas passam para o aplicativo e `Walls` substitui o alias antigo `Cell`.

## Entenda as escolhas

**ALPB e águas explícitas têm papéis complementares neste modelo de aglomerado.** `CLUSTERMODE DOCKING` escolhe a montagem; `FIXSOLUTE TRUE` mantém o complexo fixo apenas durante essa construção. As seis novas águas não são forçadas a coordenar o metal. Após a montagem, o conjunto precisa de relaxação/preparação. A parede interna usada pelo SOLVATOR não acompanha um arquivo XYZ para a MD.

## Resultados de referência

Estes arquivos são saídas reais, preservadas sem suavização dos dados. Os tempos incluem a inicialização do programa e correspondem a uma execução por caso em um Intel Core Ultra 9 185H; não são uma promessa para todos os computadores. Se seu cálculo atrasar, use a referência e identifique-a como tal.

### zn_solvator

Término normal: **sim**. Tempo medido: **201.59 s**, com PAL8.

- [Saída completa](resultados/zn_solvator/zn_solvator.out)
- [Estrutura solvatada — XYZ](resultados/zn_solvator/zn_solvator.solvator.xyz)
- [Histórico de montagem — XYZ](resultados/zn_solvator/zn_solvator.solvator.solventbuild.xyz)
- [Registro da execução](resultados/zn_solvator/execucao.json)

### zn_solvator_2aguas

Término normal: **sim**. Tempo medido: **64.41 s**, com PAL8.

- [Saída completa](resultados/zn_solvator_2aguas/zn_solvator_2aguas.out)
- [Estrutura solvatada — XYZ](resultados/zn_solvator_2aguas/zn_solvator_2aguas.solvator.xyz)
- [Histórico de montagem — XYZ](resultados/zn_solvator_2aguas/zn_solvator_2aguas.solvator.solventbuild.xyz)
- [Registro da execução](resultados/zn_solvator_2aguas/execucao.json)

## Preparação das estruturas — material de apoio

Estes cálculos já foram feitos pelos ministrantes. Não são novas execuções obrigatórias na aula. A otimização fornece uma geometria convergida no critério escolhido; sem análise vibracional, não afirmamos que ela seja um mínimo confirmado por frequências.

<details markdown="1"><summary>Input e resultados: preparar_complexo</summary>

[Baixar input](resultados/preparar_complexo/preparar_complexo.inp) · [Baixar estrutura de partida](estruturas/zn_en_inicial.xyz)

```text
# Minicurso AIMD / ORCA 6.1.1 - preparar_complexo
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Relaxa a geometria. PAL8 solicita oito recursos. XTB2 chama GFN2-xTB
# externo; PAL8 tambem define suas threads. ALPB(water) representa o ambiente
# continuo.
! XTB2 ALPB(water) Opt TightOpt PAL8

# Memoria em MB por processo. 256 x 8 = 2048 MB de orcamento, alem de memoria
# adicional.
%maxcore 256

# Limite de ciclos da otimizacao; conferir se o criterio de convergencia foi
# realmente atingido.
%geom MaxIter 300 end
# Le o XYZ: carga total 2, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 2 1 zn_en_inicial.xyz
```

### preparar_complexo

Término normal: **sim**. Tempo medido: **3.89 s**, com PAL8. O critério de convergência da otimização foi atingido.

- [Saída completa](resultados/preparar_complexo/preparar_complexo.out)
- [Geometria final — XYZ](resultados/preparar_complexo/preparar_complexo.xyz)
- [Registro da execução](resultados/preparar_complexo/execucao.json)

</details>

<details markdown="1"><summary>Input e resultados: relaxar_solvato</summary>

[Baixar input](resultados/relaxar_solvato/relaxar_solvato.inp) · [Baixar estrutura de partida](estruturas/zn_solvator.xyz)

```text
# Minicurso AIMD / ORCA 6.1.1 - relaxar_solvato
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Relaxa a geometria. PAL8 solicita oito recursos. XTB2 chama GFN2-xTB
# externo; PAL8 tambem define suas threads. ALPB(water) representa o ambiente
# continuo.
! XTB2 ALPB(water) Opt TightOpt PAL8

# Memoria em MB por processo. 256 x 8 = 2048 MB de orcamento, alem de memoria
# adicional.
%maxcore 256

# Limite de ciclos da otimizacao; conferir se o criterio de convergencia foi
# realmente atingido.
%geom MaxIter 300 end
# Le o XYZ: carga total 2, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 2 1 zn_solvator.xyz
```

### relaxar_solvato

Término normal: **sim**. Tempo medido: **20.79 s**, com PAL8. O critério de convergência da otimização foi atingido.

- [Saída completa](resultados/relaxar_solvato/relaxar_solvato.out)
- [Geometria final — XYZ](resultados/relaxar_solvato/relaxar_solvato.xyz)
- [Registro da execução](resultados/relaxar_solvato/execucao.json)

</details>

## Para discutir

1. Por que o número de átomos passa de 25 para 43?
2. O que ficou fixo durante SOLVATOR e o que será móvel na dinâmica?
3. Uma estrutura solvatada construída dessa forma é uma solução equilibrada?

<details markdown="1"><summary>Conferir o raciocínio depois da atividade</summary>

Cada água acrescenta três átomos: 25 + 6 × 3 = 43. O soluto é mantido fixo na montagem solicitada; a relaxação posterior libera todos os átomos. SOLVATOR produz um candidato inicial, não uma solução equilibrada. Uma geometria otimizada tampouco fornece uma constante de formação ou uma distribuição de espécies dependente de pH.

</details>

## Manual do ORCA

- [SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html)
- [ALPB na interface xTB](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html#solvation-in-xtb)
- [Otimização geométrica](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/optimizations.html)

**Antes de avançar:** registre o input usado, a duração física, uma observação e uma limitação da interpretação.
