# 5. Permitir troca de energia com um banho

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**25 min · etanol · 500 fs = 5 × 10⁻¹³ s**

> **Pergunta da atividade:** Controlar a temperatura significa mantê-la constante em cada instante?

## 1. Prepare

Reutilizamos o etanol. A mudança principal é **`Thermostat CSVR 300_K Timecon 100_fs`**. O controle NVE é o resultado do exercício 3.

[Baixar os arquivos da atividade](aula-etanol_csvr.zip) · [Abrir a estrutura](estruturas/etanol.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`etanol_csvr.inp`**; ele já está no pacote.

[Baixar input](inputs/etanol_csvr.inp) · [Baixar pacote com os arquivos necessários](aula-etanol_csvr.zip)

```text
# Mesmo etanol; agora pode trocar energia com um banho.
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "etanol_csvr-traj.xyz"
  # 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 etanol.xyz
```

**Repare nestas escolhas:**

- 300 K é a temperatura do banho; 100 fs regula a resposta do acoplamento.
- K + U pode variar porque o sistema troca energia com o banho.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_csvr.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_csvr.inp > etanol_csvr.out 2>&1
  tail -n 5 etanol_csvr.out
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
  Copy-Item -LiteralPath 'etanol_csvr.inp', 'etanol.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca etanol_csvr.inp > etanol_csvr.out 2>&1
    Get-Content etanol_csvr.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

## 3. Veja e interprete

[Carregar meus arquivos no aplicativo](../../visualizador/index.html) · [Abrir as referências desta atividade](../../visualizador/index.html?exemplo=thermostat)

Na nova pasta de execução, selecione **`etanol_csvr.out`**, **`etanol_csvr-md-ener.csv`** e **`etanol_csvr-traj.xyz`**. Pode carregar os três juntos.

1. Compare **Temperatura** nos casos NVE e CSVR.
2. Observe a resposta ao banho e as flutuações; não espere uma reta em 300 K.
3. Veja E. Por que uma variação em NVT, sozinha, não demonstra erro de integração?

> **Para levar:** Esta trajetória curta mostra uma resposta transitória; não comprova equilíbrio.

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Resultados reais já calculados com PAL8. O input completo de cada referência está ao lado da saída; as séries não foram substituídas por simulações novas.

- **etanol_csvr:** [input completo usado](resultados/etanol_csvr/etanol_csvr.inp) · [saída](resultados/etanol_csvr/etanol_csvr.out) · [energias](resultados/etanol_csvr/etanol_csvr-md-ener.csv) · [trajetória](resultados/etanol_csvr/etanol_csvr-traj.xyz).

[Consultar preparação, números e respostas](apoio.md).

</details>

**Manual:** [Termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta trajetória ainda não permite.
