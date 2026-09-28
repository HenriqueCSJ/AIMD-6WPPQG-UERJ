# Scripts de apoio

[← Materiais](../README.md#materiais-do-minicurso)

- [instalar-openmpi-4.1.8.sh](instalar-openmpi-4.1.8.sh): baixa a distribuição oficial, compila e instala Open MPI **4.1.8** em `~/.local/opt/openmpi-4.1.8`. Requer compiladores e ferramentas descritos no [guia WSL](../tutoriais/01-wsl2-ubuntu-orca.md). Não instala ORCA nem altera `.bashrc`.
- [verificar-ambiente-linux.sh](verificar-ambiente-linux.sh): consulta arquitetura, AVX2, MPI e bibliotecas. Não executa cálculos.
- [verificar-ambiente-windows.ps1](verificar-ambiente-windows.ps1): consulta ORCA, módulos paralelos e runtime MS-MPI. Não executa cálculos.

Leia os scripts antes de executá-los. Um diagnóstico sem pendências ainda precisa ser seguido dos [testes de instalação](../tutoriais/03-testar-instalacao.md).

O instalador Linux usa dois processos de compilação por padrão. Para mudar, execute `AIMD_BUILD_JOBS=4 bash scripts/instalar-openmpi-4.1.8.sh`. A instalação é isolada: não substitui o MPI do sistema. O destino pode ser alterado com `AIMD_MPI_PREFIX`; nesse caso, ajuste também os caminhos de ativação. Fontes e logs permanecem em `~/.cache/aimd-workshop/`.

