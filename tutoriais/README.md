# Prepare seu ambiente

[← Página do minicurso](../README.md)

**Recomendamos WSL2 + Ubuntu 24.04 LTS para o minicurso.** Siga essa rota e conclua o teste de funcionamento. O guia de Windows nativo oferece uma alternativa para quem optar por não usar WSL2.

**Nunca instalou o WSL?** [Comece pela instalação do zero no Windows 11/10](01-wsl2-ubuntu-orca.md#1-instale-o-wsl2). O guia explica como verificar seu computador, instalar WSL2 e Ubuntu e criar seu usuário Linux antes de preparar o ORCA.

1. [Antes de começar](00-preparacao.md)
2. **Rota recomendada:** [WSL2 + Ubuntu 24.04 + ORCA 6.1.1](01-wsl2-ubuntu-orca.md)
3. **Rota alternativa:** [Windows nativo + ORCA 6.1.1 + MS-MPI](02-windows-orca-msmpi.md)
4. [Testes serial e paralelo](03-testar-instalacao.md)
5. [Downloads e referências oficiais](04-links-e-referencias.md)
6. [Confira XTB2 e SOLVATOR](05-xtb-solvator.md) — teste primeiro; instale o xTB externo somente se necessário.

**Ambiente da aula:** no Ubuntu 24.04, instalamos Open MPI **4.1.6 via apt**; no Windows nativo, MS-MPI **10.1.12498.52**. O pacote Linux informa compilação com MPI 4.1.8; o guia registra essa diferença e orienta a conferir o funcionamento com testes serial e paralelo. Cada participante deve baixar o ORCA com sua própria conta e aceitar os termos aplicáveis.

**Consulta durante a aula:** [guia interativo dos parâmetros de `%md`](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/guia-md/), com busca, explicações e exemplos copiáveis.

**Ao concluir:** abra um terminal novo, entre na pasta do input e use `orca arquivo.inp > arquivo.out &` no Ubuntu. No Windows nativo, use o Prompt de Comando com `orca arquivo.inp > arquivo.out`. Não é necessário repetir caminhos de instalação durante os exercícios.
