# Downloads e referências

[← Tutoriais](README.md)

## Workshop e materiais

- [6º Workshop do Programa de Pós-Graduação em Química — UERJ](https://www.ppgq-iq.uerj.br/6o-workshop-do-programa-de-pos-graduacao-em-quimica-uerj)
- [Repositório do minicurso](https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ)

- [Guia interativo dos parâmetros de `%md`](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/guia-md/) — consulta rápida aos comandos, com explicações e exemplos.

## ORCA 6.1.1

- [Fórum ORCA](https://orcaforum.kofo.mpg.de/) · [Cadastro](https://orcaforum.kofo.mpg.de/index.php?register/) · [Filebase / downloads](https://orcaforum.kofo.mpg.de/filebase/)
- [Linux x86-64 AVX2 — pacote 275](https://orcaforum.kofo.mpg.de/filebase/index.php?file/275-orca-6-1-1-linux-x86-64-avx2-tar-xz-archive/): compilação declarada com Open MPI **4.1.8**, AVX2, glibc mínima **2.17**. Neste minicurso, usamos o runtime **4.1.6 do Ubuntu via apt**, conferido com os testes de instalação.
- [Windows 64 bits — pacote 267](https://orcaforum.kofo.mpg.de/filebase/index.php?file/267-orca-6-1-1-windows-64bit-installer/): MS-MPI **10.1.12498.52**.
- [Anúncio oficial da versão 6.1.1](https://www.faccts.de/orca-6-1-1/)
- [Manual ORCA 6.1](https://www.faccts.de/docs/orca/6.1/manual/)
- [Instalação](https://www.faccts.de/docs/orca/6.1/manual/contents/quickstartguide/installation.html) · [Paralelismo](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/parallel.html)
- [Tutoriais oficiais](https://www.faccts.de/docs/orca/6.1/tutorials/)

O fórum pode exigir cadastro e login para exibir os arquivos. As especificações dos pacotes 275 e 267 foram fornecidas pelo ministrante para esta edição. A descrição Linux recebida menciona um nome 6.1.0 apesar do título 6.1.1; por isso, o guia exige conferir a versão no programa. A versão de compilação informada pelo download é preservada acima; a escolha do runtime do Ubuntu é uma orientação do minicurso, acompanhada de [verificação local](03-testar-instalacao.md#verificação-desta-versão-dos-materiais).

## XTB2 e SOLVATOR

- [Preparação e teste para a aula](05-xtb-solvator.md) — usar `XTB2` nos inputs; verificar antes de instalar.
- [Interface xTB no ORCA 6.1](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html)
- [SOLVATOR no ORCA 6.1](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html)
- [Distribuição oficial xTB 6.7.1](https://github.com/grimme-lab/xtb/releases/tag/v6.7.1)

## MPI

- [Open MPI 4.1 — downloads oficiais](https://www.open-mpi.org/software/ompi/v4.1/)
- [openmpi-bin — Ubuntu 24.04](https://packages.ubuntu.com/noble/amd64/openmpi-bin): Open MPI **4.1.6-7ubuntu2**, instalado pelo apt.
- [libopenmpi-dev — Ubuntu 24.04](https://packages.ubuntu.com/en/noble/libopenmpi-dev): pacote complementar usado no roteiro.
- [Tutorial oficial de paralelismo ORCA 6.1](https://www.faccts.de/docs/orca/6.1/tutorials/first_steps/parallel.html): cita 4.1.6 genericamente e orienta observar a versão indicada no download.
- [Microsoft MPI v10.1.3 — build 10.1.12498.52](https://www.microsoft.com/en-us/download/details.aspx?id=105289): selecione **msmpisetup.exe**.
- [Documentação Microsoft MPI](https://learn.microsoft.com/en-us/message-passing-interface/microsoft-mpi)
- [Referência Microsoft mpiexec](https://learn.microsoft.com/en-us/powershell/high-performance-computing/mpiexec?view=hpc19-ps)

## Windows, Ubuntu e ferramentas

- [Instalação do WSL — Microsoft](https://learn.microsoft.com/pt-br/windows/wsl/install)
- [Instalação manual do WSL](https://learn.microsoft.com/pt-br/windows/wsl/install-manual)
- [Comandos básicos do WSL](https://learn.microsoft.com/pt-br/windows/wsl/basic-commands)
- [Primeira configuração e conta de usuário Linux](https://learn.microsoft.com/pt-br/windows/wsl/setup/environment)
- [Arquivos entre Windows e WSL](https://learn.microsoft.com/pt-br/windows/wsl/filesystems)
- [Solução de problemas do WSL](https://learn.microsoft.com/pt-br/windows/wsl/troubleshooting)
- [Ubuntu para WSL](https://ubuntu.com/desktop/wsl)
- [Avogadro — instalação](https://avogadro.cc/install/index.html)
- [Visual Studio Code — download](https://code.visualstudio.com/download)

Referências consultadas em **28/09/2026**. Use os endereços oficiais e confira a versão selecionada ao baixar cada programa.
