# Apoio · Ganhar velocidade com XTB2

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

Esta página reúne as explicações extensas, preparações e **resultados originais de referência**. Os inputs completos que os produziram permanecem em cada pasta `resultados`. A atividade principal usa inputs concisos; os comentários foram reduzidos. No exercício 7, as medidas passam para o aplicativo e `Walls` substitui o alias antigo `Cell`.

## Entenda as escolhas

**1.000 × 0,5 fs = 500 fs = 0,5 ps = 5 × 10⁻¹³ s.** Este caso não usa termostato, solvente nem parede. Não compare energias absolutas de DFT e XTB2 como se tivessem o mesmo zero. Uma trajetória curta de uma molécula isolada não representa, por si só, etanol líquido.

Abra o [Laboratório de trajetórias](../../visualizador/index.html) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Distâncias**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

## Resultados de referência

Estes arquivos são saídas reais, preservadas sem suavização dos dados. Os tempos incluem a inicialização do programa e correspondem a uma execução por caso em um Intel Core Ultra 9 185H; não são uma promessa para todos os computadores. Se seu cálculo atrasar, use a referência e identifique-a como tal.

### etanol_nve

Término normal: **sim**. Tempo medido: **15.76 s**, com PAL8.

- [Saída completa](resultados/etanol_nve/etanol_nve.out)
- [Energias e temperatura — CSV](resultados/etanol_nve/etanol_nve-md-ener.csv)
- [Trajetória — XYZ](resultados/etanol_nve/etanol_nve-traj.xyz)
- [Estado de reinício](resultados/etanol_nve/etanol_nve.mdrestart)
- [Registro da execução](resultados/etanol_nve/execucao.json)

O CSV contém **1001 registros**, de **0 a 500 fs**, cobrindo **500 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **5.6e-05 Eh**; o intervalo máximo–mínimo de E é **0.000114 Eh**. A temperatura variou de **48.1 a 300.0 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/etanol_nve/analise.json).

## Preparação das estruturas — material de apoio

Estes cálculos já foram feitos pelos ministrantes. Não são novas execuções obrigatórias na aula. A otimização fornece uma geometria convergida no critério escolhido; sem análise vibracional, não afirmamos que ela seja um mínimo confirmado por frequências.

<details markdown="1"><summary>Input e resultados: preparar_etanol</summary>

[Baixar input](resultados/preparar_etanol/preparar_etanol.inp) · [Baixar estrutura de partida](estruturas/etanol_inicial.xyz)

```text
# Minicurso AIMD / ORCA 6.1.1 - preparar_etanol
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Relaxa a geometria. PAL8 solicita oito recursos. XTB2 chama GFN2-xTB
# externo; PAL8 tambem define suas threads.
! XTB2 Opt TightOpt PAL8

# Memoria em MB por processo. 256 x 8 = 2048 MB de orcamento, alem de memoria
# adicional.
%maxcore 256

# Le o XYZ: carga total 0, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 0 1 etanol_inicial.xyz
```

### preparar_etanol

Término normal: **sim**. Tempo medido: **0.62 s**, com PAL8. O critério de convergência da otimização foi atingido.

- [Saída completa](resultados/preparar_etanol/preparar_etanol.out)
- [Geometria final — XYZ](resultados/preparar_etanol/preparar_etanol.xyz)
- [Registro da execução](resultados/preparar_etanol/execucao.json)

</details>

## Para discutir

1. Qual parte do input determina as forças? Qual parte determina como avançar no tempo?
2. Quanto tempo físico foi simulado? Quanto tempo demorou no seu computador?
3. Qual arquivo precisa ser preservado para comparar os próximos exercícios?

<details markdown="1"><summary>Conferir o raciocínio depois da atividade</summary>

XTB2 escolhe o modelo de energia/forças; o bloco MD define integração e condições dinâmicas. A duração física é 0,5 ps, independentemente de o computador levar segundos ou minutos. Preserve principalmente o CSV de energias, a trajetória, a geometria inicial e o input; os controles precisam ter as mesmas condições.

</details>

## Manual do ORCA

- [XTB2 e interface externa](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html)
- [Dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html)

**Antes de avançar:** registre o input usado, a duração física, uma observação e uma limitação da interpretação.
