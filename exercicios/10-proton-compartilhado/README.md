# 05 · H₅O₂⁺: onde está o próton?

[← Percurso](../README.md) · [Laboratório com os 10 ps carregados](../../visualizador/index.html?exemplo=proton_shared&aba=trajetoria)

**Núcleo da aula · 20 min · executar ou abrir o resultado pronto · 7 átomos**

> **Pergunta:** quando um H muda de proximidade entre dois O, ele permaneceu no novo lado ou voltou logo depois?

No dímero neutro da abertura, as águas mudam a orientação da ligação H e preservam suas ligações O–H covalentes. Aqui, o dímero protonado H₅O₂⁺ permite acompanhar o H compartilhado. Usamos GFN2-xTB, um método semiempírico de estrutura eletrônica, com núcleos clássicos. Não há solvente implícito, parede ou força aplicada para transferir o H.

**Para observar com calma:** o laboratório abre a referência completa de **10 ps**, com **40001 quadros**. Um ciclo automático de reprodução leva **78 s**; escolha **120 s** em **Duração a 1×**, ou reduza **Velocidade**, para acompanhar cada passagem por mais tempo. Esses controles não alteram o tempo físico.

O input curto abaixo permite executar os primeiros **2 ps** durante a aula. A referência longa preserva esses mesmos 2 ps e acrescenta **8 ps por restart**, sem reinicializar posições ou velocidades.

## 1. Otimização: preparar o H₅O₂⁺

Comece com os sete átomos da geometria inicial e relaxe a estrutura. Salve o input abaixo como **`z00_otimizar.inp`**. Esta etapa é uma otimização de geometria; não produz uma dinâmica molecular.

[Estrutura inicial](estruturas/h5o2_inicial.xyz) · [Estrutura otimizada](estruturas/h5o2_otimizado.xyz) · [Resultado da otimização](resultados/otimizacao/z00_otimizar.out).

<!-- input-source: inputs/z00_otimizar.inp -->
```text
# Dimero protonado isolado; relaxar antes da dinamica.
! XTB2 Opt TightOpt PAL8
%maxcore 256
%geom MaxIter 200 end
* xyz 1 1
O -1.225000  0.000000  0.000000
O  1.225000  0.000000  0.000000
H  0.080000  0.015000 -0.008000
H -1.810000  0.765000  0.010000
H -1.825000 -0.758000 -0.020000
H  1.820000  0.015000  0.763000
H  1.813000 -0.010000 -0.770000
*
```

## 2. Dinâmica: primeiros 2 ps a 300 K

Use a estrutura otimizada. Salve este input como **`z01_dinamica.inp`** e a geometria como **`h5o2_otimizado.xyz`**, na mesma pasta. O checkpoint produzido, **`z01_dinamica.mdrestart`**, será usado na próxima etapa. São 8000 passos de 0,25 fs, sem parede nem força de transferência.

Os índices do laboratório começam em zero: **O 0, O 1 e H 2** formam a unidade O–H–O; H 3–6 são os outros hidrogênios. A carga total é +1 e a multiplicidade é 1.

<!-- input-source: inputs/z01_dinamica.inp -->
```text
# H5O2+ a 300 K: 2 ps, sem solvente, parede ou forca de transferencia.
! MD XTB2 PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "z01_dinamica-traj.xyz"
  Randomize 93201
  Initvel 300_K
  Run 8000
end
* xyzfile 1 1 h5o2_otimizado.xyz
```

### Alternativa com as coordenadas dentro do input

Para copiar tudo em um único arquivo, salve a versão abaixo como **`proton_shared.inp`**. As condições e a geometria são as mesmas; o prefixo de saída muda para `proton_shared`. Se continuar esta execução, ajuste o nome em `Restart` para `proton_shared.mdrestart`. O pacote de continuação fornecido usa o checkpoint da referência `z01_dinamica`.

<!-- input-source: inputs/proton_shared.inp -->
```text
# H5O2+ a 300 K: 2 ps, sem solvente, parede ou forca de transferencia.
! MD XTB2 PAL8
%maxcore 256
%md
  # 8000 passos x 0.25 fs = 2000 fs = 2 ps.
  Timestep 0.25_fs
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "proton_shared-traj.xyz"
  Randomize 93201
  Initvel 300_K
  Run 8000
end
# Carga +1, singlete; sete atomos previamente otimizados.
* xyz 1 1
  O          -1.19345817074522      0.17646804906572      0.17122190484488
  O           1.21572526872885     -0.16865453348367     -0.17845947003107
  H           0.01115351685316      0.00384993107425     -0.00349933898496
  H          -1.65026203146322      0.50127324929764     -0.62030260894495
  H          -1.64922809634862     -0.61740672709059      0.49171722161426
  H           1.67249409653824     -0.49384095241469      0.61293048397896
  H           1.67157541643680      0.62531098355134     -0.49860819247712
*
```

## 3. Continuação: de 2 até 10 ps

Salve o input abaixo como **`z02_02000_10000fs.inp`**. Mantenha junto dele o [checkpoint aos 2 ps](resultados/proton_shared_10ps/etapas/z01_dinamica.mdrestart) e a [geometria aos 2 ps](resultados/proton_shared_10ps/etapas/h5o2_restart_2ps.xyz), ou extraia o [pacote de continuação](aula-proton_restart_10ps.zip). O XYZ sozinho não substitui o checkpoint. Esta etapa acrescenta 8 ps e preserva posições e velocidades; não use `Initvel`.

<!-- input-source: resultados/proton_shared_10ps/etapas/z02_02000_10000fs.inp -->
```text
# H5O2+: continue the retained 2 ps state for 8 ps, reaching 10 ps.
# Same Hamiltonian, integration step, thermostat settings and explicit seed.
# Positions and velocities come from the checkpoint; do not initialize velocities.
! MD XTB2 PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "z02_02000_10000fs-traj.xyz"
  Randomize 93201
  Restart "z01_dinamica.mdrestart"
  Run 32000
end
* xyzfile 1 1 h5o2_restart_2ps.xyz
```

## 4. Executar e abrir os resultados

**Ubuntu / WSL2:**

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca z00_otimizar.inp > z00_otimizar.out
orca z01_dinamica.inp > z01_dinamica.out
orca z02_02000_10000fs.inp > z02_02000_10000fs.out
```

Execute **uma linha por vez**, aguardando o cálculo terminar. Depois da otimização, salve a geometria otimizada `z00_otimizar.xyz` como `h5o2_otimizado.xyz`, ou use a estrutura otimizada fornecida. Antes da terceira linha, deixe o checkpoint e `h5o2_restart_2ps.xyz` na pasta, como explicado na etapa 3. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

Se escolheu a alternativa com coordenadas dentro do input, execute `orca proton_shared.inp > proton_shared.out` no lugar da segunda linha e use seu checkpoint `proton_shared.mdrestart` no `Restart` da terceira etapa.

<details markdown="1"><summary>Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca z00_otimizar.inp > z00_otimizar.out
orca z01_dinamica.inp > z01_dinamica.out
orca z02_02000_10000fs.inp > z02_02000_10000fs.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

Execute um cálculo por vez. A referência completou **2 ps em 123,847 s**; a otimização anterior levou 2,375 s. São tempos observados em ORCA 6.1.1/xTB 6.7.1, WSL2, Intel Core Ultra 9 185H, PAL8 solicitado, e podem mudar em outro computador. Se a espera comprometer o bloco, passe aos dados prontos.

[Observar 10 ps no aplicativo](../../visualizador/index.html?exemplo=proton_shared&aba=trajetoria) · [Baixar os 10 ps completos](resultado-proton_shared_10ps.zip) · [Referência original de 2 ps](../../visualizador/index.html?exemplo=proton_shared_short&aba=trajetoria) · [Baixar os 2 ps originais](resultado-proton_shared.zip)

## 5. Meça e interprete

1. Em **Trajetória**, clique em **Destacar próton H 2**. Ele fica magenta e maior; o restante fica em cinza. O destaque acompanha o mesmo H durante a animação. Em **Destacar átomos/moléculas**, você pode mudar a cor, o tamanho e destacar também O 0 e O 1. Observe o H compartilhado sem usar a velocidade da animação como escala de tempo físico.
2. Em **Geometria**, acompanhe **O 0–H 2** e **O 1–H 2**. Defina δ = r(O 0–H 2) − r(O 1–H 2). δ negativo indica H 2 mais perto de O 0; positivo, mais perto de O 1.
3. Examine 850–1050 fs. Toda mudança de sinal parece uma passagem duradoura? Verifique o que acontece algumas dezenas de fs depois.
4. Compare a temperatura instantânea com o alvo de 300 K. A média dos primeiros 2 ps foi 242,81 K; o alvo não garante temperatura instantânea constante nem equilíbrio térmico em 2 ps.

Uma passagem pelo ponto médio pode ser seguida de retorno. Para reconhecer essa diferença, compare a mudança de sinal de δ com a permanência no novo lado. Dois oxigênios permitem observar compartilhamento e recrossamentos; investigar transporte por uma rede de águas exige um modelo maior.

<details markdown="1"><summary>Conferir cruzamentos e persistência depois da observação</summary>

Para uma persistência mínima τ, cada lado precisa apresentar um episódio contínuo de pelo menos τ com **δ ≤ −0,10 Å** ou **δ ≥ +0,10 Å**. Entrar na faixa central interrompe esse episódio. Contamos mudanças entre lados confirmados sucessivos; a primeira localização e os episódios curtos não contam. Vários episódios confirmados no mesmo lado não acrescentam mudanças.

Nos **2 ps originais** ocorreram **79 cruzamentos de δ = 0**. Exigir afastamento de pelo menos 0,10 Å da região central e permanência muda a contagem: nove mudanças para 20 fs, uma para 50 fs e nenhuma para 100 fs. **Um cruzamento não é uma taxa de reação.** O exemplo mostra compartilhamento e recrossamentos; dois oxigênios não constituem uma rede extensa de transporte de prótons.

Nos **10 ps completos**, H 2 apresentou **432 cruzamentos** de δ = 0. Com o mesmo limiar de 0,10 Å, as contagens para 20, 50 e 100 fs de persistência foram **58, 5 e 0**, respectivamente. A média de temperatura foi **285,11 K**. O maior tempo permite observar mais movimento, sem transformar essas contagens em taxas convergidas.

</details>

Aos 2000 fs, o restart continua posições e velocidades, mas reinicia o gerador aleatório de CSVR e a referência da quantidade conservada. As energias cinética, potencial e total mantêm sua escala física; a fronteira está marcada no gráfico.

<details markdown="1"><summary>Continuação, tempos e leitura dos arquivos</summary>

### Continuar de 2 até 10 ps

Baixe o [pacote de continuação](aula-proton_restart_10ps.zip) e extraia em outra pasta. Ele inclui o checkpoint aos 2 ps, as coordenadas correspondentes e o input de mais 32000 passos de 0,25 fs. O comando `Restart` recupera o estado salvo; o input não contém `Initvel`.

**Ubuntu / WSL2**, na pasta extraída:

```bash
orca z02_02000_10000fs.inp > z02_02000_10000fs.out &
```

**Windows (CMD)**, na pasta extraída:

```bat
orca z02_02000_10000fs.inp > z02_02000_10000fs.out
```

Espere uma execução terminar antes de iniciar outra. A extensão começa aos 2000 fs e termina aos 10000 fs; os arquivos completos para visualização já estão reunidos no pacote de resultado acima.

A continuação levou **493,574 s** nesta máquina, além dos 123,847 s do trecho original. O restart preserva posições, velocidades, passo e tempo; o gerador aleatório do termostato CSVR recomeça e a quantidade conservada tem referência própria em cada etapa. Por isso os gráficos separam a fronteira aos 2000 fs. Não é uma réplica independente nem uma promessa de equivalência bit a bit a uma execução ininterrupta. [Manual ORCA: restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#restarting-simulations).

A referência longa do aplicativo contém todos os **40001 quadros**, espaçados de 0,25 fs; os primeiros 2 ps contêm 8001 quadros. O CSV conserva o tempo impresso pelo ORCA, arredondado a uma casa decimal; para instantes entre quartos de fs, use o comentário do XYZ ou o passo multiplicado por 0,25 fs.

</details>

## Arquivos e consulta

- **10 ps:** [XYZ completo](resultados/proton_shared_10ps/proton_shared_10ps-traj.xyz), [energias e temperatura](resultados/proton_shared_10ps/proton_shared_10ps-md-ener.csv), [etapas e condições](resultados/proton_shared_10ps/curso.json), [saída da continuação](resultados/proton_shared_10ps/etapas/z02_02000_10000fs.out) e [conferência numérica](resultados/proton_shared_10ps/verificacao.json).
**2 ps**, para comparar a janela curta:

- [Saída ORCA](resultados/proton_shared/proton_shared.out) · [Energias](resultados/proton_shared/proton_shared-md-ener.csv) · [Trajetória completa](resultados/proton_shared/proton_shared-traj.xyz).
- [Input original da referência](resultados/proton_shared/proton_shared.inp) · [Registro de execução](resultados/proton_shared/execucao.json).

**Input original executado da referência de 2 ps:** o prefixo de Dump é `z01_dinamica`; preserve esse nome ao reproduzir os arquivos originais.

<!-- input-source: resultados/proton_shared/proton_shared.inp -->
```text
# H5O2+ a 300 K: 2 ps, sem solvente, parede ou forca de transferencia.
! MD XTB2 PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "z01_dinamica-traj.xyz"
  Randomize 93201
  Initvel 300_K
  Run 8000
end
* xyzfile 1 1 h5o2_otimizado.xyz
```


- [Manual ORCA 6.1: dinâmica molecular, timestep e termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Entrega da dupla:** anote um cruzamento com retorno e explique como a conclusão muda ao exigir persistência.
