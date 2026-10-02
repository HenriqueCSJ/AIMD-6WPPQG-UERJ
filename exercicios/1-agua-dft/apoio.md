# Apoio · Uma molécula de água em movimento

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html)

Use este apoio para relacionar o passo de integração, a energia e a temperatura da água isolada. A preparação da geometria e os dados DFT permitem conferir as medidas realizadas em 01a.

## Entenda as escolhas

`Timestep 0.5_fs` avança meio femtossegundo a cada passo. `Run 40` produz **20 fs = 0,020 ps = 2 × 10⁻¹⁴ s**. `Randomize 42` fixa a semente de inicialização; `Initvel 300_K` prepara velocidades, e `Thermostat None` deixa a trajetória sem banho térmico. As posições não são otimizadas a cada passo: as forças determinam a aceleração.

Abra o [Laboratório de trajetórias](../../visualizador/index.html) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Geometria**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

## Temperatura e modos vibracionais

Os três modos vibracionais da água não são os graus de liberdade usados no cálculo de temperatura. Nesta referência, o ORCA declara **9 graus de liberdade ativos** (3 átomos × 3), embora remova movimentos do centro de massa e velocidade angular na inicialização. Para reproduzir o termômetro, siga a convenção registrada no output; não substitua esse número pelos três modos normais.

## Resultados de referência

Os tempos abaixo incluem a inicialização do ORCA e foram medidos em um Intel Core Ultra 9 185H. Use-os para organizar a reprodução; o desempenho varia entre computadores.

### agua_dft

Tempo de execução: **80.62 s**, com PAL8.

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

[Baixar input ORCA](inputs/preparar_agua.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua_inicial.xyz) (opcional para executar; as coordenadas já estão no input)

[Input original usado na referência](resultados/preparar_agua/preparar_agua.inp).

<!-- input-source: inputs/preparar_agua.inp -->
```text
# Apoio: otimiza a agua no nivel DFT usado na dinamica.
! BLYP def2-SVP TightSCF Opt PAL8
%maxcore 256

# Carga 0, multiplicidade 1; coordenadas abaixo; XYZ separado opcional.
* xyz 0 1
O   0.0000000000  0.0000000000  0.0000000000
H   0.7586020000  0.0000000000  0.5042840000
H  -0.7586020000  0.0000000000  0.5042840000
*
```

### preparar_agua

Tempo de execução: **18.36 s**, com PAL8. O critério de convergência da otimização foi atingido.

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
