# Teste sua instalação

[← Tutoriais](README.md)

Vamos calcular a energia de uma molécula de água, primeiro em um processo e depois em dois. O objetivo é verificar o ambiente: **estes inputs não executam AIMD**.

Use uma pasta nova para cada teste. Assim, arquivos anteriores não interferem na leitura do resultado. Os comandos abaixo partem da **raiz deste repositório**, onde ficam `inputs/` e `estruturas/`.

## WSL2 / Ubuntu

Ative o ambiente do [guia WSL2](01-wsl2-ubuntu-orca.md):

```bash
source "$HOME/.config/aimd/env.sh"
orca_exe="$(readlink -f "$(command -v orca)")"
repo_dir="$PWD"
teste_dir="$(mktemp -d "$HOME/aimd-teste.XXXXXX")"
mkdir -p "$teste_dir/serial" "$teste_dir/paralelo"
cp "$repo_dir/estruturas/agua.xyz" "$teste_dir/serial/"
cp "$repo_dir/estruturas/agua.xyz" "$teste_dir/paralelo/"
cp "$repo_dir/inputs/00-teste-instalacao/agua_serial.inp" "$teste_dir/serial/"
cp "$repo_dir/inputs/00-teste-instalacao/agua_parallel.inp" "$teste_dir/paralelo/"
```

**Primeiro, serial:**

```bash
cd "$teste_dir/serial"
"$orca_exe" agua_serial.inp > agua_serial.out 2>&1
grep -E "Program Version|ORCA TERMINATED NORMALLY|FINAL SINGLE POINT ENERGY" agua_serial.out
```

Procure **Program Version 6.1.1** e **ORCA TERMINATED NORMALLY**. Se o teste falhar, pare aqui e examine o final de `agua_serial.out`.

**Depois, paralelo:**

```bash
cd "$teste_dir/paralelo"
"$orca_exe" agua_parallel.inp > agua_parallel.out 2>&1
grep -E "Program Version|ORCA TERMINATED NORMALLY|FINAL SINGLE POINT ENERGY" agua_parallel.out
```

Confira também no início da saída a indicação de **dois processos MPI**. Execute os dois cálculos sequencialmente.

Para voltar aos materiais:

```bash
cd "$repo_dir"
```

## Windows nativo

No PowerShell, a partir da raiz do repositório:

```powershell
$orcaExe = (Get-Command orca.exe -ErrorAction Stop).Source
$repoDir = (Get-Location).Path
$testeDir = Join-Path $env:LOCALAPPDATA ('AIMD-Teste-' + [guid]::NewGuid().ToString('N'))
$serialDir = Join-Path $testeDir 'serial'
$parallelDir = Join-Path $testeDir 'paralelo'
New-Item -ItemType Directory -Path $serialDir, $parallelDir | Out-Null
Copy-Item -LiteralPath (Join-Path $repoDir 'estruturas\agua.xyz') -Destination $serialDir
Copy-Item -LiteralPath (Join-Path $repoDir 'estruturas\agua.xyz') -Destination $parallelDir
Copy-Item -LiteralPath (Join-Path $repoDir 'inputs\00-teste-instalacao\agua_serial.inp') -Destination $serialDir
Copy-Item -LiteralPath (Join-Path $repoDir 'inputs\00-teste-instalacao\agua_parallel.inp') -Destination $parallelDir
```

**Primeiro, serial:**

```powershell
Set-Location -LiteralPath $serialDir
& $orcaExe agua_serial.inp > agua_serial.out 2>&1
Select-String -Path agua_serial.out -Pattern 'Program Version','ORCA TERMINATED NORMALLY','FINAL SINGLE POINT ENERGY'
```

Confira **6.1.1** no cabeçalho e a mensagem de término normal. Se houver erro, resolva-o antes de seguir.

**Depois, paralelo:**

```powershell
Set-Location -LiteralPath $parallelDir
& $orcaExe agua_parallel.inp > agua_parallel.out 2>&1
Select-String -Path agua_parallel.out -Pattern 'Program Version','ORCA TERMINATED NORMALLY','FINAL SINGLE POINT ENERGY'
```

A saída deve indicar dois processos MPI e término normal. Ao terminar:

```powershell
Set-Location -LiteralPath $repoDir
```

## O que significa passar no teste?

- O cabeçalho identifica **ORCA 6.1.1**.
- Os dois inputs terminam com **ORCA TERMINATED NORMALLY**.
- O segundo realmente inicia **dois processos**.
- As energias finais dos dois testes são compatíveis até as pequenas diferenças de arredondamento numérico.

A energia isolada não é o foco desta atividade. Não use o tempo de um cálculo tão pequeno como medida de desempenho do paralelismo.

O input paralelo solicita:

```text
%pal nprocs 2 end
```

A [documentação do ORCA sobre execução paralela](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/parallel.html) orienta iniciar o **driver ORCA diretamente, pelo caminho completo**. Não coloque `mpirun` ou `mpiexec` antes dele. O MPI foi testado separadamente apenas para diagnosticar o ambiente.

## Se precisar pedir ajuda

Inclua a rota usada, o sistema operacional, a versão do ORCA, a versão do MPI e as últimas 30 linhas da saída com erro. No Linux, use `tail -n 30 agua_parallel.out`; no PowerShell, `Get-Content agua_parallel.out -Tail 30`.

## Verificação desta versão dos materiais

Em 28/09/2026, o script compilou e instalou Open MPI 4.1.8 em um diretório isolado sob Ubuntu 24.04.4/WSL2. Os dois inputs deste repositório terminaram normalmente com uma instalação existente de ORCA 6.1.1; o segundo iniciou dois processos e ambos produziram a mesma energia final.

Essa verificação não incluiu instalar o Windows/WSL do zero nem baixar novamente o pacote ORCA autenticado do fórum. A rota Windows nativa foi conferida na documentação oficial e na sintaxe PowerShell, mas não foi executada de ponta a ponta nesta revisão.

[Voltar à preparação →](00-preparacao.md)
