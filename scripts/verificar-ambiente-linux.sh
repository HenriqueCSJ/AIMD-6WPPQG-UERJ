#!/usr/bin/env bash
# Diagnostico somente leitura; nao executa calculos nem modifica configuracoes.
set -uo pipefail
aimd_failures=0
check_failure() { printf 'PENDENTE: %s\n' "$1"; aimd_failures=$((aimd_failures + 1)); }
printf '%s\n' "=== Ambiente Linux para ORCA 6.1.1 ==="
[[ -r /etc/os-release ]] && grep -E '^(PRETTY_NAME|VERSION_ID)=' /etc/os-release
printf 'Arquitetura: '; uname -m
[[ $(uname -m) == x86_64 ]] || check_failure "O pacote selecionado requer x86-64."
if grep -qw avx2 /proc/cpuinfo; then
    echo "AVX2: disponivel"
else
    check_failure "AVX2 nao foi identificado. Nao use o pacote AVX2."
fi
getconf GNU_LIBC_VERSION 2>/dev/null || check_failure "Nao foi possivel consultar glibc."
echo "Minimo declarado pelo pacote Linux: glibc 2.17."
if command -v mpirun >/dev/null; then
    command -v mpirun
    aimd_mpi_version="$(mpirun --version 2>&1)"
    printf '%s\n' "$aimd_mpi_version"
    [[ "$aimd_mpi_version" == *"Open MPI"* && "$aimd_mpi_version" == *"4.1.8"* ]] ||
        check_failure "Ative Open MPI 4.1.8 para este pacote."
else
    check_failure "mpirun nao encontrado."
fi
if command -v orca >/dev/null; then
    aimd_orca_exe="$(readlink -f "$(command -v orca)")"
    echo "ORCA: $aimd_orca_exe"
    aimd_parallel="$(dirname "$aimd_orca_exe")/orca_startup_mpi"
    if [[ -f "$aimd_parallel" ]]; then
        aimd_libraries="$(ldd "$aimd_parallel" 2>&1)"
        printf '%s\n' "$aimd_libraries" | grep -E 'libmpi|not found' || true
        [[ "$aimd_libraries" != *"not found"* ]] ||
            check_failure "Ha bibliotecas ausentes no modulo paralelo."
    else
        check_failure "Modulo orca_startup_mpi nao encontrado junto ao executavel."
    fi
else
    check_failure "orca nao encontrado no PATH."
fi
echo "Este diagnostico nao substitui os testes serial/paralelo nem verifica a versao do ORCA."
[[ "$aimd_failures" -eq 0 ]]

