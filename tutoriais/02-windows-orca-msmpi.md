# ORCA nativo no Windows

[← Tutoriais](README.md) · [Rota WSL2 + Ubuntu](01-wsl2-ubuntu-orca.md)

**Rota alternativa.** Para o minicurso, recomendamos [WSL2 + Ubuntu 24.04 LTS](01-wsl2-ubuntu-orca.md). O guia recomendado começa pela instalação do WSL2, incluindo reinício e criação do usuário Linux. A instalação nativa descrita aqui não precisa de WSL.

**O que instalar:** ORCA **6.1.1 para Windows 64 bits** e **Microsoft MPI 10.1.3**, build **10.1.12498.52**. Depois da configuração inicial, basta abrir o **Prompt de Comando (`cmd`)** na pasta do exercício e executar:

```bat
orca arquivo.inp > arquivo.out
```

No Windows nativo, esse comando fica em primeiro plano. O `&` usado no Ubuntu para executar em segundo plano não tem essa função no Prompt de Comando. [Execução no manual ORCA](https://www.faccts.de/docs/orca/6.1/manual/contents/quickstartguide/running.html) · [Sintaxe do CMD](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cmd).

## 1. Instale o MS-MPI

Abra [Microsoft MPI v10.1.3 — Download Center oficial](https://www.microsoft.com/en-us/download/details.aspx?id=105289), baixe **`msmpisetup.exe`** e execute o instalador. O arquivo `msmpisdk.msi` é o SDK de desenvolvimento; não é necessário para rodar o ORCA.

Essa versão atende ao build **10.1.12498.52** indicado no download do ORCA e tem suporte a Windows 10 e 11. O Open MPI instalado no Ubuntu é independente do MS-MPI desta rota.

## 2. Cadastre-se e instale o ORCA

1. Faça o [cadastro no fórum ORCA](https://orcaforum.kofo.mpg.de/index.php?register/). Se necessário, entre pela [página inicial](https://orcaforum.kofo.mpg.de/) e escolha **Register**.
2. Ative sua conta, faça login e aceite os termos aplicáveis.
3. Baixe o [ORCA 6.1.1 Windows 64-bit Installer — arquivo 267](https://orcaforum.kofo.mpg.de/filebase/index.php?file/267-orca-6-1-1-windows-64bit-installer/). Se vier em ZIP, extraia-o antes de abrir o instalador `.exe` ou `.msi`.
4. Escolha **Full** ou **Custom**, incluindo os componentes paralelos. A opção **Typical** descrita no manual instala somente os módulos seriais.
5. Anote a pasta escolhida. Neste guia, o exemplo é **`C:\ORCA_6.1.1`**, a pasta que contém `orca.exe`. Adapte-a se sua instalação estiver em outro lugar.

O instalador configura **Path**, **ORCADIR** e **XTBEXE**. Esta última aponta para o executável xTB fornecido no pacote Windows, dentro de uma subpasta da instalação. Não é necessário reinstalar xTB para começar. [Instalação e variáveis oficiais](https://www.faccts.de/docs/orca/6.1/manual/contents/quickstartguide/installation.html).

## 3. Confira o Path permanente

Feche as janelas do terminal, inclusive o Windows Terminal, e abra um novo **Prompt de Comando** pelo menu Iniciar. Digite:

```bat
where orca
where mpiexec
```

O primeiro resultado de cada comando deve apontar para a instalação desejada, por exemplo:

```text
C:\ORCA_6.1.1\orca.exe
C:\Program Files\Microsoft MPI\Bin\mpiexec.exe
```

Se algum deles não for encontrado, faça esta configuração **uma única vez**:

1. Pesquise **Editar as variáveis de ambiente do sistema** no menu Iniciar e abra **Variáveis de Ambiente**.
2. Localize **Path**. Se o instalador já criou a entrada em **Variáveis do sistema**, confira-a ali; se estiver em **Variáveis de usuário**, confira-a nesse grupo.
3. Clique em **Editar → Novo** e acrescente a pasta real do ORCA e a pasta do MS-MPI que estiver faltando. Adicione **pastas**, sem `orca.exe` ou `mpiexec.exe` no final e sem aspas. **Preserve todas as outras entradas.**
4. Confirme com **OK** e reabra o terminal. Repita os dois comandos `where`.

Se aparecer uma versão antiga primeiro, corrija a ordem no Path do grupo em que ela está cadastrada. Uma entrada no Path do usuário não passa automaticamente à frente das entradas do sistema. Não basta alterar apenas a janela atual: a configuração precisa continuar funcionando em um terminal recém-aberto.

## 4. Confira os componentes

No novo **Prompt de Comando**:

```bat
where orca_startup_mpi.exe
set ORCADIR
set XTBEXE
mpiexec /np 2 hostname.exe
```

O módulo paralelo deve pertencer à instalação do ORCA. `ORCADIR` deve indicar sua pasta, e `XTBEXE` deve indicar o arquivo `xtb.exe` existente dentro dela. O último comando deve imprimir o nome do computador duas vezes; isso confere o lançamento MPI, mas ainda não testa o ORCA.

Para conferir o build do MPI, localize o `mpiexec.exe` mostrado por `where`, abra **Propriedades → Detalhes** e confira **10.1.12498.52**.

Se `ORCADIR` ou `XTBEXE` estiver ausente ou incorreta, repare a instalação ou ajuste essa variável na mesma janela de **Variáveis de Ambiente**: `ORCADIR` recebe a pasta do ORCA; `XTBEXE`, o caminho completo do `xtb.exe` realmente instalado. Não coloque aspas no valor. Reabra o terminal depois de salvar.

## 5. Entre na pasta e execute

Baixe e extraia o ZIP do exercício. No Explorador de Arquivos, entre na pasta que contém o input e suas estruturas, digite **`cmd` na barra de endereço** e pressione Enter. O Prompt abrirá nessa pasta.

Execute o input pelo nome, substituindo `arquivo` pelo nome mostrado na página do exercício:

```bat
orca arquivo.inp > arquivo.out
```

Mantenha essa janela aberta até o cálculo terminar. A saída é gravada em `arquivo.out`, na mesma pasta. Você não precisa definir variáveis nem informar o caminho do programa a cada cálculo.

**Antes da aula, faça [os testes serial e paralelo](03-testar-instalacao.md#windows-nativo), nessa ordem.** No teste paralelo, confira na saída o número de processos pedido pelo input e a mensagem **`ORCA TERMINATED NORMALLY`**. Encontrar o programa no Path, sozinho, não confirma que os módulos paralelos estão funcionando. O próprio ORCA chama o MPI; não execute `mpiexec orca ...`.

## Se algo não funcionar

- **`orca` não reconhecido:** confira o passo 3 e abra um terminal novo.
- **Só o serial funciona:** confira MS-MPI, instalação Full/Custom e o ajuste abaixo.
- **xTB não encontrado:** confira `XTBEXE`, que deve apontar para o executável real, não apenas para uma pasta.
- **`arquivo.inp.txt`:** habilite a exibição de extensões no Explorador e corrija o nome para `.inp`.
- **Falha ao criar arquivos:** use uma pasta de trabalho local com permissão de escrita.

<a id="se-o-paralelo-nao-encontrar-os-modulos"></a>
<details>
<summary>O ORCA encontra o input, mas não encontra seus módulos paralelos</summary>

O [capítulo de execução paralela](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/parallel.html) pede que o driver receba seu caminho completo. Se essa for a causa da falha, configure este pequeno comando uma vez; os exercícios continuarão usando apenas `orca arquivo.inp > arquivo.out`.

1. Dentro da pasta instalada do ORCA, crie a subpasta **`comando`**. No exemplo: `C:\ORCA_6.1.1\comando`.
2. Nela, salve o arquivo **`orca.cmd`** como texto simples, com o conteúdo abaixo. Escolha **Todos os arquivos** ao salvar para evitar `orca.cmd.txt` e ajuste o caminho se necessário:

```bat
@echo off
"C:\ORCA_6.1.1\orca.exe" %*
```

3. Em **Variáveis de Ambiente → Path**, acrescente `C:\ORCA_6.1.1\comando` **antes** de `C:\ORCA_6.1.1`, no **mesmo grupo** de variáveis em que a pasta original está registrada. Se estiver nas variáveis do sistema, a alteração requer permissão de administrador; adicionar o comando apenas ao Path do usuário não garante prioridade. Preserve as demais entradas.
4. Reabra o Prompt fora da pasta de instalação e execute `where orca`. O **primeiro** resultado precisa ser `C:\ORCA_6.1.1\comando\orca.cmd`.
5. Repita o teste paralelo. O comando `orca` agora encaminha a execução ao caminho completo de `orca.exe`, mantendo a pasta de trabalho e os argumentos do exercício.

Se o erro continuar, examine a mensagem de saída: esse ajuste resolve a localização do driver, mas não substitui um runtime MPI ou componente ausente.

</details>

[Próximo: testes serial e paralelo →](03-testar-instalacao.md)
