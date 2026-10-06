# 03 · Aquecer, explorar, resfriar — no mesmo input

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**25 min · etanol · XTB2 · 5 ps = 5 × 10⁻¹² s**

> **Pergunta:** Como mudar as condições e acompanhar a resposta conformacional?

## 1. Programe uma história contínua

Na água, distinguimos velocidades iniciais e troca de energia com o banho. No etanol, vamos usar essa troca para explorar uma rotação interna: acompanharemos o diedro C–C–O–H ao aquecer e resfriar. O timestep permanece em 0,5 fs, como na correção do bloco anterior.

O ORCA executa o `%md` **linha por linha**. Um `Run` avança a trajetória com as condições correntes; o próximo continua das posições e velocidades deixadas pelo anterior. Aqui **não repetimos `Initvel`**: não sorteamos uma nova trajetória a cada etapa.

- **0–0,5 ps:** alvo de 300 K, início da termalização.
- **0,5–1,5 ps:** rampa do alvo de 300 para 600 K.
- **1,5–3,5 ps:** manutenção do alvo final, 600 K.
- **3,5–4,5 ps:** rampa de 600 para 300 K.
- **4,5–5 ps:** continuação a 300 K.

**São alvos do termostato.** A temperatura instantânea flutua e não acompanha uma linha perfeita, sobretudo em nove átomos. Durante as rampas, não há um único estado NVT estacionário.

## 2. Execute e acompanhe as etapas

[Baixar pacote](aula-etanol_etapas.zip) · [Baixar input ORCA](inputs/etanol_etapas.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/etanol_etapas.inp -->
```text
# Exemplo didatico; oito processos solicitados.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "etanol_etapas-traj.xyz"
  Timestep 0.5_fs
  # 0-0.5 ps: inicio a 300 K.
  Thermostat CSVR 300_K Timecon 100_fs
  Run 1000
  # 0.5-1.5 ps: aquecer gradualmente ate 600 K.
  Thermostat CSVR 300_K Timecon 100_fs Ramp 600_K
  Run 2000
  # 1.5-3.5 ps: manter o alvo final da rampa.
  Run 4000
  # 3.5-4.5 ps: resfriar gradualmente.
  Thermostat CSVR 600_K Timecon 100_fs Ramp 300_K
  Run 2000
  # 4.5-5 ps: continuar a 300 K, sem reiniciar velocidades.
  Run 1000
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
orca etanol_etapas.inp > etanol_etapas.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca etanol_etapas.inp > etanol_etapas.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

## 3. Relacione temperatura e orientação

[Abrir a trajetória em etapas](../../visualizador/index.html?exemplo=thermostat&aba=trajetoria)

1. Veja a faixa de etapas no laboratório e acompanhe a marca ativa durante a animação. A programação vem do input; o tempo efetivamente simulado vem dos dados.
2. Em **Geometria → Diedro**, meça **0–1–2–8**. Compare o controle 02a, que só librava, com esta trajetória: **−55,7° em 0 ps, +52,3° em 1,5 ps e +62,6° em 5 ps**.
3. Confirme que O 2–H 8 permanece entre **0,917 e 1,022 Å**. O H muda de orientação em torno de C–O; ele não foi transferido para outro átomo.
4. Na energia, o banho pode fornecer e retirar energia. Agora uma mudança de E não tem o mesmo significado que no teste NVE do timestep.

**O que vimos:** acesso a orientações gauche de sinais opostos e excursões por outras regiões durante um protocolo de aquecimento/resfriamento. Uma passagem de +180° para −180° é a convenção periódica do diedro, não um salto físico de 360°.

**O que não medimos:** barreira de rotação, populações de equilíbrio ou cinética a 300 K. O aquecimento é uma intervenção deliberada para ampliar o movimento na aula; esta única trajetória não demonstra que ele foi necessário ou suficiente para cada transição.

O cálculo levou **150,1 s** com PAL8 nesta máquina. Se atrasar, use a referência e mantenha a discussão. Para isolar a presença do banho, retome a [comparação pareada NVE × CSVR a 300 K](../../visualizador/index.html?exemplo=thermostat_compare). Aqui a pergunta é outra: como a orientação interna responde a um programa de temperatura ao longo do tempo?

## Resultados e manual

- **etanol_etapas:** [saída](resultados/etanol_etapas/etanol_etapas.out) · [input usado](resultados/etanol_etapas/etanol_etapas.inp) · [energias](resultados/etanol_etapas/etanol_etapas-md-ener.csv) · [trajetória](resultados/etanol_etapas/etanol_etapas-traj.xyz) · [tempo de execução](resultados/etanol_etapas/execucao.json).

**Input completo · `etanol_etapas.inp` — copie e salve com esse nome.**

<!-- input-source: resultados/etanol_etapas/etanol_etapas.inp -->
```text
# Exemplo didatico; oito processos solicitados.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "etanol_etapas-traj.xyz"
  Timestep 0.5_fs
  # 0-0.5 ps: inicio a 300 K.
  Thermostat CSVR 300_K Timecon 100_fs
  Run 1000
  # 0.5-1.5 ps: aquecer gradualmente ate 600 K.
  Thermostat CSVR 300_K Timecon 100_fs Ramp 600_K
  Run 2000
  # 1.5-3.5 ps: manter o alvo final da rampa.
  Run 4000
  # 3.5-4.5 ps: resfriar gradualmente.
  Thermostat CSVR 600_K Timecon 100_fs Ramp 300_K
  Run 2000
  # 4.5-5 ps: continuar a 300 K, sem reiniciar velocidades.
  Run 1000
end
* xyzfile 0 1 etanol.xyz
```


[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

[Execução sequencial dos comandos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#input-format) · [Thermostat e Ramp](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat).

## Inputs das variantes e preparações

- **etanol_csvr:** [Baixar input ORCA](inputs/etanol_csvr.inp) · [Baixar geometria inicial (.xyz)](estruturas/etanol.xyz) (opcional para executar; as coordenadas já estão no input).

**Input completo · `etanol_csvr.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/etanol_csvr.inp -->
```text
# Mesmo etanol; agora pode trocar energia com um banho.
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "etanol_csvr-traj.xyz"
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
