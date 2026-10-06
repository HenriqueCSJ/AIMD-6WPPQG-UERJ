# 04a · Zn²⁺ isolado + 20 águas com SOLVATOR

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html?exemplo=zn_solvation&aba=trajetoria)

**Bloco Zn²⁺ → águas → en · carga +2 · singlete · sem en nesta etapa**

> **Pergunta:** como construir um ambiente de águas explícitas a partir somente do íon Zn²⁺?

## 1. Comece pelo íon isolado

O soluto inicial contém **um único átomo: Zn**. O SOLVATOR acrescenta **20 moléculas de água**. A contagem final esperada é **1 + 20 × 3 = 61 átomos**, sem etilenodiamina (en). ALPB(water) representa o ambiente implícito; as 20 águas são moléculas explícitas.

A en entra somente em 04c, depois de estudarmos a hidratação e o efeito das paredes em 04b.

## 2. Execute a montagem

[Baixar input ORCA](inputs/zn_ion_20h2o_solvator.inp) · [Baixar pacote da montagem](aula-zn_ion_20h2o_solvator.zip) · [Consultar o Zn isolado em XYZ](estruturas/zn2_isolado.xyz)

O Zn inicial está escrito dentro do input; não há XYZ auxiliar obrigatório nesta execução.

<!-- input-source: inputs/zn_ion_20h2o_solvator.inp -->
```text
# Etapa 04a: apenas Zn2+ como soluto; acrescentar 20 aguas.
! XTB2 ALPB(water) PAL8
%maxcore 256
%solvator
  nsolv 20
  clustermode stochastic
  fixsolute true
end
* xyz 2 1
Zn 0.0 0.0 0.0
*
```

- `nsolv 20` acrescenta vinte águas ao íon isolado.
- `fixsolute true` mantém o Zn fixo durante a montagem.
- `clustermode stochastic` seleciona o procedimento de construção indicado no input.

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Na pasta do input, com ORCA já [instalado](../../tutoriais/01-wsl2-ubuntu-orca.md):

```bash
orca zn_ion_20h2o_solvator.inp > zn_ion_20h2o_solvator.out &
```

Espere encerrar antes de iniciar outro cálculo. Veja [como acompanhar](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

No Prompt de Comando (`cmd`), na pasta do input, com ORCA e MS-MPI [configurados](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_ion_20h2o_solvator.inp > zn_ion_20h2o_solvator.out
```

Espere o prompt voltar antes de iniciar outro cálculo.

</details>

## 3. Baixe o resultado do SOLVATOR

**[Baixar XYZ gerado pelo SOLVATOR](resultados/zn_ion_20h2o_solvator/zn_ion_20h2o_solvator.solvator.xyz)** · **[Baixar pacote dos resultados](resultado-zn_ion_20h2o_solvator.zip)** · [Baixar saída ORCA](resultados/zn_ion_20h2o_solvator/zn_ion_20h2o_solvator.out)

[Abrir o resultado no laboratório](../../visualizador/index.html?exemplo=arquivo_zn_ion_20h2o_solvator&aba=trajetoria) · [Comparar Zn isolado e resultado SOLVATOR](../../visualizador/index.html?exemplo=zn_solvation&aba=trajetoria)

O arquivo **`zn_ion_20h2o_solvator.solvator.xyz`** contém o resultado real da montagem: **61 átomos, um Zn, 20 O e 40 H; nenhum N**. O laboratório abre essa saída sem deslocar as águas.

SOLVATOR fornece uma estrutura candidata de solvatação, não uma trajetória de dinâmica molecular. Na referência fornecida, três O já estão a menos de 2,6 Å do Zn. Esses contatos já existem antes da MD e não devem ser contados como formados durante ela.

1. Confira o término normal no `.out` e a composição no XYZ.
2. Meça as distâncias Zn–O e observe quais águas já estão próximas.
3. Ative **Coordenação** e **Ligações H**. Os traços usam critérios geométricos; o XYZ não contém ordens de ligação.

## 4. Use diretamente a saída na dinâmica

Copie **o mesmo `.solvator.xyz`**, sem alterar suas coordenadas, para a pasta dos inputs de [04b](../7-dinamica-complexo/README.md). Não há ajuste intermediário das águas. Se você executar SOLVATOR novamente, use a sua própria saída e mantenha essa mesma geometria nos quatro controles; a montagem estocástica pode diferir da referência.

## Antes de avançar

Registre a contagem de águas, uma distância Zn–O e uma conclusão que a montagem ainda não permite. Siga para **[04b · Hidratação sem en e paredes](../7-dinamica-complexo/README.md)**.

[Entenda o modelo e confira a contagem](apoio.md) · [Histórico: complexo Zn–en pré-formado, 25/43 átomos](historico.md)

**Manual:** [SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).

## XYZ do resultado: copiar e colar ou baixar

Salve como `zn_ion_20h2o_solvator.solvator.xyz`. O bloco abaixo é a saída do SOLVATOR, sem transformação.

<!-- xyz-source: resultados/zn_ion_20h2o_solvator/zn_ion_20h2o_solvator.solvator.xyz -->
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
