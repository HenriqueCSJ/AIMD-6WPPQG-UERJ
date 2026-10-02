# 02b · A instabilidade aparece antes da explosão

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**Parte do bloco 02 (35 min com o controle NVE) · etanol · XTB2 · NVE**

> **Pergunta:** A temperatura parecer razoável significa que a integração está boa?

## 1. Aumente o passo — de propósito

Use **2,5 fs**, mantendo a geometria inicial, a semente e o alvo de **500 fs = 5 × 10⁻¹³ s**. A referência registra **131 quadros, até 325 fs**, e termina com erro. Não chegamos ao alvo.

[Baixar pacote](aula-etanol_instavel.zip) · [Baixar input ORCA](inputs/etanol_instavel.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/etanol_instavel.inp -->
```text
# Exemplo didatico; oito processos solicitados.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "etanol_instavel-traj.xyz"
  # Passo propositadamente excessivo; nao usar em producao.
  Timestep 2.5_fs
  Thermostat None
  Run 200
end
* xyz 0 1
  C          -0.90144100150192      0.17625125426761     -0.03297153896772
  C           0.46936125625488     -0.49209041813779     -0.04596375886747
  O           1.46256276612237      0.28843917261435      0.57717031816153
  H          -0.88148499664442      1.09990657237907     -0.61006530877166
  H          -1.64361180355502     -0.48789343144170     -0.46692815539801
  H          -1.19233363929951      0.41110994548345      0.98810024770280
  H           0.76068917865250     -0.72317969030966     -1.08182288177168
  H           0.44081648762406     -1.42618852781151      0.51953633130848
  H           1.48544175234705      1.15364512295618      0.15294474650374
*
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca etanol_instavel.inp > etanol_instavel.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca etanol_instavel.inp > etanol_instavel.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

## 2. Leia os avisos da própria trajetória

No filme, use **0,25×** ou avance quadro a quadro para examinar a degradação; o quadro 31 corresponde a 75 fs. A velocidade de reprodução não altera a simulação.

[Abrir falha e correção](../../visualizador/index.html?exemplo=timestep)

1. Selecione **Total · E**, em ΔE, e examine **os primeiros 75 fs**. A energia não precisa esperar o cálculo abortar para revelar o erro.
2. A 25 fs, T é **127 K**, mas ΔE já é **+23,2 kJ/mol**. A 75 fs, T é **269 K** e ΔE chega a **+43,6 kJ/mol**. Temperatura aparentemente plausível não garante boa integração.
3. Volte à trajetória completa. A 100 fs, T já é aproximadamente **69 mil K**. Em Geometria, O 2–H 8 está a **19,8 Å**: o modelo numérico perdeu o sentido químico muito antes da última linha do output.
4. O último registro é de **325 fs**, seguido de erro de avaliação eletrônica. O `.scf.log` preservado permite conferir o diagnóstico. O instante exato da falha pode mudar entre ambientes.

**Por que ocorre?** As forças mudam rapidamente quando ligações envolvendo H esticam. Um passo grande atualiza as posições usando informação que já não descreve bem a força no novo ponto. O erro de integração aumenta as distorções e pode alimentar ainda mais energia. A ruptura neste cálculo não é evidência de uma reação física.

## 3. Corrija a causa e repita

Volte à **estrutura inicial intacta**, sem usar o restart defeituoso. Reduza para **0,5 fs** e use **1000 passos** para conservar o alvo de 500 fs. O resultado corrigido abaixo já está calculado e pode ser reutilizado do controle 02a.

[Baixar pacote](aula-etanol_corrigido.zip) · [Baixar input ORCA](inputs/etanol_corrigido.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/etanol_corrigido.inp -->
```text
# Etanol com GFN2-xTB, sem banho termico (NVE).
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "etanol_corrigido-traj.xyz"
  # 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 0, multiplicidade 1; coordenadas abaixo; XYZ separado opcional.
* xyz 0 1
  C          -0.90144100150192      0.17625125426761     -0.03297153896772
  C           0.46936125625488     -0.49209041813779     -0.04596375886747
  O           1.46256276612237      0.28843917261435      0.57717031816153
  H          -0.88148499664442      1.09990657237907     -0.61006530877166
  H          -1.64361180355502     -0.48789343144170     -0.46692815539801
  H          -1.19233363929951      0.41110994548345      0.98810024770280
  H           0.76068917865250     -0.72317969030966     -1.08182288177168
  H           0.44081648762406     -1.42618852781151      0.51953633130848
  H           1.48544175234705      1.15364512295618      0.15294474650374
*
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca etanol_corrigido.inp > etanol_corrigido.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca etanol_corrigido.inp > etanol_corrigido.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

Na correção, o ORCA termina normalmente e a amplitude máximo–mínimo de E é cerca de **0,30 kJ/mol**, em vez do crescimento da execução instável. Desmarque a falha para enxergar essa escala pequena. Verifique também a duração e as distâncias; término normal sozinho não basta.

**Não use um termostato para esconder o erro de integração.** Reduzir o timestep e repetir de um estado íntegro é a correção demonstrada. Aumentar somente o limite de ciclos SCF não resolve a causa deste caso.

<details markdown="1"><summary>Controles adicionais: precisão e falha abrupta</summary>

[Comparar 0,25 / 0,5 / 2 fs](../../visualizador/index.html?exemplo=timestep_accuracy). Todos completaram 500 fs, mas o passo de 2 fs tem amplitude de energia de aproximadamente 6,63 kJ/mol. Há erro relevante mesmo sem abortar.

O [exemplo anterior de 5 fs](../../visualizador/index.html?exemplo=timestep_abrupt) fica como apoio: ele falha em apenas 15 fs. A nova atividade usa 2,5 fs para permitir observar a degradação durante mais tempo.

</details>

## Resultados e manual

- **etanol_instavel:** [saída](resultados/etanol_instavel/etanol_instavel.out) · [input usado](resultados/etanol_instavel/etanol_instavel.inp) · [energias](resultados/etanol_instavel/etanol_instavel-md-ener.csv) · [trajetória](resultados/etanol_instavel/etanol_instavel-traj.xyz) · [tempo de execução](resultados/etanol_instavel/execucao.json).
- **etanol_corrigido:** [saída](resultados/etanol_corrigido/etanol_corrigido.out) · [input usado](resultados/etanol_corrigido/etanol_corrigido.inp) · [energias](resultados/etanol_corrigido/etanol_corrigido-md-ener.csv) · [trajetória](resultados/etanol_corrigido/etanol_corrigido-traj.xyz) · [tempo de execução](resultados/etanol_corrigido/execucao.json).

[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

[Registro eletrônico da falha](resultados/etanol_instavel/etanol_instavel.scf.log).

## Inputs das variantes e preparações

- **etanol_dt025:** [Baixar input ORCA](inputs/etanol_dt025.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input).
- **etanol_dt200:** [Baixar input ORCA](inputs/etanol_dt200.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input).
- **etanol_dt500:** [Baixar input ORCA](inputs/etanol_dt500.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input).
