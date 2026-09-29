# 7. Acompanhar o complexo e o confinamento

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**35 min · 43 átomos · XTB2/ALPB**

> **Pergunta da atividade:** O que as distâncias mostram, além da animação?

## 1. Prepare

O pacote inclui a estrutura e o **reinício comum**, já preparado. Acrescentaremos **500 fs = 0,5 ps = 5 × 10⁻¹³ s**. O relógio continua de 100 até 600 fs. Execute o caso com parede; o controle sem parede já está disponível.

[Baixar os arquivos da atividade](aula-zn_parede.zip) · [Abrir a estrutura](estruturas/zn_solvato.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`zn_parede.inp`**; ele já está no pacote.

[Baixar input](inputs/zn_parede.inp) · [Baixar pacote com os arquivos necessários](aula-zn_parede.zip)

```text
# Complexo com XTB2/ALPB; PAL8 = 8 threads do xTB.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  # Parede suave: centro (0,0,0), raio 6 A.
  Walls Sphere 0, 0, 0, 6.0_A Spring 10.0
  # Retoma posicoes, velocidades e relogio fornecidos.
  Restart "preparacao_termica.mdrestart"
  Dump Position Stride 1 Filename "zn_parede-traj.xyz"
  # Novo trecho: 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvato.xyz
```

**Repare nestas escolhas:**

- `Walls Sphere` acrescenta uma parede suave de raio 6 Å, centrada na origem.
- `Restart` retoma posições e velocidades. Não inicializamos velocidades novas.
- As distâncias serão medidas no aplicativo: **nenhuma lista de Colvars é necessária**.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp zn_parede.inp zn_solvato.xyz preparacao_termica.mdrestart "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" zn_parede.inp > zn_parede.out 2>&1
  tail -n 5 zn_parede.out
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
  Copy-Item -LiteralPath 'zn_parede.inp', 'zn_solvato.xyz', 'preparacao_termica.mdrestart' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca zn_parede.inp > zn_parede.out 2>&1
    Get-Content zn_parede.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

## 3. Veja e interprete

[Carregar meus arquivos no aplicativo](../../visualizador/index.html) · [Abrir as referências desta atividade](../../visualizador/index.html?exemplo=complex)

Na nova pasta de execução, selecione **`zn_parede.out`**, **`zn_parede-md-ener.csv`** e **`zn_parede-traj.xyz`**. Pode carregar os três juntos.

1. Carregue `.out`, `*-md-ener.csv` e `*-traj.xyz`. Veja a trajetória e T.
2. Em **Distâncias**, comece por **Zn(0)–N(1)** e **Zn(0)–N(4)**. Depois compare **Zn(0)–O(13)** e **Zn(0)–O(25)**.
3. Abra a referência com/sem parede. O afastamento do solvente muda? A parede impede toda ultrapassagem do raio?

> **Para levar:** Uma distância observada por 0,5 ps não determina estabilidade termodinâmica nem ausência de reação em tempos maiores.

<details markdown="1"><summary>Opcional: executar o controle sem parede</summary>

Este input retoma o mesmo estado inicial e remove apenas o confinamento. Use uma execução separada; compare com o resultado fornecido se o tempo da aula for curto.

[Baixar input](inputs/zn_sem_parede.inp) · [Baixar pacote com os arquivos necessários](aula-zn_sem_parede.zip)

```text
# Controle: mesmo estado inicial, agora sem parede.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  # Retoma posicoes, velocidades e relogio fornecidos.
  Restart "preparacao_termica.mdrestart"
  Dump Position Stride 1 Filename "zn_sem_parede-traj.xyz"
  # Novo trecho: 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvato.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp zn_sem_parede.inp zn_solvato.xyz preparacao_termica.mdrestart "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" zn_sem_parede.inp > zn_sem_parede.out 2>&1
  tail -n 5 zn_sem_parede.out
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
  Copy-Item -LiteralPath 'zn_sem_parede.inp', 'zn_solvato.xyz', 'preparacao_termica.mdrestart' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca zn_sem_parede.inp > zn_sem_parede.out 2>&1
    Get-Content zn_sem_parede.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

</details>

Os índices começam em zero. O primeiro quadro XYZ é 100,5 fs, enquanto o CSV inclui 100 fs; o aplicativo alinha pelo tempo. `Walls` é a grafia usada no ORCA 6.1.1; o manual ainda reúne essa opção na seção `Cell`.

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Resultados reais já calculados com PAL8. O input completo de cada referência está ao lado da saída; as séries não foram substituídas por simulações novas.

- **zn_parede:** [input completo usado](resultados/zn_parede/zn_parede.inp) · [saída](resultados/zn_parede/zn_parede.out) · [energias](resultados/zn_parede/zn_parede-md-ener.csv) · [trajetória](resultados/zn_parede/zn_parede-traj.xyz).
- **zn_sem_parede:** [input completo usado](resultados/zn_sem_parede/zn_sem_parede.inp) · [saída](resultados/zn_sem_parede/zn_sem_parede.out) · [energias](resultados/zn_sem_parede/zn_sem_parede-md-ener.csv) · [trajetória](resultados/zn_sem_parede/zn_sem_parede-traj.xyz).

[Consultar preparação, números e respostas](apoio.md).

</details>

**Manual:** [Paredes de MD (seção Cell no manual)](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell) · [Reinício](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#restart).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta trajetória ainda não permite.
