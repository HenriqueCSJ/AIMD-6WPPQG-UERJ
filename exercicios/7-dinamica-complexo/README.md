# 04b · Hidratação sem en e rigidez da parede

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html?exemplo=zn_hydration&aba=trajetoria)

**Zn²⁺ + 20 águas · 61 átomos · carga +2 · singlete · sem en**

> **Pergunta:** o que muda na hidratação quando removemos a parede ou aumentamos sua rigidez?

## 1. Preserve a mesma condição inicial

Depois de construir e inspecionar a montagem de Zn²⁺ + 20 águas em **[04a](../6-complexo-solvator/README.md)**, use aqui a geometria de referência já fornecida. Neste bloco não há en nem quelato pré-formado. Conte os átomos e confira os índices antes de comparar.

**Copie o [XYZ completo abaixo](#geometria-copiar-e-colar-ou-baixar), salve como `zn_20h2o_inicial.xyz` e coloque-o na mesma pasta do input escolhido. Execute somente ORCA.** O download é opcional; não há ajuste das águas a fazer antes da execução.

**Os quatro controles de 1 ps estão disponíveis como trajetórias de referência.** A geometria comum foi preparada a partir da saída verificada do novo SOLVATOR. Não use a antiga estrutura de 43 átomos no lugar dela.

O arquivo comum **`zn_20h2o_inicial.xyz`** é uma preparação da nova montagem SOLVATOR: cada água foi transladada rigidamente **0,8 Å para fora na direção Zn→O**, mantendo suas distâncias e ângulos internos. O Zn permanece na origem; não há otimização intermediária. Essa intervenção didática afasta todas as águas além do corte inicial de 2,6 Å para observar a aproximação durante a MD. **Não é a saída bruta do SOLVATOR.** Use o mesmo [arquivo preparado](estruturas/zn_20h2o_inicial.xyz) em todos os controles, junto dos respectivos inputs. As distâncias iniciais Zn–O vão de **3,174 a 5,722 Å**; nenhum O está abaixo de 2,6 Å. O maior raio atômico é **6,141 Å**, menor que a parede de 6,5 Å.

As variantes usam **XTB2/ALPB(water), timestep de 0,25 fs, velocidades inicializadas a 300 K, semente 42 e CSVR a 300 K com acoplamento de 100 fs**. São **4000 passos = 1000 fs = 1 ps** por controle. As posições e velocidades iniciais foram conferidas e são **idênticas nos quatro controles**; a parede é a variável comparada.

## 2. Compare ausência de parede e três valores de Spring

[Baixar todos os inputs de parede](aula-zn_h2o_paredes.zip)

- **Sem parede:** [input](inputs/zn_h2o_sem_parede.inp) · [pacote](aula-zn_h2o_sem_parede.zip).

**Input completo · `zn_h2o_sem_parede.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_h2o_sem_parede.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use a MESMA montagem SOLVATOR em todos os quatro ramos.
# Use a preparacao fornecida: aguas transladadas rigidamente +0.8 A apos SOLVATOR.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell None
  Dump Position Stride 2 Filename "zn_h2o_sem_parede-traj.xyz"
  Dump Velocity Stride 2000 Filename "zn_h2o_sem_parede-vel.xyz"
  Run 4000
end
* xyzfile 2 1 zn_20h2o_inicial.xyz
```

- **Parede suave · Spring 10:** [input](inputs/zn_h2o_spring10.inp) · [pacote](aula-zn_h2o_spring10.zip).

**Input completo · `zn_h2o_spring10.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_h2o_spring10.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use a MESMA montagem SOLVATOR em todos os quatro ramos.
# Use a preparacao fornecida: aguas transladadas rigidamente +0.8 A apos SOLVATOR.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell Sphere 0, 0, 0, 6.5_A Spring 10.0
  Dump Position Stride 2 Filename "zn_h2o_spring10-traj.xyz"
  Dump Velocity Stride 2000 Filename "zn_h2o_spring10-vel.xyz"
  Run 4000
end
* xyzfile 2 1 zn_20h2o_inicial.xyz
```

- **Parede intermediária · Spring 50:** [input](inputs/zn_h2o_spring50.inp) · [pacote](aula-zn_h2o_spring50.zip).

**Input completo · `zn_h2o_spring50.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_h2o_spring50.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use a MESMA montagem SOLVATOR em todos os quatro ramos.
# Use a preparacao fornecida: aguas transladadas rigidamente +0.8 A apos SOLVATOR.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell Sphere 0, 0, 0, 6.5_A Spring 50.0
  Dump Position Stride 2 Filename "zn_h2o_spring50-traj.xyz"
  Dump Velocity Stride 2000 Filename "zn_h2o_spring50-vel.xyz"
  Run 4000
end
* xyzfile 2 1 zn_20h2o_inicial.xyz
```

- **Parede mais rígida · Spring 200:** [input](inputs/zn_h2o_spring200.inp) · [pacote](aula-zn_h2o_spring200.zip).

**Input completo · `zn_h2o_spring200.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_h2o_spring200.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use a MESMA montagem SOLVATOR em todos os quatro ramos.
# Use a preparacao fornecida: aguas transladadas rigidamente +0.8 A apos SOLVATOR.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell Sphere 0, 0, 0, 6.5_A Spring 200.0
  Dump Position Stride 2 Filename "zn_h2o_spring200-traj.xyz"
  Dump Velocity Stride 2000 Filename "zn_h2o_spring200-vel.xyz"
  Run 4000
end
* xyzfile 2 1 zn_20h2o_inicial.xyz
```


Os três controles com parede usam **esfera de raio 6,5 Å e centro fixo (0, 0, 0)**. O centro não acompanha o Zn. A geometria gerada precisa ser inspecionada: registre os raios atômicos iniciais para saber se algum átomo já alcança essa fronteira. `Spring` está em kJ mol⁻¹ Å⁻².



Aumentar `Spring` torna a repulsão mais rígida. **Spring 200 ainda é um potencial finito**, não uma fronteira impenetrável. A parede muda o modelo físico nas bordas; ela não representa uma caixa periódica nem água líquida infinita. ALPB, por si só, não confina as águas explícitas.

Execute **um cálculo por vez**. Se o tempo da aula permitir somente um, escolha a parede suave e guarde as outras comparações para depois. Não use resultados do histórico como se fossem esses novos controles.

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Na pasta do input e da geometria comum, com ORCA já [instalado](../../tutoriais/01-wsl2-ubuntu-orca.md):

```bash
orca zn_h2o_spring10.inp > zn_h2o_spring10.out &
```

Espere encerrar antes de executar a próxima variante. Substitua o basename pelo do controle escolhido.

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

No Prompt de Comando (`cmd`), na pasta dos arquivos, com ORCA e MS-MPI [configurados](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_h2o_spring10.inp > zn_h2o_spring10.out
```

Espere o prompt voltar antes de iniciar outro cálculo.

</details>

## 3. Observe a hidratação e a atuação da parede

[Abrir 04b no laboratório](../../visualizador/index.html?exemplo=zn_hydration&aba=trajetoria) · [Carregar meus arquivos](../../visualizador/index.html?exemplo=zn_hydration&aba=trajetoria)

Carregue juntos **`.out`**, **`-md-ener.csv`** e **`-traj.xyz`** de cada cálculo. Use as caixas para escolher até quatro simulações e o campo **Simulação** para alternar a trajetória.

1. Compare as distâncias Zn–O no início e ao longo do tempo. Quais águas formam a primeira camada? A saída bruta de SOLVATOR tem três O próximos; a preparação usada nestas MD começa com zero O abaixo de 2,6 Å. Confira qual estrutura está aberta antes de dizer que algo se formou durante a MD.
2. Compare as águas da camada externa. Quais se afastam mais? Elas realmente alcançam a fronteira da parede?
3. Observe sem parede, Spring 10, Spring 50 e Spring 200 no mesmo intervalo físico. A retenção espacial não prova coordenação Zn–O.
4. Relacione movimento, energia e temperatura. O mesmo termostato não apaga a mudança física introduzida pela parede. A rigidez maior pode exigir atenção ao timestep; término normal sozinho não garante uma comparação adequada.

### Resultados desta comparação

Todos os ramos terminaram normalmente e usam **2001 quadros reais, de 0 a 1000 fs, a cada 0,5 fs**, sem redução no laboratório. As energias conservam os **4001 registros nativos**, com os tempos impressos pelo ORCA. Veja a [verificação dos quatro controles](resultados/verificacao-hidratacao.json).

Em todos os ramos, o primeiro O entra abaixo do corte Zn–O de **2,6 Å em 51 fs**, e seis O atendem ao critério em **77,5 fs**. A hidratação inicial ocorre nos quatro casos; a presença da parede não é condição para esses contatos aparecerem nesta referência.

Ao final de 1 ps, os números de O abaixo do corte são **6 sem parede, 6 com Spring 10, 5 com Spring 50 e 6 com Spring 200**. São contagens geométricas do quadro final; não devem ser tratadas como populações de equilíbrio.

O **maior raio atômico ao longo da trajetória, medido a partir do centro fixo da parede**, foi **17,639 Å sem parede**, **7,842 Å com Spring 10**, **7,219 Å com Spring 50** e **6,853 Å com Spring 200**. Compare esses valores com o raio de **6,5 Å**: mesmo Spring 200 permite penetração além da borda. Maior rigidez reduz o afastamento observado nesta janela, sem tornar a parede impenetrável.

- **Sem parede:** [resultados completos](resultado-zn_h2o_sem_parede.zip) · [saída](resultados/zn_h2o_sem_parede/zn_h2o_sem_parede.out) · [energia](resultados/zn_h2o_sem_parede/zn_h2o_sem_parede-md-ener.csv) · [trajetória](resultados/zn_h2o_sem_parede/zn_h2o_sem_parede-traj.xyz).
- **Spring 10:** [resultados completos](resultado-zn_h2o_spring10.zip) · [saída](resultados/zn_h2o_spring10/zn_h2o_spring10.out) · [energia](resultados/zn_h2o_spring10/zn_h2o_spring10-md-ener.csv) · [trajetória](resultados/zn_h2o_spring10/zn_h2o_spring10-traj.xyz).
- **Spring 50:** [resultados completos](resultado-zn_h2o_spring50.zip) · [saída](resultados/zn_h2o_spring50/zn_h2o_spring50.out) · [energia](resultados/zn_h2o_spring50/zn_h2o_spring50-md-ener.csv) · [trajetória](resultados/zn_h2o_spring50/zn_h2o_spring50-traj.xyz).
- **Spring 200:** [resultados completos](resultado-zn_h2o_spring200.zip) · [saída](resultados/zn_h2o_spring200/zn_h2o_spring200.out) · [energia](resultados/zn_h2o_spring200/zn_h2o_spring200-md-ener.csv) · [trajetória](resultados/zn_h2o_spring200/zn_h2o_spring200-traj.xyz).

Uma dinâmica curta descreve esse modelo e essa janela, sem demonstrar equilíbrio, retenção indefinida ou uma taxa macroscópica de evaporação. Se você repetir os cálculos, extraia os números dos seus próprios arquivos antes de compará-los à referência.

## 4. Só depois passe à en

Siga para **[04c · Primeiro N assistido, segundo N livre](../11-formacao-quelato/README.md)**. A referência pronta de 97 átomos foi preparada separadamente, com Zn²⁺, 20 águas e três en. Não é uma continuação calculada a partir da nova saída de 04a–b. Nela, apenas o primeiro N recebe ajuda; depois a restrição é removida e o segundo N fecha livremente o quelato.

[Entenda os controles](apoio.md) · [Histórico: parede no complexo pré-formado de 43 átomos](historico.md) · [Referência anterior com águas e en afastados](hidratacao.md)

**Complemento opcional:** [Cell: rigidez, pressão e parede móvel](../13-cell-pressao/README.md). As referências desse complemento pertencem ao sistema pré-formado indicado ali; seus resultados não substituem estes controles de hidratação sem en.

**Manual:** [Cell e paredes](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell) · [Termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat).

<!-- copyable-geometries -->
## Geometria: copiar e colar ou baixar

Os inputs acima usam `xyzfile`. Você pode copiar a geometria abaixo, salvá-la com o nome indicado e mantê-la na mesma pasta do input. O download é uma alternativa.

### `zn_20h2o_inicial.xyz`

[Baixar a geometria, se preferir](estruturas/zn_20h2o_inicial.xyz).

<!-- xyz-source: estruturas/zn_20h2o_inicial.xyz -->
```text
61
Zn +20H2O; SOLVATOR stochastic then rigid radial translation +0.8 A per water; no optimization
Zn 0.000000000000 0.000000000000 0.000000000000
O 0.555922824394 3.361864876730 -0.749550543529
H 0.848992725669 3.272555950946 -1.663605253468
H 1.227492237545 3.928136335538 -0.352444485045
O 0.907336483050 -0.504818746404 -3.250720903823
H 0.372796938523 -0.206358303924 -3.995402650364
H 1.795489729954 -0.206358303615 -3.477584822347
O -1.941213164387 -1.746900323706 2.016141991644
H -1.916743736919 -1.911826479869 2.965648534093
H -2.295243248466 -2.567406864723 1.654487765706
O -0.507316049519 -3.421046497298 -0.025926027498
H 0.014622933538 -3.536888594850 -0.828124488241
H 0.124579111423 -3.596393902415 0.680702486305
O 1.509655722563 1.048345337380 2.587898760688
H 1.207217059541 0.569589208327 3.368081744367
H 2.158513920841 1.667444310423 2.941539204539
O -3.179388747899 -0.368313004839 -1.535925312285
H -3.174760976902 -0.147072510254 -2.474218065807
H -4.108180039360 -0.287762796647 -1.290526729791
O 2.436122861745 -2.169349443097 -0.862006720971
H 2.984633805154 -2.837670423323 -0.435573987271
H 3.078115465096 -1.590244370837 -1.288439454175
O -3.581610018565 1.394715908999 0.717596977793
H -3.908410896291 2.057842786491 1.336326316589
H -4.169680983881 1.485741097647 -0.040854746582
O 3.637584021629 2.479532131035 -0.176639434438
H 3.259614023317 2.965671619972 -0.918373309687
H 3.203043415082 2.867688453473 0.591391290232
O -0.318471094804 3.397453833453 2.638276467646
H -0.684599778044 2.505651515204 2.637586182034
H -0.591118119047 3.753077567459 1.784720714689
O 4.239424624396 -0.031697738997 1.730865250130
H 4.571843667201 -0.873119196178 1.397894417478
H 3.848475987020 0.379790378174 0.951635658941
O -3.013388276393 4.016291079013 -0.163874444807
H -2.963420352655 3.821383025167 -1.106676715256
H -2.098459505797 3.940269156923 0.130214105665
O 0.416257787868 -2.118763425535 4.083713353440
H 1.076077030207 -2.765576519626 3.808697985193
H 0.480144740629 -2.127488842692 5.045588806805
O -1.202708339562 0.386551986140 4.133001633399
H -1.787727240414 0.580944264210 4.874167331399
H -1.808748088520 0.273630351846 3.391835936260
O -2.431405977003 -1.869764539336 -3.794942330087
H -2.729866419483 -2.386713189762 -4.551941353282
H -2.729866419792 -2.386713190296 -3.037943307773
O -3.349936993776 2.137377947889 -2.498515974724
H -4.154747599743 2.017352761505 -3.015464625150
H -2.843586831207 2.774351784526 -3.015464625684
O 2.462156908433 -3.422949350182 -3.072960718529
H 3.343771192520 -3.593286284558 -3.423822011495
H 1.936091410309 -4.150626138290 -3.423822011857
O 2.260858093917 -3.935689779744 2.073682044161
H 2.389641847235 -4.550601312333 1.342477137182
H 2.728995225671 -4.354675548654 2.804886950289
O 3.080988711794 1.675100711530 -3.442321417927
H 3.947612499314 1.662139096174 -3.864408223515
H 2.636451730842 2.419138119306 -3.864408223951
O 1.118154798626 5.105776129341 -2.329383480226
H 0.313344192660 5.622724779767 -2.449408666610
H 1.624504961196 5.622724780301 -1.692409643589
```
