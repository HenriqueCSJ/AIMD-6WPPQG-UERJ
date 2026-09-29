# 1. Uma molécula de água em movimento

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**20 min · 3 átomos · carga 0 · singlete**

> **Pergunta da atividade:** Como posições e velocidades se transformam em uma trajetória?

## 1. Prepare

A água já está otimizada com BLYP/def2-SVP. Vamos simular apenas **20 fs = 2 × 10⁻¹⁴ s**; o objetivo é entender o ciclo da dinâmica.

[Baixar os arquivos da atividade](aula-agua_dft.zip) · [Abrir a estrutura](estruturas/agua.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`agua_dft.inp`**; ele já está no pacote.

[Baixar input](inputs/agua_dft.inp) · [Baixar pacote com os arquivos necessários](aula-agua_dft.zip)

```text
# Agua com DFT, sem banho termico (NVE); PAL8 = 8 processos.
! MD BLYP def2-SVP TightSCF PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "agua_dft-traj.xyz"
  # 40 x 0.5 fs = 20 fs (2e-14 s).
  Run 40
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 agua.xyz
```

**Repare nestas escolhas:**

- `Timestep` define o avanço do relógio; `Run` define quantos passos dar.
- `Initvel` cria velocidades iniciais. `Thermostat None` deixa o sistema sem banho térmico.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp agua_dft.inp agua.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" agua_dft.inp > agua_dft.out 2>&1
  tail -n 5 agua_dft.out
  echo "Resultados: $PWD"
)
```

Procure **`ORCA TERMINATED NORMALLY`**. Abra `explorer.exe .` para localizar a nova pasta `execucao-…` e carregar os arquivos no aplicativo. Execute um cálculo por vez; o ORCA gerencia o paralelismo de `PAL8`.

</details>

<details markdown="1"><summary>Alternativa: executar no Windows nativo</summary>

Extraia o pacote, abra o PowerShell nessa pasta e ajuste o caminho do ORCA. Esta rota exige ORCA/MS-MPI já testados na instalação.

```powershell
& {
  $orca = 'C:\ORCA_6.1.1\orca.exe'
  if (-not (Test-Path -LiteralPath $orca)) { throw 'Ajuste o caminho do ORCA.' }
  $pasta = Join-Path $PWD ('execucao-' + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $pasta | Out-Null
  Copy-Item -LiteralPath 'agua_dft.inp', 'agua.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca agua_dft.inp > agua_dft.out 2>&1
    Get-Content agua_dft.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

## 3. Veja e interprete

[Carregar meus arquivos no aplicativo](../../visualizador/index.html) · [Abrir as referências desta atividade](../../visualizador/index.html?exemplo=water)

Na nova pasta de execução, selecione **`agua_dft.out`**, **`agua_dft-md-ener.csv`** e **`agua_dft-traj.xyz`**. Pode carregar os três juntos.

1. Em **Energia e temperatura**, marque K, U e E. Quando K diminui, o que acontece com U?
2. Em **Trajetória**, reproduza o movimento. O que vibra?
3. A temperatura fica em 300 K? Diferencie inicialização de controle de temperatura.

> **Para levar:** O ORCA calcula as forças e avança as posições; não otimiza a molécula a cada passo.

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Resultados reais já calculados com PAL8. O input completo de cada referência está ao lado da saída; as séries não foram substituídas por simulações novas.

- **agua_dft:** [input completo usado](resultados/agua_dft/agua_dft.inp) · [saída](resultados/agua_dft/agua_dft.out) · [energias](resultados/agua_dft/agua_dft-md-ener.csv) · [trajetória](resultados/agua_dft/agua_dft-traj.xyz).

[Consultar preparação, números e respostas](apoio.md).

</details>

**Manual:** [Dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html) · [Velocidades iniciais](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#initvel).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta trajetória ainda não permite.
