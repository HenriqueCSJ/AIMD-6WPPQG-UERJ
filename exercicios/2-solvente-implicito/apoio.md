# Apoio · Ativar o solvente com uma palavra

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

Esta página reúne as explicações extensas, preparações e **resultados originais de referência**. Os inputs completos que os produziram permanecem em cada pasta `resultados`. A atividade principal usa inputs concisos; os comentários foram reduzidos. No exercício 7, as medidas passam para o aplicativo e `Walls` substitui o alias antigo `Cell`.

## Entenda as escolhas

O solvente é representado como um meio contínuo que modifica a energia e as forças. **CPCM não é termostato e não é parede de confinamento.** Não esperamos uma diferença visual necessariamente grande em apenas 20 fs. A diferença entre energias instantâneas dos dois cálculos não é uma energia livre de solvatação.

Abra o [Laboratório de trajetórias](../../visualizador/index.html) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Distâncias**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

**Controle sem CPCM:** [CSV do exercício 1](../1-agua-dft/resultados/agua_dft/agua_dft-md-ener.csv).

## Resultados de referência

Estes arquivos são saídas reais, preservadas sem suavização dos dados. Os tempos incluem a inicialização do programa e correspondem a uma execução por caso em um Intel Core Ultra 9 185H; não são uma promessa para todos os computadores. Se seu cálculo atrasar, use a referência e identifique-a como tal.

### agua_cpcm

Término normal: **sim**. Tempo medido: **77.66 s**, com PAL8.

- [Saída completa](resultados/agua_cpcm/agua_cpcm.out)
- [Energias e temperatura — CSV](resultados/agua_cpcm/agua_cpcm-md-ener.csv)
- [Trajetória — XYZ](resultados/agua_cpcm/agua_cpcm-traj.xyz)
- [Estado de reinício](resultados/agua_cpcm/agua_cpcm.mdrestart)
- [Registro da execução](resultados/agua_cpcm/execucao.json)

O CSV contém **41 registros**, de **0 a 20 fs**, cobrindo **20 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **4.2e-05 Eh**; o intervalo máximo–mínimo de E é **6.5e-05 Eh**. A temperatura variou de **3.8 a 300.0 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/agua_cpcm/analise.json).

## Para discutir

1. Qual linha mudou? Quantos átomos foram acrescentados?
2. As duas trajetórias começaram da mesma posição e das mesmas velocidades?
3. Por que uma diferença de energia não fornece, sozinha, uma energia livre de solvatação?

<details markdown="1"><summary>Conferir o raciocínio depois da atividade</summary>

Acrescentamos CPCM(water) e nenhum átomo. A estrutura e a inicialização são iguais, mas o potencial é diferente e a evolução pode divergir. Uma energia livre envolve uma definição termodinâmica e amostragem adequada; não se obtém subtraindo dois valores instantâneos destas trajetórias curtas.

</details>

## Manual do ORCA

- [Modelos de solvatação](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/solvationmodels.html)
- [Dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html)

**Antes de avançar:** registre o input usado, a duração física, uma observação e uma limitação da interpretação.
