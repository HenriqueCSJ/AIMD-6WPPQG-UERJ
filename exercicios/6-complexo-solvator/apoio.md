# Apoio · Construir o ambiente com SOLVATOR

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

A montagem com SOLVATOR acrescenta águas ao redor de um complexo preparado. Consulte aqui a otimização do soluto, o relaxamento do agregado e as estruturas que alimentam a dinâmica; montagem e trajetória respondem a perguntas diferentes.

## Entenda as escolhas

**ALPB e águas explícitas têm papéis complementares neste modelo de aglomerado.** `CLUSTERMODE DOCKING` escolhe a montagem; `FIXSOLUTE TRUE` mantém o complexo fixo apenas durante essa construção. As seis novas águas não são forçadas a coordenar o metal. Após a montagem, o conjunto precisa de relaxação/preparação. A parede interna usada pelo SOLVATOR não acompanha um arquivo XYZ para a MD.

## Resultados de referência

Os tempos abaixo incluem a inicialização do ORCA e foram medidos em um Intel Core Ultra 9 185H. Use-os para organizar a reprodução; o desempenho varia entre computadores.

### zn_solvator

Tempo de execução: **201.59 s**, com PAL8.

[Comparar no aplicativo: complexo inicial → seis águas adicionadas](../../visualizador/index.html?exemplo=solvator&aba=trajetoria).

- [Saída completa](resultados/zn_solvator/zn_solvator.out)
- [Estrutura solvatada — XYZ](resultados/zn_solvator/zn_solvator.solvator.xyz)
- [Histórico de montagem — XYZ](resultados/zn_solvator/zn_solvator.solvator.solventbuild.xyz)
- [Registro da execução](resultados/zn_solvator/execucao.json)

### zn_solvator_2aguas

Tempo de execução: **64.41 s**, com PAL8.

[Comparar no aplicativo: complexo inicial → duas águas adicionadas](../../visualizador/index.html?exemplo=solvator_two&aba=trajetoria). Alterne as estruturas no seletor da trajetória: o complexo inicial tem 25 átomos e a montagem com duas águas adicionadas tem 31 átomos. São estruturas de referência; o histórico de montagem não é uma trajetória de MD.

- [Saída completa](resultados/zn_solvator_2aguas/zn_solvator_2aguas.out)
- [Estrutura solvatada — XYZ](resultados/zn_solvator_2aguas/zn_solvator_2aguas.solvator.xyz)
- [Histórico de montagem — XYZ](resultados/zn_solvator_2aguas/zn_solvator_2aguas.solvator.solventbuild.xyz)
- [Registro da execução](resultados/zn_solvator_2aguas/execucao.json)

## Preparação das estruturas — material de apoio

Estes cálculos já foram feitos pelos ministrantes. Não são novas execuções obrigatórias na aula. A otimização fornece uma geometria convergida no critério escolhido; sem análise vibracional, não afirmamos que ela seja um mínimo confirmado por frequências.

<details markdown="1"><summary>Input e resultados: preparar_complexo</summary>

[Baixar input ORCA](inputs/preparar_complexo.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_en_inicial.xyz) (obrigatório; manter na mesma pasta do input)

[Input original usado na referência](resultados/preparar_complexo/preparar_complexo.inp).

<!-- input-source: inputs/preparar_complexo.inp -->
```text
# Apoio: relaxa o complexo em solvente continuo.
! XTB2 ALPB(water) Opt TightOpt PAL8
%maxcore 256

%geom MaxIter 300 end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_en_inicial.xyz
```

### preparar_complexo

Tempo de execução: **3.89 s**, com PAL8. O critério de convergência da otimização foi atingido.

- [Saída completa](resultados/preparar_complexo/preparar_complexo.out)
- [Geometria final — XYZ](resultados/preparar_complexo/preparar_complexo.xyz)
- [Registro da execução](resultados/preparar_complexo/execucao.json)

</details>

<details markdown="1"><summary>Input e resultados: relaxar_solvato</summary>

[Baixar input ORCA](inputs/relaxar_solvato.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvator.xyz) (obrigatório; manter na mesma pasta do input)

[Input original usado na referência](resultados/relaxar_solvato/relaxar_solvato.inp).

<!-- input-source: inputs/relaxar_solvato.inp -->
```text
# Apoio: relaxa todos os atomos depois do SOLVATOR.
! XTB2 ALPB(water) Opt TightOpt PAL8
%maxcore 256

%geom MaxIter 300 end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvator.xyz
```

### relaxar_solvato

Tempo de execução: **20.79 s**, com PAL8. O critério de convergência da otimização foi atingido.

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
