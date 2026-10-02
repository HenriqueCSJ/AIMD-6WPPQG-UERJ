# 05 · H₅O₂⁺: onde está o próton?

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Núcleo da aula · 20 min · executar ou abrir o resultado pronto · 7 átomos**

> **Pergunta:** quando um H muda de proximidade entre dois O, ele permaneceu no novo lado ou voltou logo depois?

No dímero neutro da abertura, as águas mudam a orientação da ligação H e preservam suas ligações O–H covalentes. Aqui, o dímero protonado H₅O₂⁺ permite acompanhar o H compartilhado. Usamos GFN2-xTB, um método semiempírico de estrutura eletrônica, com núcleos clássicos. Não há solvente implícito, parede ou força aplicada para transferir o H.

**Para observar com calma:** o laboratório abre a referência completa de **10 ps**, com **40001 quadros**. Um ciclo de reprodução começa em **60 s**; escolha **120 s** em **Duração a 1×**, ou reduza **Velocidade**, para acompanhar cada passagem por mais tempo. Esses controles não alteram o tempo físico.

O input curto abaixo permite executar os primeiros **2 ps** durante a aula. A referência longa preserva esses mesmos 2 ps e acrescenta **8 ps por restart**, sem reinicializar posições ou velocidades.

## 1. Prepare

[Pacote para executar](aula-proton_shared.zip) · [Baixar input ORCA](inputs/proton_shared.inp) · [Baixar geometria inicial (.xyz)](estruturas/h5o2_otimizado.xyz) (opcional para executar; as coordenadas já estão no input)

Extraia o pacote numa pasta nova. Os índices do aplicativo começam em **zero**: **O 0, O 1 e H 2** compõem a unidade O–H–O; H 3–6 são os demais hidrogênios. A carga total é +1 e a multiplicidade é 1.

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

## 2. Execute ou use a referência

**Ubuntu / WSL2:**

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca proton_shared.inp > proton_shared.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

<details markdown="1"><summary>Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca proton_shared.inp > proton_shared.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

Execute um cálculo por vez. A referência completou **2 ps em 123,847 s**; a otimização anterior levou 2,375 s. São tempos observados em ORCA 6.1.1/xTB 6.7.1, WSL2, Intel Core Ultra 9 185H, PAL8 solicitado, e podem mudar em outro computador. Se a espera comprometer o bloco, passe aos dados prontos.

[Observar 10 ps no aplicativo](../../visualizador/index.html?exemplo=proton_shared&aba=trajetoria) · [Baixar os 10 ps completos](resultado-proton_shared_10ps.zip) · [Referência original de 2 ps](../../visualizador/index.html?exemplo=proton_shared_short&aba=trajetoria) · [Baixar os 2 ps originais](resultado-proton_shared.zip)

## 3. Meça e interprete

1. Em **Trajetória**, clique em **Destacar próton H 2**. Ele fica magenta e maior; o restante fica em cinza. O destaque acompanha o mesmo H durante a animação. Em **Destacar átomos/moléculas**, você pode mudar a cor, o tamanho e destacar também O 0 e O 1. Observe o H compartilhado sem usar a velocidade da animação como escala de tempo físico.
2. Em **Geometria**, acompanhe **O 0–H 2** e **O 1–H 2**. Defina δ = r(O 0–H 2) − r(O 1–H 2). δ negativo indica H 2 mais perto de O 0; positivo, mais perto de O 1.
3. Examine 850–1050 fs. Toda mudança de sinal parece uma passagem duradoura? Verifique o que acontece algumas dezenas de fs depois.
4. Compare a temperatura instantânea com o alvo de 300 K. A média dos primeiros 2 ps foi 242,81 K; o alvo não garante temperatura instantânea constante nem equilíbrio térmico em 2 ps.

Uma passagem pelo ponto médio pode ser seguida de retorno. Para reconhecer essa diferença, compare a mudança de sinal de δ com a permanência no novo lado. Dois oxigênios permitem observar compartilhamento e recrossamentos; investigar transporte por uma rede de águas exige um modelo maior.

<details markdown="1"><summary>Conferir cruzamentos e persistência depois da observação</summary>

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
- [Baixar input ORCA](inputs/z00_otimizar.inp) · [Baixar geometria inicial (.xyz)](estruturas/h5o2_inicial.xyz) (opcional para executar; as coordenadas já estão no input) · [Saída da otimização](resultados/otimizacao/z00_otimizar.out).
- [Manual ORCA 6.1: dinâmica molecular, timestep e termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Entrega da dupla:** anote um cruzamento com retorno e explique como a conclusão muda ao exigir persistência.

## Inputs das variantes e preparações

- **z01_dinamica — etapa após a otimização; usa a geometria otimizada:** [Baixar input ORCA](inputs/z01_dinamica.inp) · [Baixar geometria inicial (.xyz)](estruturas/h5o2_otimizado.xyz) (obrigatório; manter na mesma pasta do input).

**Continuação de 2 até 10 ps:** [Baixar input ORCA](resultados/proton_shared_10ps/etapas/z02_02000_10000fs.inp) · [Baixar geometria inicial (.xyz)](resultados/proton_shared_10ps/etapas/h5o2_restart_2ps.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](resultados/proton_shared_10ps/etapas/z01_dinamica.mdrestart) (fornece o estado de continuação; manter junto do input). O XYZ isolado não substitui o checkpoint.
