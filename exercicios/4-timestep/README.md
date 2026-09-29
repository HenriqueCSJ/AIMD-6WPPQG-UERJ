# 4. Testar um passo grande demais

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**25 min · etanol · o mesmo tempo físico**

> **Pergunta da atividade:** Terminar normalmente significa que o timestep foi adequado?

## 1. Prepare

Vamos usar **2 fs por passo**, de propósito. Para manter os mesmos **500 fs = 5 × 10⁻¹³ s**, reduzimos `Run` para 250. Compare com os 0,5 fs do exercício 3.

[Baixar os arquivos da atividade](aula-etanol_dt200.zip) · [Abrir a estrutura](estruturas/etanol.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`etanol_dt200.inp`**; ele já está no pacote.

[Baixar input](inputs/etanol_dt200.inp) · [Baixar pacote com os arquivos necessários](aula-etanol_dt200.zip)

```text
# Passo grande de proposito: observe o erro de integracao.
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 2.0_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "etanol_dt200-traj.xyz"
  # 250 x 2 fs = 500 fs (5e-13 s).
  Run 250
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 etanol.xyz
```

**Repare nestas escolhas:**

- Mude timestep e número de passos juntos: **2 × 250 = 0,5 × 1000 = 500 fs**.
- O sistema e a inicialização são os mesmos; o teste é da integração.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_dt200.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_dt200.inp > etanol_dt200.out 2>&1
  tail -n 5 etanol_dt200.out
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
  Copy-Item -LiteralPath 'etanol_dt200.inp', 'etanol.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca etanol_dt200.inp > etanol_dt200.out 2>&1
    Get-Content etanol_dt200.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

## 3. Veja e interprete

[Carregar meus arquivos no aplicativo](../../visualizador/index.html) · [Abrir as referências desta atividade](../../visualizador/index.html?exemplo=timestep)

Na nova pasta de execução, selecione **`etanol_dt200.out`**, **`etanol_dt200-md-ener.csv`** e **`etanol_dt200-traj.xyz`**. Pode carregar os três juntos.

1. Compare as referências de 0,25, 0,5 e 2 fs no aplicativo.
2. Selecione **Total · E** e **Variação desde o início**. Qual curva oscila mais?
3. Compare a amplitude de E. Depois veja o custo de usar um passo menor.

> **Para levar:** Escolha o timestep pela qualidade da integração, não apenas pelo término normal.

<details markdown="1"><summary>Opcional: repetir com passo menor</summary>

O caso de 0,25 fs usa 2.000 passos para manter os mesmos 500 fs. Durante a aula, você pode apenas abrir sua referência.

[Baixar input](inputs/etanol_dt025.inp) · [Baixar pacote com os arquivos necessários](aula-etanol_dt025.zip)

```text
# Passo menor: compare com o mesmo tempo fisico de NVE.
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 0.25_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "etanol_dt025-traj.xyz"
  # 2000 x 0.25 fs = 500 fs (5e-13 s).
  Run 2000
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 etanol.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_dt025.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_dt025.inp > etanol_dt025.out 2>&1
  tail -n 5 etanol_dt025.out
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
  Copy-Item -LiteralPath 'etanol_dt025.inp', 'etanol.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca etanol_dt025.inp > etanol_dt025.out 2>&1
    Get-Content etanol_dt025.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

</details>

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Resultados reais já calculados com PAL8. O input completo de cada referência está ao lado da saída; as séries não foram substituídas por simulações novas.

- **etanol_dt200:** [input completo usado](resultados/etanol_dt200/etanol_dt200.inp) · [saída](resultados/etanol_dt200/etanol_dt200.out) · [energias](resultados/etanol_dt200/etanol_dt200-md-ener.csv) · [trajetória](resultados/etanol_dt200/etanol_dt200-traj.xyz).
- **etanol_dt025:** [input completo usado](resultados/etanol_dt025/etanol_dt025.inp) · [saída](resultados/etanol_dt025/etanol_dt025.out) · [energias](resultados/etanol_dt025/etanol_dt025-md-ener.csv) · [trajetória](resultados/etanol_dt025/etanol_dt025-traj.xyz).

[Consultar preparação, números e respostas](apoio.md).

</details>

**Manual:** [Timestep](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#timestep).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta trajetória ainda não permite.
