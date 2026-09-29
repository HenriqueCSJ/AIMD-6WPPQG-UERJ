# 1. Uma ligação de hidrogênio em movimento

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**20 min · duas águas · 6 átomos · DFT / B97-3c**

> **Pergunta:** O que muda mais: uma ligação O–H ou o contato entre duas águas?

## 1. Prepare o par de moléculas

Uma água doa H para a outra. Agora há uma pergunta intermolecular: **o contato O–H···O respira e muda de direção?** A estrutura já foi relaxada com B97-3c; a otimização é fornecida, não precisa ser repetida na aula.

Vamos acompanhar **60 fs = 0,060 ps = 6 × 10⁻¹⁴ s**, sem termostato. É uma observação curta de geometria e energia, não uma amostra de água líquida.

## 2. Execute

[Baixar pacote](aula-dimero_b97.zip) · [Input](inputs/dimero_b97.inp) · [Estrutura](estruturas/dimero_b97.xyz)

```text
# Exemplo didatico; oito processos solicitados.
! MD B97-3c TightSCF PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "dimero_b97-traj.xyz"
  Timestep 0.5_fs
  Thermostat None
  # 60 fs: observar vibracao e geometria da ligacao H.
  Run 120
end
* xyzfile 0 1 dimero_b97.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Extraia o pacote e abra o Ubuntu nessa pasta. Com `ORCA_DIR` configurado no guia, copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR primeiro."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp dimero_b97.inp dimero_b97.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" dimero_b97.inp > dimero_b97.out 2>&1
  tail -n 12 dimero_b97.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` e localize a pasta `execucao-…`. Carregue **`dimero_b97.out`**, **`dimero_b97-md-ener.csv`** e **`dimero_b97-traj.xyz`** no laboratório. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Extraia o pacote em uma pasta nova. Abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' dimero_b97.inp > dimero_b97.out 2>&1
Get-Content dimero_b97.out -Tail 12
```

</details>

## 3. Observe, meça, explique

[Abrir referência em 3D](../../visualizador/index.html?exemplo=water&aba=trajetoria)

1. Ative **Ligações H**. O traço descontínuo indica um contato que passa pelo critério geométrico do visualizador; não é uma ligação covalente adicional.
2. Em **Geometria**, compare **O 0–H 1**, **H 1···O 3** e **O 0···O 3**. Acrescente o ângulo **0–1–3** (D–H···A).
3. Em **Energia**, mostre K, U e E. Alongar/comprimir as ligações modifica U; o movimento altera K. A energia total deve variar pouco neste caso sem banho.

**Nesta referência:** O 0···O 3 varia de **2.949 a 2.987 Å**; H 1···O 3, de **1.993 a 2.674 Å**; o ângulo 0–1–3, de **97.1° a 178.7°**. Compare com a faixa da ligação covalente O 0–H 1: **0.959–0.979 Å**.

**Interpretação:** uma ligação H tem distância e orientação variáveis. O desenho tracejado ajuda a localizar o contato; são as medidas que mostram o movimento. Ele pode desaparecer ao cruzar um corte do visualizador, sem que isso prove um evento de dissociação.

**Limite:** 60 fs não fornecem tempo de vida, constante de equilíbrio, espectro convergido ou taxa de troca de moléculas. A duração computacional medida foi **275.6 s** com PAL8 nesta máquina; se ultrapassar 5 min no computador do aluno, use a referência.

<details markdown="1"><summary>E a molécula de água isolada?</summary>

Ela continua como [aquecimento opcional](../../visualizador/index.html?exemplo=water_single): mede-se O–H e H–O–H e observa-se a troca K/U. É útil para aprender a executar e distinguir vibração de otimização. **Não há ligação H intermolecular, solvente explícito, conformação interna complexa ou reação neste modelo.** Os 20 fs originais não servem para extrair um espectro vibracional confiável. Por isso ela saiu do percurso principal.

[Pacote antigo](aula-agua_dft.zip) · [Resultados e preparação anteriores](apoio.md).

</details>

## Resultados e manual

- **dimero_b97:** [saída](resultados/dimero_b97/dimero_b97.out) · [input usado](resultados/dimero_b97/dimero_b97.inp) · [energias](resultados/dimero_b97/dimero_b97-md-ener.csv) · [trajetória](resultados/dimero_b97/dimero_b97-traj.xyz) · [tempo de execução](resultados/dimero_b97/execucao.json).

[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

[Preparação do dímero](resultados/preparar_dimero_b97/preparar_dimero_b97.out). Geometria convergida na otimização; não foi feita análise de frequências.

Método: [B97-3c no manual do ORCA](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/3cmethods.html).
