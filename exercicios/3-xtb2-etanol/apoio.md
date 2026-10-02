# Apoio · Ganhar velocidade com XTB2

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

O controle de etanol ajuda a distinguir vibração de O–H e libração da hidroxila. Consulte a preparação da geometria e as medidas desta janela de 0,5 ps antes de comparar timestep ou termostato.

## Entenda as escolhas

**1.000 × 0,5 fs = 500 fs = 0,5 ps = 5 × 10⁻¹³ s.** Este caso não usa termostato, solvente nem parede. Não compare energias absolutas de DFT e XTB2 como se tivessem o mesmo zero. Uma trajetória curta de uma molécula isolada não representa, por si só, etanol líquido.

Abra o [Laboratório de trajetórias](../../visualizador/index.html) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Geometria**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

## Resultados de referência

Os tempos abaixo incluem a inicialização do ORCA e foram medidos em um Intel Core Ultra 9 185H. Use-os para organizar a reprodução; o desempenho varia entre computadores.

### etanol_nve

Tempo de execução: **15.76 s**, com PAL8.

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

[Baixar input ORCA](inputs/preparar_etanol.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol_inicial.xyz) (opcional para executar; as coordenadas já estão no input)

[Input original usado na referência](resultados/preparar_etanol/preparar_etanol.inp).

<!-- input-source: inputs/preparar_etanol.inp -->
```text
# Apoio: otimiza o etanol com GFN2-xTB.
! XTB2 Opt TightOpt PAL8
%maxcore 256

# Carga 0, multiplicidade 1; coordenadas abaixo; XYZ separado opcional.
* xyz 0 1
C  -0.8883105789  0.1670031805 -0.0273158886
C   0.4657530425 -0.5115589698 -0.0367953327
O   1.4310747879  0.3229162225  0.5866699934
H  -0.8487409911  1.1174800549 -0.5695241286
H  -1.6471213402 -0.4704427172 -0.4896365992
H  -1.1963971221  0.3978445473  0.9977232020
H   0.7919970008 -0.7224282495 -1.0597258424
H   0.4246036544 -1.4558617236  0.5137906469
H   1.4671415467  1.1550476549  0.0848139491
*
```

### preparar_etanol

Tempo de execução: **0.62 s**, com PAL8. O critério de convergência da otimização foi atingido.

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
