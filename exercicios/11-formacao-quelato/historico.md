# Histórico · como chegamos à geometria de encontro

[← Voltar à aula 04c de 3 ps](README.md) · [Controles preparados e geometria de encontro](apoio.md)

Esta página conserva a preparação anterior da referência de **97 átomos**. No início, dez O estão a 3,1 Å do Zn, dez a 5,0 Å e todos os N a pelo menos 6,5 Å. Este sistema foi preparado antes dos controles de 04a–b de 61 átomos e é independente deles.

[**Abrir a sequência histórica de 0–10083 fs**](../../visualizador/index.html?exemplo=chelation_history&aba=trajetoria) · [Pacote da sequência histórica](resultado-chelation-continuous.zip) · [Todos os originais e dependências](resultados-completos.zip)

## A preparação e a intervenção

1. **Hidratação · 0–500 fs.** Sem restrição Zn–O, a primeira água cruza 2,6 Å aos 33,5 fs; seis águas, até 66,5 fs.
2. **Encontro com a en · 500–7083 fs.** O Zn permanece hidratado; a en alcança uma posição próxima, ainda sem contato Zn–N pelo corte.
3. **Primeiro N assistido · 7083–8083 fs.** Selecionamos a geometria aos 7083 fs e reinicializamos velocidades a 300 K com semente 93001. O cálculo assistido começa com relógio local zero; no eixo histórico, soma-se 7083 fs. O primeiro contato Zn–N 61 ocorre aos 7623 fs desse eixo, isto é, 540 fs do trecho da aula.
4. **Segundo N livre da restrição · 8083–10083 fs.** O restart preserva o estado dinâmico do primeiro N assistido. N 64 entra aos 8636,75 fs nos registros de distância (8637 fs no XYZ); os dois N ficam no corte até o fim.

A seleção do encontro e a reinicialização são intervenções declaradas. O eixo histórico organiza o percurso didático, mas **não representa uma única propagação com velocidades contínuas**. Os dois inputs originais de coordenação estão completos abaixo. A aula principal usa agora dois inputs mínimos executados separadamente, com resultados próprios.

## Energia, águas e resolução

Em 7083 fs, a reinicialização muda T de 284,90 para 300 K e aumenta K e E em 0,006958 Eh; U permanece igual na precisão impressa. Esse salto é da intervenção, não calor de reação. Os gráficos interrompem a linha nessa fronteira. O termostato tem acoplamento de 20 fs nos primeiros 500 fs e 100 fs depois; a mola móvel realiza trabalho no trecho assistido.

Zn–O 7 e Zn–O 25 ultrapassam 3,0 Å aos 8415 e 8906 fs do eixo histórico, respectivamente, nos XYZ a cada 1 fs. A sequência de contatos é 6O → 6O1N → 5O1N → 5O2N → 4O2N. Os cortes não são ordens de ligação. A [verificação numérica](resultados/chelation_continuous/verificacao.json) conserva os critérios e a resolução.

O terceiro cálculo de hidratação foi **interrompido após 9864 fs** e não atingiu o alvo de 10000 fs. A sequência histórica usa somente seu trecho até **7083 fs**, anterior à interrupção; não preenche dados ausentes. Os dois cálculos de coordenação terminaram normalmente. A [descrição da sequência](resultados/chelation_continuous/curso.json) registra as fontes e as fronteiras; a prévia mantém quadros reais e as energias completas, sem interpolar coordenadas.

## Três inputs da preparação anterior

Nas continuações, mantenha o checkpoint indicado junto do input e da geometria. Os cartões oferecem input, XYZ de entrada, XYZ de resultado (incluindo o parcial) e laboratório de cada cálculo.

<a id="r9_rep1_piloto_0500fs"></a>
### Hidratação inicial · 0–500 fs

**Input completo · `r9_rep1_piloto_0500fs.inp` — copie e salve com esse nome.**

<!-- input-source: resultados/chelation_continuous/etapas/r9_rep1_piloto_0500fs/r9_rep1_piloto_0500fs.inp -->
```text
# Replica 1: mesma geometria; velocidades iniciais com semente 42.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  # Todos os atomos com folga inicial; sem restricoes Zn-O ou Zn-N.
  Walls Sphere 0, 0, 0, 9.0_A Spring 50.0
  Dump Position Stride 2 Filename "r9_rep1_piloto_0500fs-traj.xyz"
  # Dissipar o calor da hidratacao antes da extensao a 10 ps.
  Thermostat CSVR 300_K Timecon 20_fs
  Run 2000
end

* xyzfile 2 1 zn_20h2o_3en_r9.xyz
```

<a id="r9_rep1_00500_05000fs"></a>
### Continuação · 500–5000 fs

**Input completo · `r9_rep1_00500_05000fs.inp` — copie e salve com esse nome.**

<!-- input-source: resultados/chelation_continuous/etapas/r9_rep1_00500_05000fs/r9_rep1_00500_05000fs.inp -->
```text
# Replica 1, continuacao 0.5-5 ps: preservar velocidades.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.25_fs
  Randomize 43
  Walls Sphere 0, 0, 0, 9.0_A Spring 50.0
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 4 Filename "r9_rep1_00500_05000fs-traj.xyz"
  Restart "r9_rep1_piloto_0500fs.mdrestart"
  Run 18000
end

* xyzfile 2 1 zn_20h2o_3en_r9.xyz
```

<a id="r9_rep1_05000_10000fs"></a>
### Continuação interrompida · 5000–9864 fs; somente até 7083 fs na sequência

**Input completo · `r9_rep1_05000_10000fs.inp` — copie e salve com esse nome.**

<!-- input-source: resultados/chelation_continuous/etapas/r9_rep1_05000_10000fs/r9_rep1_05000_10000fs.inp -->
```text
# Replica 1, continuacao 5-10 ps: preservar velocidades.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.25_fs
  Randomize 44
  Walls Sphere 0, 0, 0, 9.0_A Spring 50.0
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 4 Filename "r9_rep1_05000_10000fs-traj.xyz"
  Restart "r9_rep1_00500_05000fs.mdrestart"
  Run 20000
end

* xyzfile 2 1 zn_20h2o_3en_r9.xyz
```

<a id="coordenacao-original"></a>
## Dois inputs originais de coordenação

Estes são os inputs da referência anterior. `Define 2` e `Define 3` apenas registram medidas; não aplicam forças a N 64 nem às águas. A aula atual usa versões mínimas com somente a distância Zn–N 61.

[Abrir a referência anterior de 3 ps](../../visualizador/index.html?exemplo=chelation_previous&aba=trajetoria) · [Pacote original](resultado-chelation.zip).

<a id="original-m01a"></a>
### Primeiro N: input original

**Input completo · `m01a_N_sem_vies_agua.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/m01a_N_sem_vies_agua.inp -->
```text
# Encontro real hidratado: trecho assistido, sem significado cinetico.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 93001
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Walls Sphere 0, 0, 0, 9.0_A Spring 50.0
  Dump Position Stride 4 Filename "m01a_N_sem_vies_agua-traj.xyz"
  Manage_Colvar Define 1 Distance Atom 0 Atom 61
  Manage_Colvar Define 2 Distance Atom 0 Atom 64
  Manage_Colvar Define 3 CoordNumber Atom 0 Group 1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46 49 52 55 58 Cutoff 2.6_A
  # Aproximar apenas N61; todas as aguas e N64 ficam sem vies.
  # Upper nao obriga a agua individual nem impoe ligacoes covalentes.
  Restraint Add Colvar 1 Harmonic Spring 200.0 Upper Ramp 3.886868 2.2
  Run 4000
  # Revisar antes de retirar o unico vies em outro bloco.
end
* xyzfile 2 1 encontro_real_R1.xyz
```

<a id="original-m02"></a>
### Continuação: input original

**Input completo · `m02_livre_apos_N1.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/m02_livre_apos_N1.inp -->
```text
# Retirar a aproximacao Zn-N; continuar posicoes, velocidades e relogio.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 93002
  Thermostat CSVR 300_K Timecon 100_fs
  Walls Sphere 0, 0, 0, 9.0_A Spring 50.0
  Dump Position Stride 4 Filename "m02_livre_apos_N1-traj.xyz"
  Manage_Colvar Define 1 Distance Atom 0 Atom 61
  Manage_Colvar Define 2 Distance Atom 0 Atom 64
  Manage_Colvar Define 3 CoordNumber Atom 0 Group 1 4 7 10 13 16 19 22 25 28 31 34 37 40 43 46 49 52 55 58 Cutoff 2.6_A
  Restraint Reset Colvar 1
  Restraint Reset Colvar 3
  Restart "m01a_N_sem_vies_agua.mdrestart"
  Run 8000
end
* xyzfile 2 1 encontro_real_R1.xyz
```

## Geometria dos fragmentos inicialmente afastados

Este XYZ pertence ao início da preparação histórica e também à origem dos controles 04d. A aula principal 04c usa outro XYZ: o encontro selecionado, disponível no [apoio](apoio.md#geometria-de-encontro).

### `zn_20h2o_3en_r9.xyz`

[Baixar a geometria](estruturas/zn_20h2o_3en_r9.xyz).

<!-- xyz-source: estruturas/zn_20h2o_3en_r9.xyz -->
```text
97
Zn2+ +20H2O +3en; separated fragments inside9A; shared replica geometry
Zn  0.0000000000  0.0000000000  0.0000000000
O   1.3512586725  2.7900000000  0.0000000000
H   2.3003842161  2.9901516985  0.0000000000
H   0.9198402204  3.6587796724  0.0000000000
O  -1.6324187912  2.1700000000  1.4954293331
H  -1.3322251034  3.0467655290  1.7819008971
H  -2.5580403127  2.1246255373  1.7819008971
O   0.2347099855  1.5500000000 -2.6743992265
H   1.0379962107  1.7320955552 -3.1867198773
H  -0.4786519147  1.9617552065 -3.1867198773
O   1.7992824116  0.9300000000  2.3468452875
H   2.4961264248  0.4268174624  2.7964181460
H   1.7917966116  1.7894929946  2.7964181460
O  -3.0373103958  0.3100000000 -0.5372574424
H  -3.5412767031  1.1323901253 -0.6401770364
H  -3.6970273736 -0.3936199730 -0.6401770364
O   2.6025303468 -0.3100000000 -1.6555167755
H   3.0103673614 -1.1309701756 -1.9726554522
H   3.1917995442  0.3922000233 -1.9726554522
O  -0.7677048422 -0.9300000000  2.8558237472
H  -1.5062473135 -0.6198971975  3.4028989432
H  -0.3232927615 -1.5964132595  3.4028989432
O  -1.2373872958 -1.5500000000 -2.3825139413
H  -2.0738217159 -1.3684200357 -2.8389196569
H  -0.8750324808 -2.3254307259 -2.8389196569
O   2.0795097008 -2.1700000000  0.7594336075
H   1.9241186052 -3.1163556245  0.9049143256
H   3.0316223575 -2.0550354418  0.9049143256
O  -1.2490299491 -2.7900000000  0.5155814060
H  -2.1883216869 -3.0110793200  0.6143486352
H  -0.7882784607 -3.6378520510  0.6143486352
O  -2.3814853186  4.1931165900 -1.3214768026
H  -2.8723776754  4.8029423591 -0.7487314617
H  -2.4562917100  4.5793250132 -2.2081261457
O   1.3871593461 -4.3626535038 -2.0107320443
H   1.4752393898 -4.5816210053 -2.9515801400
H   1.6285855561 -5.1799920448 -1.5475138510
O   4.8110042380  1.2380181824  0.5670530858
H   5.4715570219  1.3875337029 -0.1273640286
H   5.2932588665  1.3825818781  1.3961681630
O  -4.3026380954 -1.0555811975  2.3179848480
H  -4.4242309011 -1.5097118405  3.1664425951
H  -5.2030952536 -0.8521936337  2.0201419279
O   1.3438314144 -1.3263651076 -4.6297810673
H   1.3777249695 -0.7670038704 -5.4215299121
H   1.6291519829 -2.2007915166 -4.9377918277
O  -0.6479903569  2.0627832061  4.5083293959
H  -0.9123612737  2.9735122955  4.7122424759
H  -0.5375432668  1.6420482680  5.3753262541
O   2.7223355107 -2.1594028632  3.5952564083
H   2.9402581122 -3.0997086347  3.6913542542
H   3.1510773157 -1.7320423058  4.3531768649
O  -3.2247221461  1.2246228192 -3.6195947330
H  -3.1080046127  1.8849268999 -4.3205052397
H  -4.1074411606  0.8552160161 -3.7784838619
O  -1.2105131046  0.0666704752 -4.8507950968
H  -1.6851442832 -0.6134729435 -5.3538161445
H  -1.0234275777  0.7626508188 -5.5000333943
O  -3.3290880750 -3.3124717278 -1.7160138815
H  -4.1298537363 -3.6337064346 -1.2727502818
H  -3.3191150093 -3.7780825643 -2.5668999414
N   6.4045782233 -1.9347324243 -2.1864070923
C   6.1632489276 -2.3423968824 -0.8131265196
C   5.8927029728 -3.8445570009 -0.6338286728
N   4.7248460470 -4.2337306609 -1.4146923920
H   7.2245154973 -2.4185965676 -2.5390212270
H   5.6191996693 -2.2432595561 -2.7515243303
H   7.0314671179 -2.0616622179 -0.2116023002
H   5.2992842888 -1.7780600715 -0.4494071003
H   5.7913915177 -4.0589904672  0.4436882270
H   6.7473648898 -4.4147628549 -1.0116561565
H   4.5490306339 -5.2254966928 -1.3038122366
H   3.9082653416 -3.7369336207 -1.0725514061
N   4.3023345732  4.5193665199  1.8207810094
C   3.7901029070  5.3793491273  2.8735764815
C   2.2845014788  5.6726830682  2.7789858293
N   1.9849316212  6.3174813701  1.5063558221
H   3.8311456739  3.6211404102  1.8647042084
H   4.0574672809  4.9329500762  0.9261556085
H   4.0025530795  4.9098541729  3.8373635826
H   4.3415262209  6.3231518668  2.8248787721
H   1.9857646135  6.2722299441  3.6556774630
H   1.7285711492  4.7301924301  2.8104211813
H   0.9914403180  6.5051015637  1.4386873380
H   2.4697838945  7.2080132347  1.4559269316
N  -0.2974963908 -5.1660825696  3.9335844708
C  -1.5683858475 -5.8202323934  3.6742436377
C  -2.7658211849 -4.8630776319  3.5654721878
N  -2.9100118736 -4.1081041230  4.8041481467
H  -0.0881584772 -4.5292815577  3.1710751401
H  -0.3982938045 -4.5969537260  4.7686283005
H  -1.4808652677 -6.3895994581  2.7454770049
H  -1.7481068186 -6.5255636461  4.4911958674
H  -3.6629886610 -5.4484575441  3.3014470567
H  -2.5837789961 -4.1443266988  2.7601194369
H  -3.6945813221 -3.4708941539  4.7319015830
H  -3.1027007582 -4.7469905470  5.5692409076
```
