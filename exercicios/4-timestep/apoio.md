# Apoio · Testar um passo grande demais

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html?exemplo=timestep&aba=trajetoria)

Compare os controles de 0,25 e 2 fs pela mesma duração física, 500 fs. A energia revela erros de integração mesmo quando o programa chega ao fim; o caso de 2,5 fs da atividade principal permite acompanhar a degradação até a falha.

## Entenda as escolhas

O passo precisa resolver os movimentos mais rápidos, especialmente ligações envolvendo H. **Oscilação limitada e deriva sistemática são diferentes.** Um único valor final próximo do inicial pode esconder oscilações grandes; examine a série inteira. O CSV arredonda as energias, de modo que diferenças na última casa decimal exigem cuidado. Não usar um termostato para esconder a instabilidade.

Abra o [Laboratório de trajetórias](../../visualizador/index.html?exemplo=timestep&aba=trajetoria) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Geometria**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

**Controle reutilizado:** [Baixar input ORCA](../3-xtb2-etanol/inputs/etanol_nve.inp) · [Baixar geometria inicial (.xyz)](../3-xtb2-etanol/estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input), [CSV NVE](../3-xtb2-etanol/resultados/etanol_nve/etanol_nve-md-ener.csv) e [trajetória NVE](../3-xtb2-etanol/resultados/etanol_nve/etanol_nve-traj.xyz). A geometria inicial é idêntica à deste exercício.

## Resultados de referência

Os tempos abaixo incluem a inicialização do ORCA e foram medidos em um Intel Core Ultra 9 185H. Use-os para organizar a reprodução; o desempenho varia entre computadores.

### etanol_dt025

Tempo de execução: **44.87 s**, com PAL8.

- [Saída completa](resultados/etanol_dt025/etanol_dt025.out)
- [Energias e temperatura — CSV](resultados/etanol_dt025/etanol_dt025-md-ener.csv)
- [Trajetória — XYZ](resultados/etanol_dt025/etanol_dt025-traj.xyz)
- [Estado de reinício](resultados/etanol_dt025/etanol_dt025.mdrestart)
- [Registro da execução](resultados/etanol_dt025/execucao.json)

O CSV contém **2001 registros**, de **0 a 500 fs**, cobrindo **500 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **-9e-06 Eh**; o intervalo máximo–mínimo de E é **3.8e-05 Eh**. A temperatura variou de **47.4 a 300.0 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/etanol_dt025/analise.json).

### etanol_dt200

Tempo de execução: **5.63 s**, com PAL8.

- [Saída completa](resultados/etanol_dt200/etanol_dt200.out)
- [Energias e temperatura — CSV](resultados/etanol_dt200/etanol_dt200-md-ener.csv)
- [Trajetória — XYZ](resultados/etanol_dt200/etanol_dt200-traj.xyz)
- [Estado de reinício](resultados/etanol_dt200/etanol_dt200.mdrestart)
- [Registro da execução](resultados/etanol_dt200/execucao.json)

O CSV contém **251 registros**, de **0 a 500 fs**, cobrindo **500 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **0.00102 Eh**; o intervalo máximo–mínimo de E é **0.00253 Eh**. A temperatura variou de **46.9 a 300.0 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/etanol_dt200/analise.json).

**Leitura dos dados:** o intervalo máximo–mínimo de E foi 3.8e-05, 0.000114 e 0.00253 Eh para 0,25, 0,5 e 2,0 fs, respectivamente. O passo de 2,0 fs apresentou **cerca de 22 vezes** a variação do controle de 0,5 fs, embora ambos tenham terminado normalmente. Isso evidencia maior erro de integração neste teste; não confundir amplitude com uma deriva necessariamente monotônica.

## Para discutir

1. Por que não usamos o mesmo número de passos nos três casos?
2. Qual variante apresenta maior variação de energia nesta referência?
3. Se um cálculo termina normalmente, isso garante um timestep adequado?

<details markdown="1"><summary>Conferir o raciocínio depois da atividade</summary>

Manter o número de passos mudaria a duração física e confundiria a comparação. O resultado deve ser decidido pelos dados fornecidos: compare a amplitude e a tendência, não apenas o último ponto. Término normal confirma execução, não qualidade da integração. Um passo de 2 fs é deliberadamente grosseiro para este teste sem restrições, mas não precisa produzir uma explosão em todo sistema.

</details>

## Manual do ORCA

- [Timestep](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#timestep)
- [Integração e execução](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#run)

**Antes de avançar:** registre o input usado, a duração física, uma observação e uma limitação da interpretação.
