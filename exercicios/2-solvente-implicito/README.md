# 2. Ativar o solvente com uma palavra

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**10 min · a mesma água · 20 fs = 2 × 10⁻¹⁴ s**

> **Pergunta da atividade:** Se ativamos água como solvente, onde estão suas moléculas?

## 1. Prepare

Usamos a mesma geometria e as mesmas condições do exercício 1. A mudança é **`CPCM(water)` na primeira linha**.

[Baixar os arquivos da atividade](aula-agua_cpcm.zip) · [Abrir a estrutura](estruturas/agua.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`agua_cpcm.inp`**; ele já está no pacote.

[Baixar input](inputs/agua_cpcm.inp) · [Baixar pacote com os arquivos necessários](aula-agua_cpcm.zip)

```text
# Mesmo teste de agua; CPCM acrescenta o solvente continuo.
! MD BLYP def2-SVP TightSCF CPCM(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "agua_cpcm-traj.xyz"
  # 40 x 0.5 fs = 20 fs (2e-14 s).
  Run 40
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 agua.xyz
```

**Repare nestas escolhas:**

- `CPCM(water)` muda o ambiente eletrônico sem acrescentar átomos.
- A semente, o timestep e o número de passos permanecem iguais.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp agua_cpcm.inp agua.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" agua_cpcm.inp > agua_cpcm.out 2>&1
  tail -n 5 agua_cpcm.out
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
  Copy-Item -LiteralPath 'agua_cpcm.inp', 'agua.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca agua_cpcm.inp > agua_cpcm.out 2>&1
    Get-Content agua_cpcm.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

## 3. Veja e interprete

[Carregar meus arquivos no aplicativo](../../visualizador/index.html) · [Abrir as referências desta atividade](../../visualizador/index.html?exemplo=solvent)

Na nova pasta de execução, selecione **`agua_cpcm.out`**, **`agua_cpcm-md-ener.csv`** e **`agua_cpcm-traj.xyz`**. Pode carregar os três juntos.

1. Carregue também o resultado do exercício 1 para comparar.
2. Na trajetória, conte os átomos: continuam sendo três.
3. Observe as energias. Por que subtrair dois valores instantâneos não dá uma energia livre de solvatação?

> **Para levar:** Solvente implícito, termostato e parede têm funções diferentes.

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Resultados reais já calculados com PAL8. O input completo de cada referência está ao lado da saída; as séries não foram substituídas por simulações novas.

- **agua_cpcm:** [input completo usado](resultados/agua_cpcm/agua_cpcm.inp) · [saída](resultados/agua_cpcm/agua_cpcm.out) · [energias](resultados/agua_cpcm/agua_cpcm-md-ener.csv) · [trajetória](resultados/agua_cpcm/agua_cpcm-traj.xyz).

[Consultar preparação, números e respostas](apoio.md).

</details>

**Manual:** [Modelos de solvatação](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/solvationmodels.html).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta trajetória ainda não permite.
