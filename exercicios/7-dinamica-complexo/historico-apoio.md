> **Apoio histórico do complexo pré-formado (43 átomos).** Os números e índices abaixo pertencem exclusivamente a esse sistema. [Voltar à atividade atual](README.md).

# Apoio · Acompanhar o complexo e o confinamento

[← Voltar à atividade](README.md) · [Abrir o aplicativo](../../visualizador/index.html?exemplo=complex&aba=trajetoria)

Estes controles de 0,5 ps mostram como ler o relógio de um restart e medir coordenação e afastamento. A referência principal de 2 ps também muda a força da parede: `Spring 10.0` nos controles curtos e `Spring 50.0` no caso longo, ambos com raio de 6 Å. Portanto, diferenças entre essas referências não isolam o efeito da duração. Para avaliar somente a janela de observação, compare os primeiros 500 fs com os 2 ps completos da mesma trajetória longa (relógio de 100 a 600 fs versus 100 a 2100 fs).

## Entenda as escolhas

A contagem de átomos no ORCA começa em **zero**. Aqui Zn é o átomo 0; os N do ligante são 1 e 4. As primeiras águas têm O em 13, 16, 19 e 22; confira a lista completa no arquivo de índices. A parede de MD é uma força repulsiva suave fora da região definida por `Walls` (a grafia `Cell` também aparece nos inputs dessas referências), não uma caixa periódica. Se nenhum átomo atingir a fronteira, não haverá evidência de retenção pelo confinamento.

Abra o [Laboratório de trajetórias](../../visualizador/index.html?exemplo=complex&aba=trajetoria) e carregue o `*-md-ener.csv`, o `.out` e o `*-traj.xyz` deste cálculo. O aplicativo prepara os gráficos de energia/temperatura e a animação. Na aba **Geometria**, escolha dois átomos; a medida é calculada do XYZ. O CSV original usa fs, Hartree e K; a conversão de unidades fica explícita na tela.

[Índices dos átomos](estruturas/indices-atomos.txt) · [Geometria relaxada antes da preparação térmica](../6-complexo-solvator/resultados/relaxar_solvato/relaxar_solvato.xyz).

**Relógio da simulação:** a preparação fornecida cobre 0–100 fs. `Restart` conserva esse relógio: os novos 1.000 passos vão de **100 a 600 fs**, adicionando **500 fs = 0,5 ps = 5 × 10⁻¹³ s**. O CSV contém 1.001 registros, incluindo o estado de reinício; o XYZ desta etapa tem 1.000 quadros, de 100,5 a 600 fs. Compare arquivos pelo tempo, não pelo número da linha.

**Arquivos de distâncias:** os CSVs de Colvars abaixo pertencem às referências prontas. Os inputs didáticos curtos de preparação e dos controles com/sem parede não incluem essas medições; neles, use a aba **Geometria** para medir diretamente no XYZ. Para gerar também os CSVs, use o input original da referência ([preparação](resultados/preparacao_termica/preparacao_termica.inp), [com parede](resultados/zn_parede/zn_parede.inp), [sem parede](resultados/zn_sem_parede/zn_sem_parede.inp)), mantendo os arquivos auxiliares indicados para cada execução na mesma pasta.

**Quais colunas usar:** no CSV de Colvars, selecione `Colvar … Position / Angstrom`, que contém as distâncias. As colunas `Internal Force` são forças, não distâncias. Colvars 1–2 medem Zn–N; 3–6, os quatro O inicialmente coordenados; 7–12, os seis O acrescentados. Essas definições apenas medem: não mantêm as distâncias fixas.

**Escolha da parede:** após centralizar o Zn da geometria relaxada na origem, o átomo mais distante estava a 5,087 Å. Escolhemos **raio de 6,0 Å** e `Spring 10.0` (kJ mol⁻¹ Å⁻²), com folga inicial de 0,913 Å. O centro permanece na origem; ele não acompanha o Zn. A força age sobre cada átomo que ultrapassa o raio.

## Resultados de referência

Os tempos abaixo incluem a inicialização do ORCA e foram medidos em um Intel Core Ultra 9 185H. Use-os para organizar a reprodução; o desempenho varia entre computadores.

### zn_parede

Tempo de execução: **26.12 s**, com PAL8.

- [Saída completa](resultados/zn_parede/zn_parede.out)
- [Energias e temperatura — CSV](resultados/zn_parede/zn_parede-md-ener.csv)
- [Distâncias — CSV](resultados/zn_parede/zn_parede-colvars.csv)
- [Trajetória — XYZ](resultados/zn_parede/zn_parede-traj.xyz)
- [Estado de reinício](resultados/zn_parede/zn_parede.mdrestart)
- [Registro da execução](resultados/zn_parede/execucao.json)

O CSV contém **1001 registros**, de **100 a 600 fs**, cobrindo **500 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **0.0437 Eh**; o intervalo máximo–mínimo de E é **0.0448 Eh**. A temperatura variou de **142.4 a 345.5 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/zn_parede/analise.json).

### zn_sem_parede

Tempo de execução: **25.80 s**, com PAL8.

- [Saída completa](resultados/zn_sem_parede/zn_sem_parede.out)
- [Energias e temperatura — CSV](resultados/zn_sem_parede/zn_sem_parede-md-ener.csv)
- [Distâncias — CSV](resultados/zn_sem_parede/zn_sem_parede-colvars.csv)
- [Trajetória — XYZ](resultados/zn_sem_parede/zn_sem_parede-traj.xyz)
- [Estado de reinício](resultados/zn_sem_parede/zn_sem_parede.mdrestart)
- [Registro da execução](resultados/zn_sem_parede/execucao.json)

O CSV contém **1001 registros**, de **100 a 600 fs**, cobrindo **500 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **0.0446 Eh**; o intervalo máximo–mínimo de E é **0.0458 Eh**. A temperatura variou de **142.4 a 329.9 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/zn_sem_parede/analise.json).

**Leitura dos dados:** a primeira ultrapassagem do raio de 6 Å na trajetória com parede ocorreu em **166.5 fs**. O maior raio atômico observado foi **6.608 Å com parede** e **7.283 Å sem parede**. A parede é suave: permite ultrapassar o raio e aplica uma força de retorno. A redução do afastamento neste controle é observável, mas uma trajetória de 0,5 ps não demonstra retenção indefinida.

Os dois N permaneceram próximos ao Zn nesta referência com parede: aproximadamente **1,95–2,15 Å** e **1,91–2,16 Å**. Os quatro O inicialmente coordenados também permaneceram próximos; isso descreve estes 0,5 ps e não determina estabilidade termodinâmica ou uma constante de formação. As distâncias do CSV foram conferidas contra as coordenadas XYZ no mesmo instante.

## Preparação térmica fornecida

Uma trajetória de **100 fs = 0,1 ps = 10⁻¹³ s** prepara o estado inicial comum. Não é uma execução adicional obrigatória nem uma demonstração de equilíbrio convergido.

[Baixar input ORCA](inputs/preparacao_termica.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvato.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar reinício usado nos dois controles](estruturas/preparacao_termica.mdrestart)

<details markdown="1" open><summary>Ver input comentado da preparação</summary>

[Input original usado na referência](resultados/preparacao_termica/preparacao_termica.inp).

<!-- input-source: inputs/preparacao_termica.inp -->
```text
# Apoio: prepara o estado comum para os dois controles.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  # Parede suave: centro (0,0,0), raio 6 A.
  Walls Sphere 0, 0, 0, 6.0_A Spring 10.0
  Dump Position Stride 1 Filename "preparacao_termica-traj.xyz"
  # 200 x 0.5 fs = 100 fs (1e-13 s).
  Run 200
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvato.xyz
```

</details>

### preparacao_termica

Tempo de execução: **6.24 s**, com PAL8.

- [Saída completa](resultados/preparacao_termica/preparacao_termica.out)
- [Energias e temperatura — CSV](resultados/preparacao_termica/preparacao_termica-md-ener.csv)
- [Distâncias — CSV](resultados/preparacao_termica/preparacao_termica-colvars.csv)
- [Trajetória — XYZ](resultados/preparacao_termica/preparacao_termica-traj.xyz)
- [Estado de reinício](resultados/preparacao_termica/preparacao_termica.mdrestart)
- [Registro da execução](resultados/preparacao_termica/execucao.json)

O CSV contém **201 registros**, de **0 a 100 fs**, cobrindo **100 fs nesta etapa**. A diferença final E(t) − E(início da etapa) é **0.0194 Eh**; o intervalo máximo–mínimo de E é **0.023 Eh**. A temperatura variou de **120.8 a 300.0 K**. São descrições desta trajetória, não estimativas de equilíbrio.

[Diagnósticos numéricos desta referência](resultados/preparacao_termica/analise.json).

## Para discutir

1. As duas distâncias Zn–N permanecem próximas de seus valores iniciais?
2. Quais águas estão mais próximas do metal? A conectividade desenhada pelo visualizador coincide com as distâncias?
3. A parede atuou nesta trajetória? Como você verificou?
4. O que podemos concluir se não observamos troca de ligantes em 0,5 ps?

<details markdown="1"><summary>Conferir o raciocínio depois da atividade</summary>

Use as séries de distâncias e a trajetória, não apenas traços de ligação automáticos. Um arquivo de Colvars mede geometria; não prova a existência ou ruptura de uma ligação por um único corte. Ausência de troca em uma trajetória curta não demonstra inércia cinética nem estabilidade termodinâmica. O raio e a maior distância à origem permitem verificar se a fronteira foi alcançada. Em NVT, a energia molecular pode variar pela troca com o banho.

</details>

## Manual do ORCA

- [Cell: paredes de MD](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell)
- [Distâncias e Colvars](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#manage-colvar)
- [Restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#restart)
- [Termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat)

**Antes de avançar:** registre o input usado, a duração física, uma observação e uma limitação da interpretação.

## Preparação térmica original, 100 fs, com 12 Colvars

<!-- input-source: resultados/preparacao_termica/preparacao_termica.inp -->
```text
# Minicurso AIMD / ORCA 6.1.1 - preparacao_termica
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Integra o movimento dos nucleos. PAL8 solicita oito recursos. XTB2 chama
# GFN2-xTB externo; PAL8 tambem define suas threads. ALPB(water) representa o
# ambiente continuo.
! MD XTB2 ALPB(water) PAL8

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
  # Banho CSVR a 300 K; Timecon 100 fs regula o acoplamento. A temperatura
  # pode flutuar.
  Thermostat CSVR 300_K Timecon 100_fs
  # Parede harmonica esferica; centro e raio em angstrom. Spring em kJ mol-1
  # A-2; nao e caixa periodica.
  Cell Sphere 0, 0, 0, 6.0_A Spring 10.0
  # Distancia Zn(0)-N(1), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 1 Distance Atom 0 Atom 1
  # Distancia Zn(0)-N(4), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 2 Distance Atom 0 Atom 4
  # Distancia Zn(0)-O(13), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 3 Distance Atom 0 Atom 13
  # Distancia Zn(0)-O(16), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 4 Distance Atom 0 Atom 16
  # Distancia Zn(0)-O(19), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 5 Distance Atom 0 Atom 19
  # Distancia Zn(0)-O(22), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 6 Distance Atom 0 Atom 22
  # Distancia Zn(0)-O(25), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 7 Distance Atom 0 Atom 25
  # Distancia Zn(0)-O(28), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 8 Distance Atom 0 Atom 28
  # Distancia Zn(0)-O(31), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 9 Distance Atom 0 Atom 31
  # Distancia Zn(0)-O(34), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 10 Distance Atom 0 Atom 34
  # Distancia Zn(0)-O(37), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 11 Distance Atom 0 Atom 37
  # Distancia Zn(0)-O(40), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 12 Distance Atom 0 Atom 40
  # Grava um quadro XYZ por passo. O nome identifica esta trajetoria.
  Dump Position Stride 1 Filename "preparacao_termica-traj.xyz"
  # Numero de passos desta etapa. Duracao fisica = numero de passos x
  # timestep.
  Run 200
end

# Le o XYZ: carga total 2, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 2 1 zn_solvato.xyz
```

## Controle curto original com parede e 12 Colvars

<!-- input-source: resultados/zn_parede/zn_parede.inp -->
```text
# Minicurso AIMD / ORCA 6.1.1 - zn_parede
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Integra o movimento dos nucleos. PAL8 solicita oito recursos. XTB2 chama
# GFN2-xTB externo; PAL8 tambem define suas threads. ALPB(water) representa o
# ambiente continuo.
! MD XTB2 ALPB(water) PAL8

# Memoria em MB por processo. 256 x 8 = 2048 MB de orcamento, alem de memoria
# adicional.
%maxcore 256

# Parametros da dinamica: as unidades sao explicitas em cada linha.
%md
  # Passo de integracao em femtossegundos. 1 fs = 1e-15 s.
  Timestep 0.5_fs
  # Semente fixa para repetir a preparacao aleatoria no mesmo ambiente.
  Randomize 42
  # Banho CSVR a 300 K; Timecon 100 fs regula o acoplamento. A temperatura
  # pode flutuar.
  Thermostat CSVR 300_K Timecon 100_fs
  # Parede harmonica esferica; centro e raio em angstrom. Spring em kJ mol-1
  # A-2; nao e caixa periodica.
  Cell Sphere 0, 0, 0, 6.0_A Spring 10.0
  # Distancia Zn(0)-N(1), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 1 Distance Atom 0 Atom 1
  # Distancia Zn(0)-N(4), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 2 Distance Atom 0 Atom 4
  # Distancia Zn(0)-O(13), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 3 Distance Atom 0 Atom 13
  # Distancia Zn(0)-O(16), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 4 Distance Atom 0 Atom 16
  # Distancia Zn(0)-O(19), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 5 Distance Atom 0 Atom 19
  # Distancia Zn(0)-O(22), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 6 Distance Atom 0 Atom 22
  # Distancia Zn(0)-O(25), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 7 Distance Atom 0 Atom 25
  # Distancia Zn(0)-O(28), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 8 Distance Atom 0 Atom 28
  # Distancia Zn(0)-O(31), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 9 Distance Atom 0 Atom 31
  # Distancia Zn(0)-O(34), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 10 Distance Atom 0 Atom 34
  # Distancia Zn(0)-O(37), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 11 Distance Atom 0 Atom 37
  # Distancia Zn(0)-O(40), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 12 Distance Atom 0 Atom 40
  # Le posicoes e velocidades da preparacao fornecida. Copie tambem o
  # .mdrestart para esta pasta.
  Restart "preparacao_termica.mdrestart"
  # Grava um quadro XYZ por passo. O nome identifica esta trajetoria.
  Dump Position Stride 1 Filename "zn_parede-traj.xyz"
  # Numero de passos desta etapa. Duracao fisica = numero de passos x
  # timestep.
  Run 1000
end

# Le o XYZ: carga total 2, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 2 1 zn_solvato.xyz
```

## Controle curto original sem parede e 12 Colvars

<!-- input-source: resultados/zn_sem_parede/zn_sem_parede.inp -->
```text
# Minicurso AIMD / ORCA 6.1.1 - zn_sem_parede
# Estas linhas de comentario explicam as escolhas e nao alteram o calculo.
# Execute um caso por vez; mantenha o arquivo XYZ na pasta de execucao.

# Integra o movimento dos nucleos. PAL8 solicita oito recursos. XTB2 chama
# GFN2-xTB externo; PAL8 tambem define suas threads. ALPB(water) representa o
# ambiente continuo.
! MD XTB2 ALPB(water) PAL8

# Memoria em MB por processo. 256 x 8 = 2048 MB de orcamento, alem de memoria
# adicional.
%maxcore 256

# Parametros da dinamica: as unidades sao explicitas em cada linha.
%md
  # Passo de integracao em femtossegundos. 1 fs = 1e-15 s.
  Timestep 0.5_fs
  # Semente fixa para repetir a preparacao aleatoria no mesmo ambiente.
  Randomize 42
  # Banho CSVR a 300 K; Timecon 100 fs regula o acoplamento. A temperatura
  # pode flutuar.
  Thermostat CSVR 300_K Timecon 100_fs
  # Distancia Zn(0)-N(1), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 1 Distance Atom 0 Atom 1
  # Distancia Zn(0)-N(4), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 2 Distance Atom 0 Atom 4
  # Distancia Zn(0)-O(13), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 3 Distance Atom 0 Atom 13
  # Distancia Zn(0)-O(16), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 4 Distance Atom 0 Atom 16
  # Distancia Zn(0)-O(19), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 5 Distance Atom 0 Atom 19
  # Distancia Zn(0)-O(22), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 6 Distance Atom 0 Atom 22
  # Distancia Zn(0)-O(25), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 7 Distance Atom 0 Atom 25
  # Distancia Zn(0)-O(28), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 8 Distance Atom 0 Atom 28
  # Distancia Zn(0)-O(31), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 9 Distance Atom 0 Atom 31
  # Distancia Zn(0)-O(34), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 10 Distance Atom 0 Atom 34
  # Distancia Zn(0)-O(37), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 11 Distance Atom 0 Atom 37
  # Distancia Zn(0)-O(40), sem impor restricao. Os indices comecam em zero.
  Manage_Colvar Define 12 Distance Atom 0 Atom 40
  # Le posicoes e velocidades da preparacao fornecida. Copie tambem o
  # .mdrestart para esta pasta.
  Restart "preparacao_termica.mdrestart"
  # Grava um quadro XYZ por passo. O nome identifica esta trajetoria.
  Dump Position Stride 1 Filename "zn_sem_parede-traj.xyz"
  # Numero de passos desta etapa. Duracao fisica = numero de passos x
  # timestep.
  Run 1000
end

# Le o XYZ: carga total 2, multiplicidade 1. O nome do arquivo deve coincidir
# exatamente.
* xyzfile 2 1 zn_solvato.xyz
```
