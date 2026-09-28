# Antes do minicurso

[← Tutoriais](README.md) · [Instalação no WSL2 →](01-wsl2-ubuntu-orca.md)

## O que preparar

- Um computador no qual você possa instalar programas; a primeira configuração do WSL e do runtime Windows pode pedir permissão de administrador.
- Cadastro no [fórum do ORCA](https://orcaforum.kofo.mpg.de/), com acesso aos downloads.
- **ORCA 6.1.1** e o MPI indicado no pacote escolhido.
- Um editor de texto simples, como [Visual Studio Code](https://code.visualstudio.com/download).
- [Avogadro](https://avogadro.cc/install/index.html) para abrir e examinar estruturas XYZ; instale a versão para o seu sistema.
- Uma cópia deste repositório e os [testes de instalação](03-testar-instalacao.md) concluídos.

Para acompanhar com conforto, nossa sugestão é ter **8 GB de RAM ou mais** e reservar **15 GB de espaço livre**. São margens de preparação para o minicurso, não requisitos oficiais mínimos do ORCA. Os testes iniciais usam dois processos e uma molécula pequena; os exemplos de AIMD terão requisitos próprios.

## Qual rota escolher?

**WSL2 + Ubuntu 24.04 LTS** aproxima o ambiente do minicurso de um terminal Linux e permite manter uma instalação separada do Open MPI 4.1.8. O WSL funciona sobre o Windows: não é necessário substituir o sistema nem configurar dual boot.

**Windows nativo** usa o instalador Windows do ORCA e o runtime MS-MPI. Escolha essa rota se preferir trabalhar pelo PowerShell.

O pacote Linux escolhido requer arquitetura **x86-64 e AVX2**. Computadores ARM/Snapdragon e processadores sem AVX2 precisam de outro pacote compatível; não prossiga com esse arquivo sem verificar a arquitetura. O tutorial mostra a checagem.

## Ao abrir o terminal

Os blocos identificados como **PowerShell** pertencem ao Windows; os blocos **Bash / Ubuntu** pertencem ao Linux. Copie somente os comandos, sem a marcação do bloco.

Em ambos os sistemas, use um diretório de cálculos separado da instalação do ORCA. No WSL, execute dentro de `~/`; no Windows, escolha uma pasta local simples, como `C:\calculos\`.

## Checklist

- [ ] Consigo localizar o executável correto do ORCA.
- [ ] O teste imprime a versão **6.1.1**.
- [ ] O MPI corresponde à rota escolhida.
- [ ] O teste serial termina normalmente.
- [ ] O teste paralelo com dois processos termina normalmente.
- [ ] Consigo abrir [agua.xyz](../estruturas/agua.xyz) no Avogadro.
- [ ] Sei onde salvar inputs, saídas e trajetórias.

Se algum item falhar, guarde a mensagem de erro e consulte o final do guia correspondente. Você ainda poderá acompanhar a explicação e visualizar os materiais disponibilizados.

