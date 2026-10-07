# 04b · Hidratação sem en e rigidez da parede

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html?exemplo=zn_hydration&aba=trajetoria)

**Zn²⁺ + 20 águas · 61 átomos · carga +2 · singlete · sem en**

> **Pergunta:** o que muda na hidratação quando removemos a parede ou aumentamos sua rigidez?

## 1. Use a saída do SOLVATOR sem modificações

O ponto de partida é **`zn_ion_20h2o_solvator.solvator.xyz`**, produzido em [04a](../6-complexo-solvator/README.md). Copie o XYZ completo ao fim desta página ou [baixe a estrutura gerada](estruturas/zn_ion_20h2o_solvator.solvator.xyz) e mantenha-a junto do input. **Nenhuma água é deslocada entre SOLVATOR e MD.**

Use exatamente a mesma geometria nos quatro controles. A referência tem 61 átomos, sem en, e já começa com três O a menos de 2,6 Å do Zn. A dinâmica mostra a reorganização e a evolução da hidratação a partir desse estado; contatos iniciais não são eventos formados pela MD.

As variantes usam **XTB2/ALPB(water), timestep de 0,25 fs, velocidades inicializadas a 300 K, semente 42 e CSVR a 300 K com acoplamento de 100 fs**. São **4000 passos = 1000 fs = 1 ps** por controle. A parede é a variável comparada.

## 2. Compare ausência de parede e três valores de Spring

[Baixar todos os inputs de parede](aula-zn_solv_h2o_paredes.zip)

- **Sem parede:** [input](inputs/zn_solv_h2o_sem_parede.inp) · [pacote](aula-zn_solv_h2o_sem_parede.zip).

**Input completo · `zn_solv_h2o_sem_parede.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_solv_h2o_sem_parede.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use diretamente a saida bruta do SOLVATOR, sem deslocar as aguas.
# A MESMA geometria inicial deve ser usada nos quatro ramos.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell None
  Dump Position Stride 2 Filename "zn_solv_h2o_sem_parede-traj.xyz"
  Run 4000
end
* xyzfile 2 1 zn_ion_20h2o_solvator.solvator.xyz
```

- **Parede suave · Spring 10:** [input](inputs/zn_solv_h2o_spring10.inp) · [pacote](aula-zn_solv_h2o_spring10.zip).

**Input completo · `zn_solv_h2o_spring10.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_solv_h2o_spring10.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use diretamente a saida bruta do SOLVATOR, sem deslocar as aguas.
# A MESMA geometria inicial deve ser usada nos quatro ramos.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell Sphere 0, 0, 0, 6.5_A Spring 10.0
  Dump Position Stride 2 Filename "zn_solv_h2o_spring10-traj.xyz"
  Run 4000
end
* xyzfile 2 1 zn_ion_20h2o_solvator.solvator.xyz
```

- **Parede intermediária · Spring 50:** [input](inputs/zn_solv_h2o_spring50.inp) · [pacote](aula-zn_solv_h2o_spring50.zip).

**Input completo · `zn_solv_h2o_spring50.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_solv_h2o_spring50.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use diretamente a saida bruta do SOLVATOR, sem deslocar as aguas.
# A MESMA geometria inicial deve ser usada nos quatro ramos.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell Sphere 0, 0, 0, 6.5_A Spring 50.0
  Dump Position Stride 2 Filename "zn_solv_h2o_spring50-traj.xyz"
  Run 4000
end
* xyzfile 2 1 zn_ion_20h2o_solvator.solvator.xyz
```

- **Parede mais rígida · Spring 200:** [input](inputs/zn_solv_h2o_spring200.inp) · [pacote](aula-zn_solv_h2o_spring200.zip).

**Input completo · `zn_solv_h2o_spring200.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/zn_solv_h2o_spring200.inp -->
```text
# 04b: Zn2+ + 20 H2O, sem etilenodiamina (61 atomos).
# Use diretamente a saida bruta do SOLVATOR, sem deslocar as aguas.
# A MESMA geometria inicial deve ser usada nos quatro ramos.
# Raio fixo 6.5 A; Spring finito, inclusive no ramo mais rigido.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Cell Sphere 0, 0, 0, 6.5_A Spring 200.0
  Dump Position Stride 2 Filename "zn_solv_h2o_spring200-traj.xyz"
  Run 4000
end
* xyzfile 2 1 zn_ion_20h2o_solvator.solvator.xyz
```


Os três controles com parede usam **esfera de raio 6,5 Å e centro fixo (0, 0, 0)**. O centro não acompanha o Zn. A geometria gerada precisa ser inspecionada: registre os raios atômicos iniciais para saber se algum átomo já alcança essa fronteira. `Spring` está em kJ mol⁻¹ Å⁻².



Aumentar `Spring` torna a repulsão mais rígida. **Spring 200 ainda é um potencial finito**, não uma fronteira impenetrável. A parede muda o modelo físico nas bordas; ela não representa uma caixa periódica nem água líquida infinita. ALPB, por si só, não confina as águas explícitas.

Execute **um cálculo por vez**. Se o tempo da aula permitir somente um, escolha a parede suave e guarde as outras comparações para depois. Não use resultados do histórico como se fossem esses novos controles.

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Na pasta do input e da geometria comum, com ORCA já [instalado](../../tutoriais/01-wsl2-ubuntu-orca.md):

```bash
orca zn_solv_h2o_spring10.inp > zn_solv_h2o_spring10.out &
```

Espere encerrar antes de executar a próxima variante. Substitua o basename pelo do controle escolhido.

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

No Prompt de Comando (`cmd`), na pasta dos arquivos, com ORCA e MS-MPI [configurados](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_solv_h2o_spring10.inp > zn_solv_h2o_spring10.out
```

Espere o prompt voltar antes de iniciar outro cálculo.

</details>

## 3. Observe a hidratação e a atuação da parede

[Abrir 04b no laboratório](../../visualizador/index.html?exemplo=zn_hydration&aba=trajetoria) · [Carregar meus arquivos](../../visualizador/index.html?exemplo=zn_hydration&aba=trajetoria)

Carregue juntos **`.out`**, **`-md-ener.csv`** e **`-traj.xyz`** de cada cálculo. Use as caixas para escolher até quatro simulações e o campo **Simulação** para alternar a trajetória.

1. Compare as distâncias Zn–O no início e ao longo do tempo. A saída do SOLVATOR começa com três O abaixo de 2,6 Å. Quais contatos persistem, surgem ou se desfazem durante a MD?
2. Compare as águas da camada externa. Quais se afastam mais? Elas realmente alcançam a fronteira da parede?
3. Observe sem parede, Spring 10, Spring 50 e Spring 200 no mesmo intervalo físico. A retenção espacial não prova coordenação Zn–O.
4. Relacione movimento, energia e temperatura. O mesmo termostato não apaga a mudança física introduzida pela parede. A rigidez maior pode exigir atenção ao timestep; término normal sozinho não garante uma comparação adequada.

### Resultados desta comparação

**Os quatro controles terminaram normalmente: 1 ps, 2001 quadros reais de 0 a 1000 fs e 4001 registros de energia por ramo.** O laboratório mantém todos os quadros. As coordenadas iniciais correspondem à saída bruta do SOLVATOR; posições e velocidades iniciais são iguais entre os quatro controles. Veja a [verificação desta comparação](resultados/verificacao-solvator-direto.json).

Com corte Zn–O estritamente menor que 2,6 Å, todos começam com **três O próximos**, alcançam seis O pela primeira vez em **20,5 fs** e terminam com **seis O** dentro do corte. As três proximidades iniciais já vêm da montagem; não foram criadas pela dinâmica.

O maior raio atômico ao longo do filme, medido a partir da origem fixa, é **17,988 Å sem parede**, **7,617 Å com Spring 10**, **7,048 Å com Spring 50** e **6,739 Å com Spring 200**. Mesmo a parede mais rígida permite penetração além do raio de 6,5 Å. Esses valores descrevem esta janela de 1 ps; não comprovam equilíbrio nem retenção indefinida.

- **Sem parede: [baixar XYZ do resultado](resultados/zn_solv_h2o_sem_parede/zn_solv_h2o_sem_parede-traj.xyz)** · [pacote completo](resultado-zn_solv_h2o_sem_parede.zip) · [saída ORCA](resultados/zn_solv_h2o_sem_parede/zn_solv_h2o_sem_parede.out) · [energias](resultados/zn_solv_h2o_sem_parede/zn_solv_h2o_sem_parede-md-ener.csv).
- **Spring 10: [baixar XYZ do resultado](resultados/zn_solv_h2o_spring10/zn_solv_h2o_spring10-traj.xyz)** · [pacote completo](resultado-zn_solv_h2o_spring10.zip) · [saída ORCA](resultados/zn_solv_h2o_spring10/zn_solv_h2o_spring10.out) · [energias](resultados/zn_solv_h2o_spring10/zn_solv_h2o_spring10-md-ener.csv).
- **Spring 50: [baixar XYZ do resultado](resultados/zn_solv_h2o_spring50/zn_solv_h2o_spring50-traj.xyz)** · [pacote completo](resultado-zn_solv_h2o_spring50.zip) · [saída ORCA](resultados/zn_solv_h2o_spring50/zn_solv_h2o_spring50.out) · [energias](resultados/zn_solv_h2o_spring50/zn_solv_h2o_spring50-md-ener.csv).
- **Spring 200: [baixar XYZ do resultado](resultados/zn_solv_h2o_spring200/zn_solv_h2o_spring200-traj.xyz)** · [pacote completo](resultado-zn_solv_h2o_spring200.zip) · [saída ORCA](resultados/zn_solv_h2o_spring200/zn_solv_h2o_spring200.out) · [energias](resultados/zn_solv_h2o_spring200/zn_solv_h2o_spring200-md-ener.csv).

## 4. Só depois passe à en

Siga para **[04c · Primeiro N assistido, segundo N livre](../11-formacao-quelato/README.md)**. A referência pronta de 97 átomos foi preparada separadamente, com Zn²⁺, 20 águas e três en. Não é uma continuação calculada a partir da nova saída de 04a–b. Nela, apenas o primeiro N recebe ajuda; depois a restrição é removida e o segundo N fecha livremente o quelato.

[Entenda os controles](apoio.md) · [Histórico separado: águas deslocadas previamente](historico-radial.md) · [Histórico: parede no complexo pré-formado de 43 átomos](historico.md) · [Referência anterior com águas e en afastados](hidratacao.md)

**Complemento opcional:** [Cell: rigidez, pressão e parede móvel](../13-cell-pressao/README.md). As referências desse complemento pertencem ao sistema pré-formado indicado ali; seus resultados não substituem estes controles de hidratação sem en.

**Manual:** [Cell e paredes](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell) · [Termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat).

<!-- copyable-geometries -->
## Geometria: copiar e colar ou baixar

Os inputs acima usam `xyzfile`. Você pode copiar a geometria abaixo, salvá-la com o nome indicado e mantê-la na mesma pasta do input. O download é uma alternativa.

### `zn_ion_20h2o_solvator.solvator.xyz`

[Baixar o XYZ gerado pelo SOLVATOR](estruturas/zn_ion_20h2o_solvator.solvator.xyz).

<!-- xyz-source: estruturas/zn_ion_20h2o_solvator.solvator.xyz -->
```text
61
2.797566
Zn 0.00000000000000000000 0.00000000000000000000 0.00000000000000000000
O  0.42845356185829014395 2.59101248899220459876 -0.57768378284810573131
H  0.72152346313317139437 2.50170356320817166562 -1.49173849278749504066
H  1.10002297500853729595 3.15728394779962373562 -0.18057772436439845087
O  0.69462876587447974774 -0.38647362842322374732 -2.48865144497861745521
H  0.16008922134722947117 -0.08801318594256334060 -3.23333319151951359416
H  1.58278201277829011495 -0.08801318563421281493 -2.71551536350186806246
O  -1.47050359065344538045 -1.32330814855911138572 1.52726351354390765813
H  -1.44603416318533950502 -1.48823430472195950003 2.47677005599271105041
H  -1.82453367473264282950 -2.14381468957607257408 1.16560928760624049616
O  -0.38996852419066885265 -2.62972254672934457886 -0.01992906530541278115
H  0.13197045886722991170 -2.74556464428122692922 -0.82212752604914629551
H  0.24192663675200987150 -2.80506995184657137443 0.68669944849741770820
O  1.12916967872432216780 0.78412564540994578177 1.93565775858849686841
H  0.82673101570190821175 0.30536951635660081195 2.71584074226823757314
H  1.77802787700234032897 1.40322461845323354090 2.28929820243996839935
O  -2.46292763603569975217 -0.28531530751868061646 -1.18981137522486135616
H  -2.45829986503900466133 -0.06407481293447533921 -2.12810412874696153196
H  -3.39171892749672476697 -0.20476509932706229988 -0.94441279273147182849
O  1.85849913102955199840 -1.65497977060495071733 -0.65761820432961581862
H  2.40701007443896353166 -2.32330075083047971063 -0.23118547062961608551
H  2.50049173438110461376 -1.07587469834478866026 -1.08405093753353720665
O  -2.84879998146069945975 1.10935211681448175902 0.57077410618049029267
H  -3.17560085918615753187 1.77247899430619226813 1.18950344497598781146
H  -3.43687094677624749295 1.20037730546274223897 -0.18767761819470252238
O  2.97707960581166863889 2.02930420173608228041 -0.14456563881958151008
H  2.59910960750009500941 2.51544369067337925117 -0.88629951406897167221
H  2.54253899926512971774 2.41746052417395329570 0.62346508585032867078
O  -0.25940345521809138329 2.76731947646626208481 2.14894865717717786779
H  -0.62553213845824462425 1.87551715821688969044 2.14825837156489773960
H  -0.53205047946105421541 3.12294321047169365357 1.29539290421969965905
O  3.49879407703708267263 -0.02616012107435483625 1.42848183936440875641
H  3.83121311984185375366 -0.86758157825487736137 1.09551100671188450519
H  3.10784543966109172430 0.38532799609697931942 0.64925224817580295955
O  -2.53352448985324585351 3.37672111050920387143 -0.13777843447303217417
H  -2.48355656611498387676 3.18181305666285219047 -1.08058070492185964717
H  -1.61859571925644596391 3.30069918841922094188 0.15631011599993194228
O  0.34416964052217580150 -1.75183280114361039637 3.37648975662189387847
H  1.00398888286132614844 -2.39864589523441118502 3.10147438837490696528
H  0.40805659328371468586 -1.76055821830096981273 4.33836520998661612225
O  -0.98007541117425667210 0.31499748051503323465 3.36794311804039914193
H  -1.56509431202642645964 0.50938975858476953640 4.10910881604114308630
H  -1.58611516013209996601 0.20207584622120586260 2.62677742090187127388
O  -2.03277249547840188626 -1.56321320443097588893 -3.17275455579725296218
H  -2.33123293795906283421 -2.08016185485696825097 -3.92975357899169797093
H  -2.33123293826741351253 -2.08016185539104769830 -2.41575553348344351789
O  -2.77899843987057915129 1.77309901458798124807 -2.07268733968674823132
H  -3.58380904583730375279 1.65307382820375559085 -2.58963599011274103745
H  -2.27264827730134166828 2.41007285122492254104 -2.58963599064682048478
O  2.08463113673704913964 -2.89810400402355927696 -2.60177959165629157923
H  2.96624542082403985788 -3.06844093839956011394 -2.95264088462192830775
H  1.55856563861335972732 -3.62578079213164716776 -2.95264088498441612529
O  1.89840453959815591567 -3.30473255460799109073 1.74123595678574005774
H  2.02718829291598989784 -3.91964408719734747066 1.01003104980662916645
H  2.36654167135260884436 -3.72371832351866194344 2.47244086291422426882
O  2.57940983849328642208 1.40239762620646524205 -2.88191829417254830048
H  3.44603362601369322959 1.38943601085069512457 -3.30400509976057277228
H  2.13487285754159339390 2.14643503398247581515 -3.30400510019664706007
O  0.96183363445903169442 4.39197436459716517021 -2.00372916307002357783
H  0.15702302849230723170 4.90892301502316108497 -2.12375434945424945710
H  1.46818379702826895539 4.90892301555723697959 -1.36675532643308250691
```
