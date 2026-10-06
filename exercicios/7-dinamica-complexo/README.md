# 04b · Hidratação sem en e rigidez da parede

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Zn²⁺ + 20 águas · 61 átomos · carga +2 · singlete · sem en**

> **Pergunta:** o que muda na hidratação quando removemos a parede ou aumentamos sua rigidez?

## 1. Preserve a mesma condição inicial

Comece pela montagem de Zn²⁺ + 20 águas de **[04a](../6-complexo-solvator/README.md)**. Neste bloco não há en nem quelato pré-formado. Conte os átomos e confira os índices antes de comparar.

**Os quatro controles de 1 ps estão disponíveis como trajetórias de referência.** A geometria comum foi preparada a partir da saída verificada do novo SOLVATOR. Não use a antiga estrutura de 43 átomos no lugar dela.

O arquivo comum **`zn_20h2o_inicial.xyz`** é uma preparação da nova montagem SOLVATOR: cada água foi transladada rigidamente **0,8 Å para fora na direção Zn→O**, mantendo suas distâncias e ângulos internos. O Zn permanece na origem; não há otimização intermediária. Essa intervenção didática afasta todas as águas além do corte inicial de 2,6 Å para observar a aproximação durante a MD. **Não é a saída bruta do SOLVATOR.** Use o mesmo [arquivo preparado](estruturas/zn_20h2o_inicial.xyz) em todos os controles, junto dos respectivos inputs. As distâncias iniciais Zn–O vão de **3,174 a 5,722 Å**; nenhum O está abaixo de 2,6 Å. O maior raio atômico é **6,141 Å**, menor que a parede de 6,5 Å.

As variantes usam **XTB2/ALPB(water), timestep de 0,25 fs, velocidades inicializadas a 300 K, semente 42 e CSVR a 300 K com acoplamento de 100 fs**. São **4000 passos = 1000 fs = 1 ps** por controle. As posições e velocidades iniciais foram conferidas e são **idênticas nos quatro controles**; a parede é a variável comparada.

## 2. Compare ausência de parede e três valores de Spring

[Baixar todos os inputs de parede](aula-zn_h2o_paredes.zip)

- **Sem parede:** [input](inputs/zn_h2o_sem_parede.inp) · [pacote](aula-zn_h2o_sem_parede.zip).
- **Parede suave · Spring 10:** [input](inputs/zn_h2o_spring10.inp) · [pacote](aula-zn_h2o_spring10.zip).
- **Parede intermediária · Spring 50:** [input](inputs/zn_h2o_spring50.inp) · [pacote](aula-zn_h2o_spring50.zip).
- **Parede mais rígida · Spring 200:** [input](inputs/zn_h2o_spring200.inp) · [pacote](aula-zn_h2o_spring200.zip).

Os três controles com parede usam **esfera de raio 6,5 Å e centro fixo (0, 0, 0)**. O centro não acompanha o Zn. A geometria gerada precisa ser inspecionada: registre os raios atômicos iniciais para saber se algum átomo já alcança essa fronteira. `Spring` está em kJ mol⁻¹ Å⁻².

<details markdown="1"><summary>Input comentado · parede suave, Spring 10</summary>

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

</details>

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

[Abrir 04b no laboratório](../../visualizador/index.html?exemplo=zn_hydration&aba=trajetoria) · [Carregar meus arquivos](../../visualizador/index.html)

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
