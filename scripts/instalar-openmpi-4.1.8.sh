#!/usr/bin/env bash
# Open MPI 4.1.8: instalacao local, sem sudo e sem alterar .bashrc.
set -euo pipefail
if [[ "${1:-}" == "--help" ]]; then
    printf '%s\n' "Uso: bash scripts/instalar-openmpi-4.1.8.sh" \
        "Dependencias: build-essential gfortran curl ca-certificates tar gzip" \
        "Destino: ~/.local/opt/openmpi-4.1.8" \
        "Opcionais: AIMD_MPI_PREFIX e AIMD_BUILD_JOBS (padrao: 2)." \
        "Logs e fontes ficam em ~/.cache/aimd-workshop/."
    exit 0
fi
[[ $# -eq 0 ]] || { echo "Argumento desconhecido. Use --help." >&2; exit 2; }
[[ $(id -u) -ne 0 ]] || { echo "Execute como usuario comum, sem sudo." >&2; exit 2; }
[[ $(uname -s) == Linux && $(uname -m) == x86_64 ]] || {
    echo "Este roteiro foi preparado para Linux x86-64." >&2; exit 2;
}
for required in gcc g++ gfortran make curl tar gzip; do
    command -v "$required" >/dev/null || {
        echo "Falta $required. Instale as dependencias indicadas no tutorial." >&2; exit 2;
    }
done
aimd_mpi_prefix="${AIMD_MPI_PREFIX:-$HOME/.local/opt/openmpi-4.1.8}"
aimd_jobs="${AIMD_BUILD_JOBS:-2}"
[[ "$aimd_mpi_prefix" == /* && "$aimd_mpi_prefix" != "/" ]] || {
    echo "O destino deve ser um caminho absoluto especifico." >&2; exit 2;
}
[[ "$aimd_jobs" =~ ^[1-9][0-9]*$ ]] || { echo "Numero de processos invalido." >&2; exit 2; }
if [[ -e "$aimd_mpi_prefix" ]]; then
    if [[ -x "$aimd_mpi_prefix/bin/mpirun" ]] &&
       "$aimd_mpi_prefix/bin/mpirun" --version | grep -Fq '4.1.8'; then
        echo "Open MPI 4.1.8 ja encontrado em $aimd_mpi_prefix"
        echo "Ative esse ambiente e execute os testes do tutorial."
        exit 0
    fi
    echo "O destino ja existe sem uma instalacao reconhecida. Nada foi substituido." >&2
    echo "Confira a pasta ou escolha AIMD_MPI_PREFIX apontando para uma pasta nova." >&2
    exit 2
fi
aimd_cache="${XDG_CACHE_HOME:-$HOME/.cache}/aimd-workshop"
mkdir -p "$aimd_cache" "$(dirname "$aimd_mpi_prefix")"
aimd_build_dir="$(mktemp -d "$aimd_cache/openmpi-4.1.8.XXXXXX")"
trap 'echo "Falha: consulte os logs em $aimd_build_dir" >&2' ERR
cd "$aimd_build_dir"
echo "Baixando Open MPI 4.1.8 do servidor oficial..."
curl --fail --location --retry 2 \
    https://download.open-mpi.org/release/open-mpi/v4.1/openmpi-4.1.8.tar.gz \
    --output openmpi-4.1.8.tar.gz
tar -xzf openmpi-4.1.8.tar.gz
cd openmpi-4.1.8
echo "Configurando. Log: $aimd_build_dir/configure.log"
./configure --prefix="$aimd_mpi_prefix" > "$aimd_build_dir/configure.log" 2>&1
echo "Compilando com $aimd_jobs processos; esta etapa pode levar varios minutos."
make -j "$aimd_jobs" > "$aimd_build_dir/build.log" 2>&1
echo "Instalando em $aimd_mpi_prefix"
make install > "$aimd_build_dir/install.log" 2>&1
"$aimd_mpi_prefix/bin/mpirun" --version
echo "Instalacao concluida. Ative PATH e LD_LIBRARY_PATH conforme o tutorial."
echo "Logs preservados em $aimd_build_dir"

