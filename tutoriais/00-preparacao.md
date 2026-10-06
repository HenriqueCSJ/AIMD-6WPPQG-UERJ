# Antes do minicurso

[← Tutoriais](README.md) · [Instalação no WSL2 →](01-wsl2-ubuntu-orca.md)

## O que preparar

- Um computador no qual você possa instalar programas; a primeira configuração do WSL e do runtime Windows pode pedir permissão de administrador.
- Cadastro no [fórum do ORCA](https://orcaforum.kofo.mpg.de/), com acesso aos downloads.
- **ORCA 6.1.1** e o MPI da rota escolhida: Open MPI do Ubuntu via apt ou MS-MPI no Windows nativo.
- [XTB2 e SOLVATOR funcionando](05-xtb-solvator.md): teste a instalação existente antes de acrescentar ou substituir programas.
- Um editor de texto simples, como [Visual Studio Code](https://code.visualstudio.com/download).
- [Avogadro](https://avogadro.cc/install/index.html) para abrir e examinar estruturas XYZ; instale a versão para o seu sistema.
- Uma cópia deste repositório e os [testes de instalação](03-testar-instalacao.md) concluídos.

Para acompanhar com conforto, nossa sugestão é ter **8 GB de RAM ou mais** e reservar **15 GB de espaço livre**. São margens de preparação para o minicurso, não requisitos oficiais mínimos do ORCA. Os testes iniciais usam dois processos e uma molécula pequena; os exemplos de AIMD terão requisitos próprios.

## Qual rota escolher?

**Recomendamos WSL2 + Ubuntu 24.04 LTS para o minicurso.** Essa configuração oferece um terminal Linux e instalação simples do Open MPI 4.1.6 pelos pacotes do Ubuntu (`apt`). O WSL funciona sobre o Windows: não é necessário substituir o sistema nem configurar dual boot.

**Windows nativo é uma alternativa** para quem preferir ou não puder usar WSL2. Essa rota usa o instalador Windows do ORCA e o runtime MS-MPI, com os comandos de execução do ORCA no **Prompt de Comando (`cmd`)**.

O pacote Linux escolhido requer arquitetura **x86-64 e AVX2**. Computadores ARM/Snapdragon e processadores sem AVX2 precisam de outro pacote compatível; não prossiga com esse arquivo sem verificar a arquitetura. O tutorial mostra a checagem.

## Ao abrir o terminal

No Windows, abra o terminal indicado em cada bloco: **Prompt de Comando (`cmd`)** para executar os exemplos nativos de ORCA; **PowerShell** para os passos de configuração que o pedirem. Os blocos **Bash / Ubuntu** pertencem ao Linux. Copie somente os comandos, sem a marcação do bloco.

Em ambos os sistemas, use um diretório de cálculos separado da instalação do ORCA. No WSL, execute dentro de `~/`; no Windows, escolha uma pasta local simples, como `C:\calculos\`.

## Checklist

- [ ] Consigo localizar o executável correto do ORCA.
- [ ] O teste imprime a versão **6.1.1**.
- [ ] O MPI corresponde à rota escolhida.
- [ ] O teste serial termina normalmente.
- [ ] O teste paralelo com dois processos termina normalmente.
- [ ] O teste `XTB2`/SOLVATOR termina normalmente e produz o XYZ de 9 átomos.
- [ ] Consigo abrir [agua.xyz](../estruturas/agua.xyz) no Avogadro.
- [ ] Sei onde salvar inputs, saídas e trajetórias.

Se algum item falhar, guarde a mensagem de erro e consulte o final do guia correspondente. Você ainda poderá acompanhar a explicação e visualizar os materiais disponibilizados.
