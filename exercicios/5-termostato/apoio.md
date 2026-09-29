# Apoio · Permitir troca de energia com um banho

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

Esta página reúne as explicações extensas, preparações e **resultados originais de referência**. Os inputs completos que os produziram permanecem em cada pasta `resultados`. A atividade principal usa inputs concisos; os comentários foram reduzidos. No exercício 7, as medidas passam para o aplicativo e `Walls` substitui o alias antigo `Cell`.

## Entenda as escolhas

`Initvel 300_K` prepara a condição inicial. O termostato permite troca de energia com um banho a 300 K; portanto, **K + U não precisa ser constante em NVT**. A temperatura instantânea deve flutuar. O acoplamento de 100 fs = 0,1 ps = 10⁻¹³ s define a escala de atuação do banho, não a duração total da trajetória. Esta pequena molécula e este intervalo curto não demonstram amostragem canônica convergida.

Abra o [Laboratório de trajetórias](../../visualizador/index.html) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Distâncias**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

**Controle reutilizado:** [input NVE de 0,5 fs](../3-xtb2-etanol/inputs/etanol_nve.inp), [CSV NVE](../3-xtb2-etanol/resultados/etanol_nve/etanol_nve-md-ener.csv) e [trajetória NVE](../3-xtb2-etanol/resultados/etanol_nve/etanol_nve-traj.xyz). A geometria inicial é idêntica à deste exercício.

## Resultados de referência

Estes arquivos são saídas reais, preservadas sem suavização dos dados. Os tempos incluem a inicialização do programa e correspondem a uma execução por caso em um Intel Core Ultra 9 185H; não são uma promessa para todos os computadores. Se seu cálculo atrasar, use a referência e identifique-a como tal.

### etanol_csvr

Término normal: **sim**. Tempo medido: **13.61 s**, com PAL8.

- [Saída completa](resultados/etanol_csvr/etanol_csvr.out)
- [Energias e temperatura — CSV](resultados/etanol_csvr/etanol_csvr-md-ener.csv)
- [Trajetória — XYZ](resultados/etanol_csvr/etanol_csvr-traj.xyz)
- [Estado de reinício](resultados/etanol_csvr/etanol_csvr.mdrestart)
- [Registro da execução](resultados/etanol_csvr/execucao.json)

O CSV contém **1001 registros**, de **0 a 500 fs**, cobrindo **500 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **0.0125 Eh**; o intervalo máximo–mínimo de E é **0.0166 Eh**. A temperatura variou de **52.7 a 435.0 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/etanol_csvr/analise.json).

**Leitura dos dados:** na segunda metade destas referências, a temperatura média foi aproximadamente **150 K na NVE e 257 K na CSVR**, com inicialização em 300 K em ambos. Partindo de uma geometria otimizada, parte da energia cinética alimenta os movimentos vibracionais; inicializar velocidades não prepara uma distribuição de equilíbrio. O banho repõe energia no caso CSVR, mas esta trajetória curta ainda não estabelece convergência a 300 K.

## Para discutir

1. Em qual execução esperamos conservação aproximada de K + U?
2. Uma curva perfeitamente horizontal de temperatura seria uma exigência correta?
3. Por que a variação de E em NVT não mede, sozinha, erro de integração?

<details markdown="1"><summary>Conferir o raciocínio depois da atividade</summary>

A conservação aproximada de K + U é o diagnóstico do caso NVE sem vieses. Em NVT há troca de energia com o banho e flutuações de temperatura. A comparação deve separar essa troca física do erro numérico. Uma média próxima de 300 K em apenas 0,5 ps não prova equilíbrio ou amostragem correta.

</details>

## Manual do ORCA

- [Termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat)
- [Inicialização de velocidades](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#initvel)

**Antes de avançar:** registre o input usado, a duração física, uma observação e uma limitação da interpretação.
