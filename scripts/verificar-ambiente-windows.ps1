# Diagnostico somente leitura; nao instala software nem executa calculos.
$ErrorActionPreference = 'Stop'
$aimdIssues = 0
Write-Output '=== Ambiente Windows para ORCA 6.1.1 ==='
Write-Output ("Sistema de 64 bits: {0}" -f [Environment]::Is64BitOperatingSystem)
$aimdOrca = Get-Command orca.exe -ErrorAction SilentlyContinue
if ($aimdOrca) {
    Write-Output ("ORCA: {0}" -f $aimdOrca.Source)
    $aimdParallel = Join-Path (Split-Path $aimdOrca.Source) 'orca_startup_mpi.exe'
    if (-not (Test-Path -LiteralPath $aimdParallel)) {
        Write-Output 'PENDENTE: modulo paralelo ausente. Confira a instalacao Custom/Full.'
        $aimdIssues++
    }
} else {
    Write-Output 'PENDENTE: orca.exe nao encontrado. Reabra o PowerShell ou confira o Path.'
    $aimdIssues++
}
$aimdMpiPath = Join-Path $env:ProgramFiles 'Microsoft MPI\Bin\mpiexec.exe'
if (Test-Path -LiteralPath $aimdMpiPath) {
    $aimdVersion = (Get-Item -LiteralPath $aimdMpiPath).VersionInfo.FileVersion
    Write-Output ("MS-MPI: {0}; versao do arquivo: {1}" -f $aimdMpiPath, $aimdVersion)
    if ($aimdVersion -notmatch '^10\.1\.12498\.52(?:\D|$)') {
        Write-Output 'PENDENTE: confira o runtime MS-MPI 10.1.3, build 10.1.12498.52.'
        $aimdIssues++
    }
    $aimdSelectedMpi = Get-Command mpiexec.exe -ErrorAction SilentlyContinue
    if (-not $aimdSelectedMpi -or $aimdSelectedMpi.Source -ne $aimdMpiPath) {
        Write-Output 'PENDENTE: o mpiexec selecionado no Path nao e o MS-MPI esperado.'
        $aimdIssues++
    }
} else {
    Write-Output 'PENDENTE: runtime MS-MPI nao encontrado no destino padrao.'
    $aimdIssues++
}
Write-Output 'Confira a versao 6.1.1 no cabecalho do teste ORCA e conclua os testes serial/paralelo.'
if ($aimdIssues -gt 0) { exit 1 }

