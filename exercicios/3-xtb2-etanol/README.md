# 3. Ganhar velocidade com XTB2

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**25 min · 9 átomos · NVE**

> **Pergunta da atividade:** O que muda quando trocamos o método eletrônico?

## 1. Prepare

O etanol já está otimizado. Com **XTB2 (GFN2-xTB)**, faremos **500 fs = 0,5 ps = 5 × 10⁻¹³ s**. Guarde este resultado: ele será o controle dos exercícios 4 e 5.

[Baixar os arquivos da atividade](aula-etanol_nve.zip) · [Abrir a estrutura](estruturas/etanol.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`etanol_nve.inp`**; ele já está no pacote.

[Baixar input](inputs/etanol_nve.inp) · [Baixar pacote com os arquivos necessários](aula-etanol_nve.zip)

```text
# Etanol com GFN2-xTB, sem banho termico (NVE).
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "etanol_nve-traj.xyz"
  # 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 etanol.xyz
```

**Repare nestas escolhas:**

- `XTB2` escolhe o método eletrônico; o bloco `%md` mantém a lógica conhecida.
- `Run 1000` com passo de 0,5 fs cobre 500 fs.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_nve.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_nve.inp > etanol_nve.out 2>&1
  tail -n 5 etanol_nve.out
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
  Copy-Item -LiteralPath 'etanol_nve.inp', 'etanol.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca etanol_nve.inp > etanol_nve.out 2>&1
    Get-Content etanol_nve.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

## 3. Veja e interprete

[Carregar meus arquivos no aplicativo](../../visualizador/index.html) · [Abrir as referências desta atividade](../../visualizador/index.html?exemplo=ethanol)

Na nova pasta de execução, selecione **`etanol_nve.out`**, **`etanol_nve-md-ener.csv`** e **`etanol_nve-traj.xyz`**. Pode carregar os três juntos.

1. Veja K, U e E. A energia total oscila menos que as outras duas?
2. Observe vibrações e mudanças de orientação na animação.
3. Anote a amplitude de E e o tempo físico. Guarde os arquivos para comparar depois.

> **Para levar:** O ciclo energia → forças → movimento continua; o método eletrônico e o custo mudam.

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Resultados reais já calculados com PAL8. O input completo de cada referência está ao lado da saída; as séries não foram substituídas por simulações novas.

- **etanol_nve:** [input completo usado](resultados/etanol_nve/etanol_nve.inp) · [saída](resultados/etanol_nve/etanol_nve.out) · [energias](resultados/etanol_nve/etanol_nve-md-ener.csv) · [trajetória](resultados/etanol_nve/etanol_nve-traj.xyz).

[Consultar preparação, números e respostas](apoio.md).

</details>

**Manual:** [XTB2](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html) · [Dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta trajetória ainda não permite.
