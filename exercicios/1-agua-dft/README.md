# 01 · Uma ligação H em movimento

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**25 min · duas águas · 6 átomos · XTB2 · execução da aula: 2 ps · referência ampliada: 5 ps**

> **Pergunta:** As duas águas permanecem doadora e aceptora durante toda a dinâmica?

## 1. Prepare o par de moléculas

Uma água começa como doadora da ligação H. Vamos observar a reorientação: **uma água pode passar de doadora a aceptora da ligação H?** A estrutura já foi relaxada com B97-3c; a otimização é fornecida, não precisa ser repetida na aula.

Vamos executar **2 ps = 2 × 10⁻¹² s** com XTB2, sem termostato. Essa execução original levou **56,5 s nesta máquina**. A geometria inicial é a mesma da comparação DFT fornecida; não é apresentada como um mínimo de XTB2. Este dímero isolado não representa água líquida.

O laboratório abre a **referência ampliada de 5 ps**: os 2 ps originais seguidos por mais 3 ps a partir do checkpoint, preservando posições, velocidades, timestep de 0,5 fs e NVE. São **10001 quadros originais**, sem interpolação ou redução. O protocolo curto de 2 ps abaixo permanece disponível para a execução em aula; a referência de 2 ps continua disponível separadamente.

A continuação levou **91,1 s nesta máquina**, além dos 56,5 s originais. Nos 5 ps completos, O···O varia de **2,617 a 3,511 Å** e a amplitude de Etotal é **0,260 kJ/mol**. Cada H permanece associado à sua água no acompanhamento pelo O mais próximo.

## 2. Execute

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

## 3. Observe, meça, explique

[Abrir referência de 5 ps em 3D](../../visualizador/index.html?exemplo=water&aba=trajetoria) · [Abrir os 2 ps originais](../../visualizador/index.html?exemplo=water_short&aba=trajetoria)

1. Ative **Ligações H**. O traço descontínuo indica um contato que passa pelo critério geométrico do visualizador; não é uma ligação covalente adicional.
2. Em **Geometria**, compare **O 0–H 1**, **H 1···O 3** e **O 0···O 3**. Acrescente o ângulo **0–1–3** (D–H···A).
3. Em **Energia**, mostre K, U e E. Alongar/comprimir as ligações modifica U; o movimento altera K. A energia total deve variar pouco neste caso sem banho.
4. Avance pelos primeiros 50 fs e depois por toda a trajetória. Identifique qual O doa H e qual aceita. Meça também os contatos partindo dos H 4 e 5 da segunda água.

**Nos 2 ps originais XTB2:** O···O varia de **2,633 a 3,511 Å**; as quatro ligações covalentes O–H permanecem entre **0,914 e 1,020 Å**. O 0 começa como doador; perto de 50 fs, o O 3 aparece como doador. Há outras alternâncias ao longo dos 2 ps. Essas faixas descrevem o trecho original; use a extensão para investigar se a faixa observada aumenta quando a janela chega a 5 ps.

**Interpretação:** as moléculas giram e reorganizam o contato intermolecular. A troca de doador/aceptor **não é transferência de próton**: cada H continua ligado à sua água. O desaparecimento do traço H ao cruzar um corte geométrico não prova dissociação irreversível.

Na análise dos 2 ps originais, o critério operacional foi H···O < 2,4 Å e O–H···O > 130°. Os cortes ajustáveis do visualizador podem deslocar o instante em que o traço aparece. A amplitude de Etotal nesse trecho foi **0,194 kJ/mol**; examine a curva inteira, não apenas a diferença entre início e fim. Em NVE, a temperatura instantânea deste sistema de seis átomos pode variar bastante. A referência ampliada identifica o restart em 2000 fs e mantém os valores físicos originais de energia e temperatura.

**Limite:** uma única trajetória não fornece populações de equilíbrio ou taxas de troca. O tempo medido de **56,5 s** não é garantia para outros computadores. Se ultrapassar **2 min durante a aula**, abra a referência e continue a análise.

<details markdown="1"><summary>Comparação DFT já calculada</summary>

Não execute DFT durante a aula. A referência curta B97-3c simulou **60 fs** em **275,5 s** nesta máquina; ela permite comparar a geometria e o custo com XTB2. Compare apenas a janela comum de 0–60 fs. XTB2 usa uma aproximação diferente para a energia eletrônica; trajetórias mais longas não demonstram maior precisão.

[Abrir DFT em 3D](../../visualizador/index.html?exemplo=water_dft&aba=trajetoria) · [Baixar input ORCA](inputs/dimero_b97.inp) · [Baixar geometria inicial (.xyz)](estruturas/dimero_b97.xyz) (opcional para executar; as coordenadas já estão no input) · [Pacote DFT, para estudo posterior](aula-dimero_b97.zip).

</details>

<details markdown="1"><summary>E a molécula de água isolada?</summary>

Ela continua como [referência adicional já calculada](../../visualizador/index.html?exemplo=water_single): mede-se O–H e H–O–H e observa-se a troca K/U. É útil para distinguir vibração de otimização. **Não há ligação H intermolecular, solvente explícito, conformação interna complexa ou reação neste modelo.** Os 20 fs originais não servem para extrair um espectro vibracional confiável. Por isso ela saiu do percurso principal.

[Pacote antigo](aula-agua_dft.zip) · [Resultados e preparação anteriores](apoio.md).

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
