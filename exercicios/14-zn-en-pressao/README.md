# 04d · en sem assistência: 1, 1000 e 4000 bar

[← Percurso](../README.md) · [04c · Quelato assistido](../11-formacao-quelato/README.md) · [Abrir a comparação no laboratório](../../visualizador/index.html?exemplo=zn_pressure&aba=trajetoria)

**Zn²⁺ + 20 águas + três en · 97 átomos · carga +2 · singlete · 5 ps por caso**

> **Pergunta:** mudar a pressão da parede móvel faz a en coordenar sem assistência?

## 1. Compare o mesmo início, sem guiar os N

Os três casos começam na **mesma geometria de 97 átomos dos fragmentos inicialmente afastados** da referência anterior, antes da hidratação e do encontro selecionado usado em 04c. Eles não começam no quelato final nem na geometria de encontro selecionada para assistir o primeiro N. A preparação de 61 átomos de 04a–b também é outro sistema.

**Nenhum caso contém restrição Zn–N.** Todos usam GFN2-xTB/ALPB(water), timestep de **0,25 fs**, CSVR a **300 K**, esfera inicial de **9 Å**, `Spring 50` e **5 ps**. Compare os alvos externos de **1, 1000 e 4000 bar** mantendo as demais escolhas do protocolo.

Os inputs têm dois trechos contínuos: **500 fs com acoplamento térmico de 20 fs**, seguidos de **4500 fs com acoplamento de 100 fs**. Não há reinicialização das velocidades na transição. A mudança de acoplamento é igual nos três casos; nenhum N recebe força de aproximação em qualquer trecho.

## 2. Observe parede, águas e en

[**Abrir os três casos juntos**](../../visualizador/index.html?exemplo=zn_pressure&aba=trajetoria)

As três referências conservam **todos os 10001 quadros reais**, de 0 a 5000 fs, com gravação a cada **0,5 fs**. Marque os casos e alterne o campo **Simulação** para comparar o mesmo tempo físico. Ative **Coordenação** e acompanhe a esfera e seus indicadores.

Na aba **Geometria**, as seis distâncias Zn–N já ficam selecionadas. Os índices começam em zero: **Zn 0; en 1: N 61 e N 64; en 2: N 73 e N 76; en 3: N 85 e N 88**. Confira os dois N de cada par para reconhecer uma mesma en bidentada; observar somente a primeira en não permite concluir sobre as três.

1. Observe primeiro a hidratação do Zn. Meça Zn–O e compare com Zn–N; retenção espacial e coordenação são medidas distintas.
2. Observe o raio da esfera em cada pressão. A referência de **1 bar expande**; as pressões maiores confinam o agregado mais fortemente.
3. Meça as distâncias Zn–N ao longo dos 5 ps. Algum N cruza o corte geométrico de 2,6 Å? Existe contato simultâneo pelos dois N da mesma en?
4. Compare **pressão externa alvo** e **pressão média medida pelo ORCA**. A medida flutua e não precisa coincidir com o alvo.

A `Cell` esférica é uma **parede repulsiva finita, não periódica**, cujo tamanho responde à pressão. Não representa uma caixa periódica de solução macroscópica. `Spring 50` não é uma barreira impenetrável; aumentar o alvo de pressão também não impõe uma ligação Zn–N. Os indicadores do laboratório distinguem alvo, pressão medida e raio reconstruído a partir dos registros da cela.

## 3. O que foi observado nas referências

Ao final de **5 ps**, os três casos têm **seis O e nenhum N** abaixo do corte Zn–O/N de **2,6 Å**. Não se formou o quelato nesta janela, inclusive no alvo de 4000 bar.

A menor distância Zn–N ao longo de cada trajetória foi **3,261 Å a 1 bar**, **3,572 Å a 1000 bar** e **3,370 Å a 4000 bar**. Esses valores permanecem acima do corte usado na atividade. Os raios finais são aproximadamente **47,639 Å**, **7,705 Å** e **5,770 Å**, respectivamente; interprete a expansão a 1 bar junto ao movimento do solvente explícito.

A ausência de coordenação em três trajetórias de 5 ps não demonstra impossibilidade de associação, inércia cinética ou equilíbrio. A comparação mostra a evolução destes estados iniciais e deste modelo, sem fornecer constante de formação ou velocidade experimental. O fechamento assistido de 04c e a ausência de fechamento nestes controles respondem a protocolos diferentes.

[Conferir o resumo numérico dos três casos](resultados/resumo.json).

## 4. Arquivos para reproduzir e conferir

[Baixar os três inputs e a geometria comum](aula-zn-en-pressao.zip) · [Geometria inicial](zn_20h2o_3en_r9.xyz)

- **1 bar:** [input](zn_en_1bar_5ps.inp) · [resultados completos](resultado-zn-en-1bar.zip) · [saída](resultados/zn_en_1bar_5ps/zn_en_1bar_5ps.out) · [energia](resultados/zn_en_1bar_5ps/zn_en_1bar_5ps-md-ener.csv) · [trajetória](resultados/zn_en_1bar_5ps/zn_en_1bar_5ps-traj.xyz).

**Input completo · `zn_en_1bar_5ps.inp` — copie e salve com esse nome.**

<!-- input-source: zn_en_1bar_5ps.inp -->
```text
# Paired pressure pilot from separated fragments; no coordination restraints.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Cell Sphere 0, 0, 0, 9.0_A Spring 50 Elastic 100_fs, 0.0005 Pressure 1
  Dump Position Stride 2 Filename "zn_en_1bar_5ps-traj.xyz"
  Dump Velocity Stride 2000 Filename "zn_en_1bar_5ps-vel.xyz"
  Thermostat CSVR 300_K Timecon 20_fs
  Run 2000
  # Continue inside the same MD process, preserving the elastic wall history.
  Thermostat CSVR 300_K Timecon 100_fs
  Run 18000
end
* xyzfile 2 1 zn_20h2o_3en_r9.xyz
```

- **1000 bar:** [input](zn_en_1000bar_5ps.inp) · [resultados completos](resultado-zn-en-1000bar.zip) · [saída](resultados/zn_en_1000bar_5ps/zn_en_1000bar_5ps.out) · [energia](resultados/zn_en_1000bar_5ps/zn_en_1000bar_5ps-md-ener.csv) · [trajetória](resultados/zn_en_1000bar_5ps/zn_en_1000bar_5ps-traj.xyz).

**Input completo · `zn_en_1000bar_5ps.inp` — copie e salve com esse nome.**

<!-- input-source: zn_en_1000bar_5ps.inp -->
```text
# Paired pressure pilot from separated fragments; no coordination restraints.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Cell Sphere 0, 0, 0, 9.0_A Spring 50 Elastic 100_fs, 0.0005 Pressure 1000
  Dump Position Stride 2 Filename "zn_en_1000bar_5ps-traj.xyz"
  Dump Velocity Stride 2000 Filename "zn_en_1000bar_5ps-vel.xyz"
  Thermostat CSVR 300_K Timecon 20_fs
  Run 2000
  # Continue inside the same MD process, preserving the elastic wall history.
  Thermostat CSVR 300_K Timecon 100_fs
  Run 18000
end
* xyzfile 2 1 zn_20h2o_3en_r9.xyz
```

- **4000 bar:** [input](zn_en_4000bar_5ps.inp) · [resultados completos](resultado-zn-en-4000bar.zip) · [saída](resultados/zn_en_4000bar_5ps/zn_en_4000bar_5ps.out) · [energia](resultados/zn_en_4000bar_5ps/zn_en_4000bar_5ps-md-ener.csv) · [trajetória](resultados/zn_en_4000bar_5ps/zn_en_4000bar_5ps-traj.xyz).

**Input completo · `zn_en_4000bar_5ps.inp` — copie e salve com esse nome.**

<!-- input-source: zn_en_4000bar_5ps.inp -->
```text
# Paired pressure pilot from separated fragments; no coordination restraints.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Cell Sphere 0, 0, 0, 9.0_A Spring 50 Elastic 100_fs, 0.0005 Pressure 4000
  Dump Position Stride 2 Filename "zn_en_4000bar_5ps-traj.xyz"
  Dump Velocity Stride 2000 Filename "zn_en_4000bar_5ps-vel.xyz"
  Thermostat CSVR 300_K Timecon 20_fs
  Run 2000
  # Continue inside the same MD process, preserving the elastic wall history.
  Thermostat CSVR 300_K Timecon 100_fs
  Run 18000
end
* xyzfile 2 1 zn_20h2o_3en_r9.xyz
```


Na aula, interprete os resultados prontos. Para reproduzir depois, coloque input e geometria comum na mesma pasta e execute **um cálculo por vez**, conforme a [orientação de execução](../README.md#como-executar). Carregue `.out`, `-md-ener.csv` e `-traj.xyz` juntos no laboratório. Os arquivos originais mantêm seus relógios e valores.

**Entrega da dupla:** explique como o confinamento mudou sem produzir coordenação Zn–N nesses 5 ps. Cite uma observação da trajetória, uma medida e uma limitação.

Siga para **[05 · Um próton entre duas águas](../10-proton-compartilhado/README.md)**. O [complemento Cell de 43 átomos](../13-cell-pressao/README.md) conserva suas referências históricas e permanece separado desta comparação de 97 átomos.

**Manual:** [Cell e pressão no ORCA](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell).

<!-- copyable-geometries -->
## Geometria: copiar e colar ou baixar

Os inputs acima usam `xyzfile`. Você pode copiar a geometria abaixo, salvá-la com o nome indicado e mantê-la na mesma pasta do input. O download é uma alternativa.

### `zn_20h2o_3en_r9.xyz`

[Baixar a geometria, se preferir](zn_20h2o_3en_r9.xyz).

<!-- xyz-source: zn_20h2o_3en_r9.xyz -->
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
