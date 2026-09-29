# Apoio · Uma molécula de água em movimento

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

Esta página reúne as explicações extensas, preparações e **resultados originais de referência**. Os inputs completos que os produziram permanecem em cada pasta `resultados`. A atividade principal usa inputs concisos; os comentários foram reduzidos. No exercício 7, as medidas passam para o aplicativo e `Walls` substitui o alias antigo `Cell`.

## Entenda as escolhas

`Timestep 0.5_fs` avança meio femtossegundo a cada passo. `Run 40` produz **20 fs = 0,020 ps = 2 × 10⁻¹⁴ s**. `Randomize 42` fixa a semente de inicialização; `Initvel 300_K` prepara velocidades, e `Thermostat None` deixa a trajetória sem banho térmico. As posições não são otimizadas a cada passo: as forças determinam a aceleração.

Abra o [Laboratório de trajetórias](../../visualizador/index.html) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Distâncias**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

## Resultados de referência

Estes arquivos são saídas reais, preservadas sem suavização dos dados. Os tempos incluem a inicialização do programa e correspondem a uma execução por caso em um Intel Core Ultra 9 185H; não são uma promessa para todos os computadores. Se seu cálculo atrasar, use a referência e identifique-a como tal.

### agua_dft

Término normal: **sim**. Tempo medido: **80.62 s**, com PAL8.

- [Saída completa](resultados/agua_dft/agua_dft.out)
- [Energias e temperatura — CSV](resultados/agua_dft/agua_dft-md-ener.csv)
- [Trajetória — XYZ](resultados/agua_dft/agua_dft-traj.xyz)
- [Estado de reinício](resultados/agua_dft/agua_dft.mdrestart)
- [Registro da execução](resultados/agua_dft/execucao.json)

O CSV contém **41 registros**, de **0 a 20 fs**, cobrindo **20 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **5e-06 Eh**; o intervalo máximo–mínimo de E é **2.9e-05 Eh**. A temperatura variou de **3.1 a 300.0 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/agua_dft/analise.json).

## Preparação das estruturas — material de apoio

Estes cálculos já foram feitos pelos ministrantes. Não são novas execuções obrigatórias na aula. A otimização fornece uma geometria convergida no critério escolhido; sem análise vibracional, não afirmamos que ela seja um mínimo confirmado por frequências.

<details markdown="1"><summary>Input e resultados: preparar_agua</summary>

[Baixar input](resultados/preparar_agua/preparar_agua.inp) · [Baixar estrutura de partida](estruturas/agua_inicial.xyz)

```text
# Minicurso AIMD / ORCA 6.1.1 - preparar_agua
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Relaxa a geometria. PAL8 solicita oito recursos. BLYP/def2-SVP e o nivel
# DFT; TightSCF aperta a convergencia eletronica.
! BLYP def2-SVP TightSCF Opt PAL8

# Memoria em MB por processo. 256 x 8 = 2048 MB de orcamento, alem de memoria
# adicional.
%maxcore 256

# Le o XYZ: carga total 0, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 0 1 agua_inicial.xyz
```

### preparar_agua

Término normal: **sim**. Tempo medido: **18.36 s**, com PAL8. O critério de convergência da otimização foi atingido.

- [Saída completa](resultados/preparar_agua/preparar_agua.out)
- [Geometria final — XYZ](resultados/preparar_agua/preparar_agua.xyz)
- [Registro da execução](resultados/preparar_agua/execucao.json)

</details>

## Para discutir

1. Quantos registros o CSV contém, incluindo o passo inicial?
2. Quando a energia cinética diminui, o que acontece com a potencial?
3. A temperatura permaneceu em 300 K? Isso indica necessariamente um erro?

<details markdown="1"><summary>Conferir o raciocínio depois da atividade</summary>

São 41 registros para os passos 0 a 40. No caso simples sem banho nem parede, E = K + U deve apresentar variação pequena enquanto K e U trocam energia. A temperatura instantânea da molécula de três átomos oscila fortemente; inicializar em 300 K não mantém T fixa. Uma trajetória de 20 fs não demonstra equilíbrio.

</details>

## Manual do ORCA

- [Dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html)
- [Timestep](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#timestep)
- [Velocidades iniciais](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#initvel)

**Antes de avançar:** registre o input usado, a duração física, uma observação e uma limitação da interpretação.
