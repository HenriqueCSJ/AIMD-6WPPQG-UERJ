# Scripts de apoio

[← Materiais](../README.md#materiais-do-minicurso)

- [verificar-ambiente-linux.sh](verificar-ambiente-linux.sh): consulta arquitetura, AVX2, Open MPI 4.1.6 e bibliotecas do Ubuntu. Verifica se o executável MPI e a biblioteca carregada pelo ORCA apontam para a instalação do sistema. Não executa cálculos.
- [verificar-ambiente-windows.ps1](verificar-ambiente-windows.ps1): consulta ORCA, módulos paralelos e runtime MS-MPI. Não executa cálculos.

Leia os scripts antes de executá-los. Um diagnóstico sem pendências ainda precisa ser seguido dos [testes de instalação](../tutoriais/03-testar-instalacao.md).

O Open MPI é instalado diretamente pelo `apt`, conforme o [guia WSL2 + Ubuntu](../tutoriais/01-wsl2-ubuntu-orca.md#4-instale-o-open-mpi-pelo-apt). Não há etapa de compilação manual no roteiro.
