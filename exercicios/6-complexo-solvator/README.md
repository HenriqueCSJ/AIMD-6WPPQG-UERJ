# 6. Construir o ambiente com SOLVATOR

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**30 min · Zn²⁺–etilenodiamina · carga +2 · singlete**

> **Pergunta da atividade:** Como acrescentar águas explícitas a um complexo já preparado?

Para observar a formação da primeira camada de águas, abra também [Zn, águas e en inicialmente afastados](../7-dinamica-complexo/hidratacao.html). O SOLVATOR desta atividade parte de um complexo preparado; não mostra sua formação por dinâmica.

## 1. Prepare

O ponto de partida tem Zn, etilenodiamina e quatro águas: **25 átomos**. O SOLVATOR acrescentará seis águas, chegando a **43 átomos**. O banho contínuo ALPB permanece.

[Baixar os arquivos da atividade](aula-zn_solvator.zip) · [Abrir a estrutura](estruturas/zn_en.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`zn_solvator.inp`**; ele já está no pacote.

[Baixar input](inputs/zn_solvator.inp) · [Baixar pacote com os arquivos necessários](aula-zn_solvator.zip)

```text
# SOLVATOR: acrescenta aguas explicitas ao complexo.
! XTB2 ALPB(water) PAL8
%maxcore 256

%solvator
  # Numero de novas aguas; o soluto fica fixo na montagem.
  nsolv 6
  clustermode docking
  fixsolute true
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_en.xyz
```

**Repare nestas escolhas:**

- `nsolv 6` significa seis águas novas, além das quatro já presentes.
- `fixsolute true` mantém o conjunto inicial fixo durante a montagem.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp zn_solvator.inp zn_en.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" zn_solvator.inp > zn_solvator.out 2>&1
  tail -n 5 zn_solvator.out
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
  Copy-Item -LiteralPath 'zn_solvator.inp', 'zn_en.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca zn_solvator.inp > zn_solvator.out 2>&1
    Get-Content zn_solvator.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

## 3. Veja e interprete

Ative **Coordenação** e **Ligações H** no visualizador. Identifique os dois N da etilenodiamina ligados geometricamente ao Zn e compare águas próximas do metal com as acrescentadas ao redor. **SOLVATOR constrói um arranjo de solvatação**; não é uma trajetória de associação do ligante nem demonstra uma constante de formação. O exercício seguinte pergunta se essa camada externa permanece por perto.


[Carregar meus arquivos no aplicativo](../../visualizador/index.html) · [Abrir as referências desta atividade](../../visualizador/index.html?exemplo=solvator)

1. Carregue `zn_solvator.out` e **`zn_solvator.solvator.xyz`** no aplicativo.
2. Na aba **Trajetória**, compare as estruturas antes e depois. O número de átomos mudou como esperado?
3. As seis novas águas estão todas coordenadas ao Zn? Inspecione as posições e distâncias.

> **Para levar:** SOLVATOR constrói uma estrutura candidata. Seu histórico de montagem não é uma trajetória de MD.

<details markdown="1"><summary>Opcional: montagem mais curta</summary>

Troque seis por duas águas para praticar em menos tempo: o resultado tem 31 átomos. Execute somente uma versão. No exercício 7 todos usarão o sistema fornecido de 43 átomos.

[Baixar input](inputs/zn_solvator_2aguas.inp) · [Baixar pacote com os arquivos necessários](aula-zn_solvator_2aguas.zip)

```text
# Alternativa curta: acrescenta somente duas aguas.
! XTB2 ALPB(water) PAL8
%maxcore 256

%solvator
  # Numero de novas aguas; o soluto fica fixo na montagem.
  nsolv 2
  clustermode docking
  fixsolute true
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_en.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Extraia o pacote em uma pasta e abra o terminal Ubuntu **nessa pasta**, onde estão o input e o XYZ. Com `ORCA_DIR` configurado no tutorial, copie o bloco inteiro. Ele cria uma execução nova e devolve o terminal à pasta inicial.

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp zn_solvator_2aguas.inp zn_en.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" zn_solvator_2aguas.inp > zn_solvator_2aguas.out 2>&1
  tail -n 5 zn_solvator_2aguas.out
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
  Copy-Item -LiteralPath 'zn_solvator_2aguas.inp', 'zn_en.xyz' -Destination $pasta -ErrorAction Stop
  Push-Location $pasta
  try {
    & $orca zn_solvator_2aguas.inp > zn_solvator_2aguas.out 2>&1
    Get-Content zn_solvator_2aguas.out -Tail 5
    Get-Location
  } finally { Pop-Location }
}
```

</details>

</details>

**Na próxima atividade**, use a estrutura relaxada e o reinício fornecidos. Não é preciso executar otimização e preparação térmica durante a aula.

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Resultados reais já calculados com PAL8. O input completo de cada referência está ao lado da saída; as séries não foram substituídas por simulações novas.

- **zn_solvator:** [input completo usado](resultados/zn_solvator/zn_solvator.inp) · [saída](resultados/zn_solvator/zn_solvator.out) · [estrutura](resultados/zn_solvator/zn_solvator.solvator.xyz).
- **zn_solvator_2aguas:** [input completo usado](resultados/zn_solvator_2aguas/zn_solvator_2aguas.inp) · [saída](resultados/zn_solvator_2aguas/zn_solvator_2aguas.out) · [estrutura](resultados/zn_solvator_2aguas/zn_solvator_2aguas.solvator.xyz).

[Consultar preparação, números e respostas](apoio.md).

</details>

**Manual:** [SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta trajetória ainda não permite.
