# 01 · Água: da molécula à ligação H

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**25 min · 01a: água isolada → 01b: dímero · observe a referência DFT e execute com XTB2**

Começamos por uma molécula de água. Com três átomos, podemos acompanhar cada ligação O–H e o ângulo H–O–H e relacionar essas medidas à troca entre energia cinética e potencial. Depois, comparamos duas dinâmicas para entender o controle da temperatura. Ao passar ao dímero, essas mesmas ferramentas ajudam a investigar uma ligação H entre moléculas.

[01a · Água isolada](#agua-isolada) → [01b · Duas águas](#dimero)

<a id="agua-isolada"></a>

## 01a · Água: movimento, energia e temperatura

> **Pergunta:** O que muda quando a molécula pode trocar energia com um banho térmico?

### Comece pelo movimento de três átomos

[Abrir água isolada em 3D](../../visualizador/index.html?exemplo=water_single&aba=trajetoria) · [Pacote da referência DFT](aula-agua_dft.zip) · [Input DFT](inputs/agua_dft.inp) · [Geometria inicial (.xyz)](estruturas/agua.xyz) (opcional para executar; as coordenadas já estão no input)

A referência BLYP/def2-SVP mostra **20 fs em 41 quadros**, com timestep de 0,5 fs e sem termostato. Abra os resultados fornecidos; não é preciso repetir DFT durante a aula. A geometria inicial foi otimizada nesse mesmo nível. Em dinâmica, cada passo responde às forças: ele não é uma nova otimização da molécula.

1. Em **Geometria**, meça **O 0–H 1**, **O 0–H 2** e o ângulo **1–0–2**. Avance os quadros e identifique uma mudança de comprimento ou ângulo; girar a câmera não altera essas medidas.
2. Mostre **K, U e E** e procure um trecho em que K diminui. O que acontece com U? Em NVE, avalie a variação de E enquanto K e U trocam energia.
3. Acompanhe a temperatura. Ela é estimada a partir da energia cinética, segundo a convenção do programa. Em três átomos, grandes flutuações são esperadas: `Initvel 300_K` prepara velocidades, mas não mantém T em 300 K.

**Registre:** uma medida geométrica, uma observação de K/U e a duração física de 20 fs. A reprodução em 60 segundos apenas torna o movimento visível; não aumenta o tempo simulado. Você pode conferir os valores e a preparação no [apoio da água](apoio.md).

### Compare velocidades iniciais e controle térmico

Vamos iniciar **duas dinâmicas XTB2 da mesma geometria e com a mesma semente**, ambas com velocidades preparadas a 100 K. O primeiro caso evolui sem banho; no segundo, CSVR troca energia com um banho cujo alvo é 300 K. Assim, a comparação isola a presença do termostato. Não compare DFT/NVE com XTB2/CSVR para atribuir uma diferença apenas ao banho.

Os **dois resultados de 500 fs = 0,5 ps já estão prontos**, calculados com os inputs abaixo. Cada caso contém 1001 quadros e 1001 registros de energia, incluindo o instante inicial. Na máquina de referência, as execuções levaram aproximadamente **18 s sem termostato e 15 s com CSVR**; o tempo varia entre computadores. Para reproduzir, execute um cálculo por vez, em pastas separadas.

[Abrir comparação pronta da água: NVE × CSVR](../../visualizador/index.html?exemplo=water_thermostat&aba=trajetoria) · [Comparar energias e temperatura](../../visualizador/index.html?exemplo=water_thermostat&aba=energias)

Os dois cálculos ficam selecionados para comparar as curvas. No campo **Simulação**, alterne a trajetória entre **sem termostato (NVE)** e **CSVR a 300 K**. Você também pode abrir [apenas NVE](../../visualizador/index.html?exemplo=water_nve&aba=trajetoria) ou [apenas CSVR](../../visualizador/index.html?exemplo=water_csvr&aba=trajetoria). Os arquivos completos estão no [apoio da água](apoio.md#resultados-xtb2).

**Sem banho — NVE:** [Baixar pacote](aula-agua_xtb2_nve.zip) · [Baixar input ORCA](inputs/agua_xtb2_nve.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/agua_xtb2_nve.inp -->
```text
# Agua isolada: comparar ausencia e presenca de banho termico.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 100_K
  Timestep 0.5_fs
  Thermostat None
  Dump Position Stride 1 Filename "agua_xtb2_nve-traj.xyz"
  Run 1000
end
* xyz 0 1
  O          -0.00000000000561      0.00000000000000     -0.07350969363937
  H           0.76032823354949      0.00000000000000      0.54103884681985
  H          -0.76032823354388      0.00000000000000      0.54103884681952
*
```

**Com banho — CSVR:** [Baixar pacote](aula-agua_xtb2_csvr.zip) · [Baixar input ORCA](inputs/agua_xtb2_csvr.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/agua_xtb2_csvr.inp -->
```text
# Agua isolada: comparar ausencia e presenca de banho termico.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 100_K
  Timestep 0.5_fs
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "agua_xtb2_csvr-traj.xyz"
  Run 1000
end
* xyz 0 1
  O          -0.00000000000561      0.00000000000000     -0.07350969363937
  H           0.76032823354949      0.00000000000000      0.54103884681985
  H          -0.76032823354388      0.00000000000000      0.54103884681952
*
```

<details markdown="1"><summary>Execute o par no Ubuntu / WSL2 ou Windows nativo</summary>

No Ubuntu / WSL2, entre na pasta do primeiro pacote e execute:

```bash
orca agua_xtb2_nve.inp > agua_xtb2_nve.out &
```

Espere encerrar; depois entre na pasta do segundo pacote:

```bash
orca agua_xtb2_csvr.inp > agua_xtb2_csvr.out &
```

No Windows nativo, abra o **Prompt de Comando (`cmd`)** na pasta correspondente e execute, um de cada vez:

```bat
orca agua_xtb2_nve.inp > agua_xtb2_nve.out
```

```bat
orca agua_xtb2_csvr.inp > agua_xtb2_csvr.out
```

Veja a [preparação do ambiente](../../tutoriais/README.md) e [como acompanhar cada execução](../README.md#como-executar). Os nomes distintos evitam misturar saídas dos dois protocolos.

</details>

Carregue juntos os `.out`, `-md-ener.csv` e `-traj.xyz` que produzir e marque os dois casos no laboratório. Compare **E**, **K** e **T** nas mesmas marcas de tempo. Em NVE, procure conservação aproximada de E; com CSVR, examine a troca de energia com o banho. O alvo de 300 K não fixa a temperatura de cada passo nem exige aquecimento monotônico. NVE também não mantém a temperatura inicial de 100 K. A janela de 500 fs corresponde a cinco constantes de acoplamento de 100 fs; isso, sozinho, não demonstra equilíbrio. [Manual ORCA: termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat).

### Do movimento molecular ao IV e Raman

A água, uma molécula não linear, tem **três modos vibracionais**: deformação angular, estiramento simétrico e estiramento antissimétrico. Eles descrevem movimentos coletivos na aproximação harmônica; a trajetória térmica combina movimentos e não separa necessariamente cada modo.

Para a **água gasosa**, os fundamentais experimentais são aproximadamente **1595, 3657 e 3756 cm⁻¹**, nessa ordem. São referências experimentais, diferentes de frequências harmônicas calculadas e das bandas da água líquida. [NIST: vibrações da água](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Mask=880&Units=SI).

No **IV**, a atividade depende da variação do momento de dipolo durante a vibração; no **Raman**, da variação da polarizabilidade. A frequência indica onde aparece a banda, enquanto a intensidade depende dessas propriedades. Uma ligação que parece oscilar mais no filme não tem, por isso, uma banda mais intensa. [ORCA: frequências e propriedades vibracionais](https://www.faccts.de/docs/orca/6.1/manual/contents/spectroscopyproperties/vibrations.html).

**Para discutir:** que informação ainda precisaríamos calcular para passar deste movimento a um espectro IV ou Raman? Na rota harmônica, precisamos da Hessiana, dos modos e das derivadas das propriedades; na rota dinâmica, de séries de dipolo/polarizabilidade e suas correlações, com amostragem suficiente. O XYZ contém posições, e 20 fs não fornecem um espectro vibracional confiável. Uma FFT de O–H, sozinha, não fornece intensidades IV ou Raman. [TRAVIS: espectros a partir de dinâmica](https://www.travis-analyzer.de/files/travis_ir_raman.pdf).

Com as medidas internas da água em mãos, acrescente a segunda molécula e procure o que muda entre elas.

<a id="alem-das-posicoes"></a>

## Complemento opcional · Além das posições com Dump

**Um único exemplo extra, usando a água isolada.** Salve posições, velocidades e forças nos mesmos instantes e veja que um filme de coordenadas não contém toda a informação da dinâmica. Esta variante NVE usa 100 fs, sem parede, com o mesmo estado inicial da água XTB2 acima; a execução de referência levou 4,1 s.

[Pacote para executar](aula-agua_dump.zip) · [Input](inputs/agua_dump.inp) · [Resultados completos](resultado-agua_dump.zip)

<details markdown="1"><summary>Abrir o input completo e as perguntas</summary>

<!-- input-source: inputs/agua_dump.inp -->
```text
# Agua isolada: comparar ausencia e presenca de banho termico.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 100_K
  Timestep 0.5_fs
  Thermostat None
  Dump Position Stride 1 Filename "agua_dump-traj.xyz"
  Dump Velocity Stride 1 Filename "agua_dump-vel.xyz"
  Dump Force Stride 1 Filename "agua_dump-force.xyz"
  Run 200
end
* xyz 0 1
  O          -0.00000000000561      0.00000000000000     -0.07350969363937
  H           0.76032823354949      0.00000000000000      0.54103884681985
  H          -0.76032823354388      0.00000000000000      0.54103884681952
*
```

Execute `orca agua_dump.inp > agua_dump.out` em uma pasta nova, no cmd do Windows ou no terminal Ubuntu/WSL. Espere terminar.

- **Position:** coordenadas em Å; carregue o XYZ de posições, o `.out` e o CSV de energia no laboratório.
- **Velocity:** componentes da velocidade em Å/fs. Compare K = ½ Σ mᵢ|vᵢ|² com a energia cinética do CSV, após converter as unidades. Com m em u e v em Å/fs, multiplique essa soma por 10⁴ para obter kJ/mol.
- **Force:** leia a unidade no comentário de cada quadro. **Nos arquivos ORCA 6.1.1 fornecidos, ela é kJ mol⁻¹ Å⁻¹**. O manual consultado diz Hartree/Å; não aplique essa unidade aos arquivos fornecidos. O quadro inicial de forças deste exemplo contém zeros de inicialização; examine a partir do passo 1.

[Velocidades reais](resultados/agua_dump/agua_dump-vel.xyz) · [Forças reais](resultados/agua_dump/agua_dump-force.xyz) · [Posições](resultados/agua_dump/agua_dump-traj.xyz) · [Energia](resultados/agua_dump/agua_dump-md-ener.csv) · [Saída](resultados/agua_dump/agua_dump.out)

O laboratório não interpreta XYZ de velocidades/forças como geometria. Abra esses arquivos como texto para esta atividade. A verificação com as 201 amostras reproduziu K com diferença máxima de 0,0014 kJ/mol, compatível com o arredondamento do CSV.

**Outras saídas:** `Dump EnGrad` salva energia e gradiente; `Dump GBW` guarda estados eletrônicos individuais, cuja utilidade depende do método. A versão instalada também aceita **`Dump Properties`**: um teste BLYP-D3BJ/def2-SVP gerou dipolos em `.prop.log` a cada passo. Essa opção não produziu o log no teste XTB2 e não deve ser prometida para qualquer método. [Teste DFT e log de propriedades](verificacao-dump/README.md).

Dipolo, cargas e polarizabilidade não são nomes intercambiáveis com `Position` no comando. Para propriedades eletrônicas, é necessário configurar uma rota compatível; um arquivo de velocidades sozinho não fornece intensidades IV/Raman. [Manual ORCA, Dump](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#dump).

**Para responder:** em um instante escolhido, a água tem maior velocidade quando está mais afastada ou mais próxima da geometria de equilíbrio? Compare posição e velocidade; uma observação isolada não separa todos os modos normais.

</details>

**Continuar o percurso:** [01b · dímero de água](#dimero).

<a id="dimero"></a>

## 01b · Duas águas: uma ligação H em movimento

### Prepare o par de moléculas

Na água isolada, medimos os movimentos internos. Ao acrescentar uma segunda molécula, também precisamos medir a distância e a orientação entre elas. Uma água começa como doadora da ligação H. Vamos observar a reorientação: **uma água pode passar de doadora a aceptora da ligação H?** A estrutura já foi relaxada com B97-3c; a otimização é fornecida, não precisa ser repetida na aula.

Vamos executar **2 ps = 2 × 10⁻¹² s** com XTB2, sem termostato. Essa execução original levou **56,5 s nesta máquina**. A geometria inicial é a mesma da comparação DFT fornecida; não é apresentada como um mínimo de XTB2. Este dímero isolado não representa água líquida.

Abra primeiro os 2 ps para acompanhar a troca de doador e aceptor. Depois, use a referência de 5 ps para perguntar se uma janela maior revela contatos ou orientações que o trecho curto não mostra.

### Execute o dímero

[Baixar pacote](aula-dimero_xtb2_2ps.zip) · [Baixar input ORCA](inputs/dimero_xtb2_2ps.inp) · [Baixar geometria inicial (.xyz)](estruturas/dimero_b97.xyz) (opcional para executar; as coordenadas já estão no input)

<!-- input-source: inputs/dimero_xtb2_2ps.inp -->
```text
# Duas aguas: 2 ps = 2e-12 s, sem banho termico nem parede.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Timestep 0.5_fs
  Thermostat None
  Dump Position Stride 1 Filename "dimero_xtb2_2ps-traj.xyz"
  # Geometria inicial compartilhada com a demonstracao DFT.
  Run 4000
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

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca dimero_xtb2_2ps.inp > dimero_xtb2_2ps.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca dimero_xtb2_2ps.inp > dimero_xtb2_2ps.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

### Observe, meça, explique

[Abrir referência de 5 ps em 3D](../../visualizador/index.html?exemplo=water&aba=trajetoria) · [Abrir os 2 ps originais](../../visualizador/index.html?exemplo=water_short&aba=trajetoria)

1. Ative **Ligações H**. O traço descontínuo indica um contato que passa pelo critério geométrico do visualizador; não é uma ligação covalente adicional.
2. Em **Geometria**, compare **O 0–H 1**, **H 1···O 3** e **O 0···O 3**. Acrescente o ângulo **0–1–3** (D–H···A).
3. Em **Energia**, mostre K, U e E. Alongar/comprimir as ligações modifica U; o movimento altera K. A energia total deve variar pouco neste caso sem banho.
4. Avance pelos primeiros 50 fs e depois por toda a trajetória. Identifique qual O doa H e qual aceita. Meça também os contatos partindo dos H 4 e 5 da segunda água.

**Interpretação:** as moléculas giram e reorganizam o contato intermolecular. A troca de doador/aceptor **não é transferência de próton**: cada H continua ligado à sua água. O desaparecimento do traço H ao cruzar um corte geométrico não prova dissociação irreversível.

Uma única trajetória permite acompanhar reorientações, mas não medir populações de equilíbrio ou taxas de troca. Para discutir o termostato, lembre-se da água isolada: em NVE, a temperatura instantânea também pode flutuar enquanto a energia total varia pouco.

<details markdown="1"><summary>Conferir medidas e energia depois da observação</summary>

**Nos 2 ps originais XTB2:** O···O varia de **2,633 a 3,511 Å**; as quatro ligações covalentes O–H permanecem entre **0,914 e 1,020 Å**. O 0 começa como doador; perto de 50 fs, o O 3 aparece como doador. Há outras alternâncias ao longo dos 2 ps. Essas faixas descrevem o trecho original; use a extensão para investigar se a faixa observada aumenta quando a janela chega a 5 ps.

Na análise dos 2 ps originais, o critério operacional foi H···O < 2,4 Å e O–H···O > 130°. O visualizador usa critérios fixos diferentes: H···O ≤ 2,5 Å, O···O ≤ 3,5 Å e O–H···O ≥ 150°. Por isso, o instante em que o traço aparece pode diferir desta análise. A amplitude de Etotal nesse trecho foi **0,194 kJ/mol**; examine a curva inteira, não apenas a diferença entre início e fim. Em NVE, a temperatura instantânea deste sistema de seis átomos pode variar bastante. A referência ampliada identifica o restart em 2000 fs e mantém os valores físicos originais de energia e temperatura.

O tempo medido de **56,5 s** não é garantia para outros computadores. Se ultrapassar **2 min durante a aula**, abra a referência e continue a análise.

</details>

<details markdown="1"><summary>Comparação DFT já calculada</summary>

Não execute DFT durante a aula. A referência curta B97-3c simulou **60 fs** em **275,5 s** nesta máquina; ela permite comparar a geometria e o custo com XTB2. Compare apenas a janela comum de 0–60 fs. XTB2 usa uma aproximação diferente para a energia eletrônica; trajetórias mais longas não demonstram maior precisão.

[Abrir DFT em 3D](../../visualizador/index.html?exemplo=water_dft&aba=trajetoria) · [Baixar input ORCA](inputs/dimero_b97.inp) · [Baixar geometria inicial (.xyz)](estruturas/dimero_b97.xyz) (opcional para executar; as coordenadas já estão no input) · [Pacote DFT, para estudo posterior](aula-dimero_b97.zip).

</details>



<details markdown="1"><summary>Como continuar o dímero de 2 até 5 ps</summary>

O laboratório abre a **referência ampliada de 5 ps**: os 2 ps originais seguidos por mais 3 ps a partir do checkpoint, preservando posições, velocidades, timestep de 0,5 fs e NVE. São **10001 quadros originais**, sem interpolação ou redução. O protocolo curto de 2 ps da atividade está disponível para a execução em aula; a referência de 2 ps permite comparar a mesma janela.

A continuação levou **91,1 s nesta máquina**, além dos 56,5 s originais. Nos 5 ps completos, O···O varia de **2,617 a 3,511 Å** e a amplitude de Etotal é **0,260 kJ/mol**. Cada H permanece associado à sua água no acompanhamento pelo O mais próximo.

</details>

## Resultados e manual

- **XTB2, referência ampliada de 5 ps:** [trajetória completa](resultados/dimero_xtb2_5ps/dimero_xtb2_5ps-traj.xyz) · [energias](resultados/dimero_xtb2_5ps/dimero_xtb2_5ps-md-ener.csv) · [etapas e limites](resultados/dimero_xtb2_5ps/curso.json) · [verificação](resultados/dimero_xtb2_5ps/verificacao.json) · [pacote completo de resultados](resultado-dimero_xtb2_5ps.zip) · [input e checkpoint para continuar de 2 até 5 ps](aula-dimero_restart_5ps.zip). As saídas das duas execuções estão separadas por etapa no pacote.
- **XTB2, 2 ps:** [saída](resultados/dimero_xtb2_2ps/dimero_xtb2_2ps.out) · [input usado](resultados/dimero_xtb2_2ps/dimero_xtb2_2ps.inp) · [energias](resultados/dimero_xtb2_2ps/dimero_xtb2_2ps-md-ener.csv) · [trajetória completa](resultados/dimero_xtb2_2ps/dimero_xtb2_2ps-traj.xyz) · [tempo de execução](resultados/dimero_xtb2_2ps/execucao.json).
- **DFT, comparação pronta de 60 fs:** [saída](resultados/dimero_b97/dimero_b97.out) · [energias](resultados/dimero_b97/dimero_b97-md-ener.csv) · [trajetória](resultados/dimero_b97/dimero_b97-traj.xyz).

[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

[Preparação do dímero](resultados/preparar_dimero_b97/preparar_dimero_b97.out). Geometria convergida na otimização; não foi feita análise de frequências.

Métodos: [preparar XTB2 no ORCA](../../tutoriais/05-xtb-solvator.md) · [B97-3c das referências DFT](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/3cmethods.html).

## Inputs das variantes e preparações

- **agua_dft:** [Baixar input ORCA](inputs/agua_dft.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua.xyz) (opcional para executar; as coordenadas já estão no input).
- **preparar_agua:** [Baixar input ORCA](inputs/preparar_agua.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua_inicial.xyz) (opcional para executar; as coordenadas já estão no input).

**Continuação de 2 até 5 ps:** [Baixar input ORCA](resultados/dimero_xtb2_5ps/etapas/water_02000_05000fs.inp) · [Baixar geometria inicial (.xyz)](resultados/dimero_xtb2_5ps/etapas/water_restart.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](resultados/dimero_xtb2_5ps/etapas/dimero_xtb2_2ps.mdrestart) (fornece o estado de continuação; manter junto do input). O XYZ isolado não substitui o checkpoint.
