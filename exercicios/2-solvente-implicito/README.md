# Opcional · O papel do solvente contínuo

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**10 min · análise de resultados fornecidos · DFT / CPCM(water)**

> **Pergunta:** Ativar água como solvente acrescenta novas ligações H?

## 1. Mude apenas o ambiente

No dímero, a ligação H depende da posição das duas moléculas. Agora vamos perguntar como um ambiente polar modifica esse movimento sem acrescentar moléculas. Compare as duas referências DFT fornecidas: elas usam as mesmas seis coordenadas, semente, método e duração de 60 fs. A diferença no input é `CPCM(water)` na primeira linha. O campo de reação do meio contínuo modifica energia e forças; **as duas águas explícitas continuam sendo as únicas moléculas presentes**.

## 2. Abra as referências prontas

Na aula, **não execute este cálculo DFT**. Compare os resultados de vácuo e CPCM fornecidos abaixo, ambos de 60 fs. A referência CPCM levou cerca de 5 min 24 s nesta máquina. O input fica disponível para leitura e reprodução depois da aula.

Não compare diretamente a trajetória XTB2 de 2 ps da atividade 01b com a DFT/CPCM para atribuir diferenças só ao solvente: nessa comparação também mudariam o método e a duração.

[Baixar pacote](aula-dimero_b97_cpcm.zip) · [Baixar input ORCA](inputs/dimero_b97_cpcm.inp) · [Baixar geometria inicial (.xyz)](estruturas/dimero_b97.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/dimero_b97_cpcm.inp -->
```text
# Exemplo didatico; oito processos solicitados.
! MD B97-3c TightSCF CPCM(water) PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "dimero_b97_cpcm-traj.xyz"
  Timestep 0.5_fs
  Thermostat None
  # 60 fs: observar vibracao e geometria da ligacao H.
  Run 120
end
* xyz 0 1
  O          -0.07963526387957     -0.01964165075209     -0.00000000264085
  H           0.88823357664041      0.04103734930643      0.00000002901791
  H          -0.37106168405382      0.89703962065287     -0.00000002440793
  O           2.88291572564215      0.11999069039073     -0.00000000005029
  H           3.28977384105638      0.54578697932583      0.76197145433409
  H           3.28977380459444      0.54578701107623     -0.76197145625293
*
```

<details markdown="1"><summary>Reprodução após a aula: Ubuntu / WSL2</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca dimero_b97_cpcm.inp > dimero_b97_cpcm.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Reprodução após a aula: Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca dimero_b97_cpcm.inp > dimero_b97_cpcm.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

## 3. Compare a geometria, não apenas o filme

[Abrir vácuo e CPCM](../../visualizador/index.html?exemplo=solvent&aba=trajetoria)

1. Conte os átomos: continuam sendo seis. Ative os contatos H; o programa não desenha moléculas do contínuo.
2. Em **Geometria**, meça O 0···O 3 e o ângulo 0–1–3 em cada caso. Compare as mesmas marcas de tempo.
3. Observe as curvas de energia separadamente. O zero de cada curva ΔE é seu próprio primeiro ponto.

**Dado da referência:** no fim dos 60 fs, O 0···O 3 é **2.949 Å no vácuo** e **2.946 Å com CPCM**. A diferença em O···O é pequena: olhar só essa distância esconderia parte da resposta. O ângulo 0–1–3 chega a **97,1° no vácuo**, mas a **130,0° com CPCM**, partindo dos mesmos 178,7°. Essas são amplitudes observadas nesta trajetória curta, não preferências de equilíbrio. Isso mostra uma resposta transitória a duas superfícies de energia diferentes. Não é a distância média de equilíbrio em solução. Tempo de execução desta referência: **324.5 s**.

**Para levar:** o contínuo pode alterar as forças, mas não fornece a rede molecular de ligações H. Na atividade [04a · SOLVATOR](../6-complexo-solvator/README.md), acrescentamos águas explícitas; na [04b · efeito da parede](../7-dinamica-complexo/README.md), examinamos o afastamento dessas águas sob confinamento. São três papéis distintos.

**Não concluir:** a diferença entre duas energias instantâneas não é ΔG de solvatação. Começamos da geometria relaxada no vácuo, e a trajetória CPCM curta inclui a resposta inicial à troca de ambiente.

## Resultados e manual

- **dimero_b97_cpcm:** [saída](resultados/dimero_b97_cpcm/dimero_b97_cpcm.out) · [input usado](resultados/dimero_b97_cpcm/dimero_b97_cpcm.inp) · [energias](resultados/dimero_b97_cpcm/dimero_b97_cpcm-md-ener.csv) · [trajetória](resultados/dimero_b97_cpcm/dimero_b97_cpcm-traj.xyz) · [tempo de execução](resultados/dimero_b97_cpcm/execucao.json).

**Input completo · `dimero_b97_cpcm.inp` — copie e salve com esse nome.**

<!-- input-source: resultados/dimero_b97_cpcm/dimero_b97_cpcm.inp -->
```text
# Exemplo didatico; oito processos solicitados.
! MD B97-3c TightSCF CPCM(water) PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "dimero_b97_cpcm-traj.xyz"
  Timestep 0.5_fs
  Thermostat None
  # 60 fs: observar vibracao e geometria da ligacao H.
  Run 120
end
* xyzfile 0 1 dimero_b97.xyz
```


[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

[Compare também a água isolada no vácuo e com CPCM](apoio.md).

## Inputs das variantes e preparações

- **agua_cpcm:** [Baixar input ORCA](inputs/agua_cpcm.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua.xyz) (opcional para executar; as coordenadas já estão no input).

**Input completo · `agua_cpcm.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/agua_cpcm.inp -->
```text
# Mesmo teste de agua; CPCM acrescenta o solvente continuo.
! MD BLYP def2-SVP TightSCF CPCM(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "agua_cpcm-traj.xyz"
  # 40 x 0.5 fs = 20 fs (2e-14 s).
  Run 40
end

# Carga 0, multiplicidade 1; coordenadas abaixo; XYZ separado opcional.
* xyz 0 1
  O          -0.00000000000561      0.00000000000000     -0.07350969363937
  H           0.76032823354949      0.00000000000000      0.54103884681985
  H          -0.76032823354388      0.00000000000000      0.54103884681952
*
```
