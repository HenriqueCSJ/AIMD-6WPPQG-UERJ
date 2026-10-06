# 02a · Etanol: o controle antes da correção

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**Parte do bloco 02 (35 min com timestep e correção) · etanol · XTB2 · controle da aula: 0,5 ps · referência ampliada: 5 ps**

> **Pergunta:** Uma trajetória sem troca de conformação ensina alguma coisa?

## 1. Escolha a medida certa

Na água, comprimentos e ângulos descrevem os movimentos internos. O etanol acrescenta uma rotação em torno de C–O; para distingui-la do movimento da molécula inteira, precisamos de um diedro. Uma animação pode esconder a diferença entre a molécula inteira girar e uma rotação **interna**. Para o H da hidroxila, acompanhe o diedro **C 0–C 1–O 2–H 8**, em graus. Ele não muda se girarmos apenas a câmera ou a molécula como um corpo rígido.

Vamos começar com uma trajetória curta, sem termostato: ela será o controle para o timestep e para as etapas de temperatura. `Initvel 300_K` inicializa velocidades; não mantém o sistema a 300 K.

O input produz **0,5 ps** para as comparações de timestep e termostato. Abra depois os **5 ps** para investigar como a janela de observação muda o que conseguimos encontrar, mantendo a condição NVE.

## 2. Execute

[Baixar pacote](aula-etanol_nve.zip) · [Baixar input ORCA](inputs/etanol_nve.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/etanol_nve.inp -->
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
  Dump Position Stride 1 Filename "etanol_nve-traj.xyz"
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
orca etanol_nve.inp > etanol_nve.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca etanol_nve.inp > etanol_nve.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

## 3. Distinga os dois movimentos

[Abrir NVE ampliado de 5 ps](../../visualizador/index.html?exemplo=ethanol&aba=geometria) · [Abrir o controle original de 0,5 ps](../../visualizador/index.html?exemplo=ethanol_short&aba=geometria) · [Comparar com o etanol em etapas](../../visualizador/index.html?exemplo=thermostat&aba=geometria)

As faixas numéricas abaixo descrevem o **controle original de 0,5 ps**. Examine depois os 5 ps para investigar o efeito da janela de observação, sem atribuí-lo a mudança de temperatura. O restart em 500 fs fica identificado no gráfico e não reinicializa velocidades.

1. Em **Geometria**, use o atalho para a torsão do etanol ou selecione **Diedro**, com índices **0, 1, 2, 8**.
2. No controle NVE, o diedro vai de **−73,9° a −33,7°** em 0,5 ps: oscila em torno de uma orientação gauche. Isso é **libração**, sem troca de região conformacional observada.
3. Selecione **Distância**, O 2–H 8. A ligação vibra entre **0,939 e 0,992 Å**. Esse movimento não é rotação da hidroxila nem transferência de próton.
4. Abra a referência **em etapas**: a 1,5 ps o diedro é **+52,3°**, enquanto no início era **−55,7°**. Há acesso a outra orientação; o O–H continua ligado. No bloco 03 vamos executar e explicar o programa que produziu isso.

**Interpretação:** uma molécula pode vibrar e permanecer na mesma região conformacional durante toda uma trajetória curta. Ausência de troca em 0,5 ps não mede a barreira nem prova que outra conformação seja inacessível. A faixa angular, o tempo passado em cada região e a integridade das ligações respondem a perguntas diferentes.

O protocolo usa GFN2-xTB, um modelo semiempírico de estrutura eletrônica. Com esse controle em mãos, vamos alterar somente o timestep para investigar a qualidade da integração; depois, mudaremos o programa de temperatura para acompanhar outras orientações.

<details markdown="1"><summary>Observar por mais tempo: continuação de 0,5 até 5 ps</summary>

O laboratório também oferece **5 ps de NVE**, por continuação dos 0,5 ps originais a partir do checkpoint, com as mesmas posições, velocidades, timestep de 0,5 fs e ausência de termostato. A referência ampliada contém **10001 quadros**. O input da atividade produz os 0,5 ps do controle; as comparações de timestep e termostato conservam essa série curta para manter os dados pareados.

A continuação levou **136,1 s nesta máquina**, além dos 15,8 s originais. Nos 5 ps completos, o diedro C 0–C 1–O 2–H 8 varia de **−79,5° a −28,0°**, sem troca de região conformacional observada. A amplitude de Etotal é **0,549 kJ/mol**.

</details>

## Resultados e manual

- **NVE ampliado, 5 ps:** [trajetória completa](resultados/etanol_nve_5ps/etanol_nve_5ps-traj.xyz) · [energias](resultados/etanol_nve_5ps/etanol_nve_5ps-md-ener.csv) · [etapas e limites](resultados/etanol_nve_5ps/curso.json) · [verificação](resultados/etanol_nve_5ps/verificacao.json) · [pacote completo de resultados](resultado-etanol_nve_5ps.zip) · [input e checkpoint para continuar de 0,5 até 5 ps](aula-etanol_restart_5ps.zip). As saídas das duas execuções estão separadas por etapa no pacote.
- **etanol_nve:** [saída](resultados/etanol_nve/etanol_nve.out) · [input usado](resultados/etanol_nve/etanol_nve.inp) · [energias](resultados/etanol_nve/etanol_nve-md-ener.csv) · [trajetória](resultados/etanol_nve/etanol_nve-traj.xyz) · [tempo de execução](resultados/etanol_nve/execucao.json).

**Input completo · `etanol_nve.inp` — copie e salve com esse nome.**

<!-- input-source: resultados/etanol_nve/etanol_nve.inp -->
```text
# Minicurso AIMD / ORCA 6.1.1 - etanol_nve
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Integra o movimento dos nucleos. PAL8 solicita oito recursos. XTB2 chama
# GFN2-xTB externo; PAL8 tambem define suas threads.
! MD XTB2 PAL8

# Memoria em MB por processo. 256 x 8 = 2048 MB de orcamento, alem de memoria
# adicional.
%maxcore 256

# Parametros da dinamica: as unidades sao explicitas em cada linha.
%md
  # Passo de integracao em femtossegundos. 1 fs = 1e-15 s.
  Timestep 0.5_fs
  # Semente fixa para repetir a preparacao aleatoria no mesmo ambiente.
  Randomize 42
  # Inicializa velocidades na temperatura indicada; nao substitui um
  # termostato.
  Initvel 300_K
  # Sem troca de energia com banho: controle NVE para examinar a integracao.
  Thermostat None
  # Grava um quadro XYZ por passo. O nome identifica esta trajetoria.
  Dump Position Stride 1 Filename "etanol_nve-traj.xyz"
  # Numero de passos desta etapa. Duracao fisica = numero de passos x
  # timestep.
  Run 1000
end

# Le o XYZ: carga total 0, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 0 1 etanol.xyz
```


[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

## Inputs das variantes e preparações

- **preparar_etanol:** [Baixar input ORCA](inputs/preparar_etanol.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol_inicial.xyz) (opcional para executar; as coordenadas já estão no input).

**Input completo · `preparar_etanol.inp` — copie e salve com esse nome.**

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


**Continuação de 0,5 até 5 ps:** [Baixar input ORCA](resultados/etanol_nve_5ps/etapas/ethanol_00500_05000fs.inp) · [Baixar geometria inicial (.xyz)](resultados/etanol_nve_5ps/etapas/ethanol_restart.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](resultados/etanol_nve_5ps/etapas/etanol_nve.mdrestart) (fornece o estado de continuação; manter junto do input). O XYZ isolado não substitui o checkpoint.

**Input completo · `ethanol_00500_05000fs.inp` — copie e salve com esse nome.**

<!-- input-source: resultados/etanol_nve_5ps/etapas/ethanol_00500_05000fs.inp -->
```text
# Finite NVE continuation; positions and velocities retained from checkpoint.
! MD XTB2 PAL8
%maxcore 256
%md
  Timestep 0.5_fs
  Thermostat None
  Randomize 42
  Dump Position Stride 1 Filename "ethanol_00500_05000fs-traj.xyz"
  Restart "etanol_nve.mdrestart"
  Run 9000
end
* xyzfile 0 1 ethanol_restart.xyz
```
