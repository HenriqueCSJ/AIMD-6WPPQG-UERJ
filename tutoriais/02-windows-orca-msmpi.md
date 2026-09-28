# ORCA nativo no Windows

[← Tutoriais](README.md) · [Rota WSL2 + Ubuntu](01-wsl2-ubuntu-orca.md)

**Rota alternativa.** Para acompanhar o minicurso, recomendamos [WSL2 + Ubuntu 24.04 LTS](01-wsl2-ubuntu-orca.md). Use este guia se optar pela instalação nativa no Windows.

**Ainda não tem WSL instalado?** O [guia recomendado começa pela instalação do WSL2 e do Ubuntu do zero](01-wsl2-ubuntu-orca.md#1-instale-o-wsl2), incluindo reinício e criação do usuário Linux. Se preferir continuar com a instalação nativa abaixo, **ela não requer WSL**.

**Configuração desta alternativa:** ORCA **6.1.1 para Windows 64 bits** + **Microsoft MPI 10.1.3**, cujo número de build é **10.1.12498.52**.

Você executará os comandos no **PowerShell do Windows**. O Open MPI usado no Ubuntu não substitui o MS-MPI desta rota.

## 1. Baixe o runtime correto

Abra [Microsoft MPI v10.1.3 — Download Center oficial](https://www.microsoft.com/en-us/download/details.aspx?id=105289).

Selecione **`msmpisetup.exe`** e execute o instalador. Esse é o runtime necessário para rodar aplicações MPI. O arquivo separado `msmpisdk.msi` é o SDK de desenvolvimento e não é necessário para executar o ORCA.

A página da Microsoft relaciona explicitamente **v10.1.3 ↔ 10.1.12498.52**, com suporte a Windows 10 e 11. O build anterior de v10.1.2 é **10.1.12498.18**; não confunda os dois.

Conclua a instalação e **abra um novo PowerShell**.

## 2. Faça o cadastro e baixe o ORCA

1. Entre no [cadastro do fórum ORCA](https://orcaforum.kofo.mpg.de/index.php?register/). Se necessário, use a [página inicial](https://orcaforum.kofo.mpg.de/) e o botão **Register**.
2. Ative sua conta, faça login e aceite os termos aplicáveis.
3. Abra o [ORCA 6.1.1 Windows 64-bit Installer — arquivo 267](https://orcaforum.kofo.mpg.de/filebase/index.php?file/267-orca-6-1-1-windows-64bit-installer/).
4. Baixe o pacote; se vier em ZIP, extraia-o antes de executar o instalador. A descrição desse download permite tentar o **.exe ou .msi** e informa vínculo contra **MS-MPI 10.1.12498.52**.

O software não é incluído neste repositório. Use a sua própria conta para obtê-lo.

## 3. Instale os componentes paralelos

Escolha uma pasta local simples; neste guia, usaremos como exemplo:

```text
C:\ORCA_6.1.1
```

No instalador, escolha **Custom** ou **Full** e confirme que os módulos paralelos estão incluídos. A instalação **Typical** descrita no [manual oficial](https://www.faccts.de/docs/orca/6.1/manual/contents/quickstartguide/installation.html) instala apenas os componentes seriais. Se o pacote 6.1.1 apresentar opções diferentes, confira seus componentes e o resultado do teste paralelo.

Não é preciso adicionar módulos especializados AUTOCI para os pequenos testes deste guia. Caso um exercício futuro os exija, a orientação será dada junto dele.

Ao terminar, feche o terminal e abra outro para carregar as variáveis atualizadas.

## 4. Confira executáveis e versão do MPI

No **PowerShell**:

```powershell
where.exe orca
where.exe mpiexec
$orcaExe = (Get-Command orca.exe -ErrorAction Stop).Source
$mpiExe = Join-Path $env:ProgramFiles 'Microsoft MPI\Bin\mpiexec.exe'
(Get-Item -LiteralPath $mpiExe).VersionInfo |
    Select-Object FileVersion, ProductVersion
```

O caminho do ORCA deve corresponder à instalação escolhida; o MPI esperado fica normalmente em `C:\Program Files\Microsoft MPI\Bin\`. A versão consultada deve corresponder a **10.1.12498.52**.

Se `where.exe mpiexec` mostrar várias instalações, confirme que o MS-MPI esperado aparece primeiro.

Para verificar o lançamento de processos:

```powershell
& $mpiExe /np 2 hostname.exe
```

O nome do computador deve aparecer duas vezes. A [documentação Microsoft do mpiexec](https://learn.microsoft.com/en-us/powershell/high-performance-computing/mpiexec?view=hpc19-ps) descreve a opção de número de processos.

### Se o ORCA ou MPI não estiver no Path

Primeiro, reabra o PowerShell. Persistindo o problema, procure **Editar as variáveis de ambiente da sua conta**, edite **Path** e acrescente as pastas reais do ORCA e do MS-MPI. Preserve as demais entradas; não substitua todo o Path.

Para testar apenas na janela atual, usando os caminhos deste exemplo:

```powershell
$env:Path = 'C:\ORCA_6.1.1;C:\Program Files\Microsoft MPI\Bin;' + $env:Path
```

Se escolheu outra pasta, adapte o comando.

## 5. Baixe o repositório e teste o ORCA

Use **Code → Download ZIP** no [repositório do minicurso](https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ), extraia-o e abra um PowerShell na pasta que contém `README.md`, `inputs` e `estruturas`.

Você pode executar o diagnóstico somente leitura:

```powershell
powershell.exe -NoProfile -File .\scripts\verificar-ambiente-windows.ps1
```

Se a política da instituição bloquear scripts, não é necessário alterá-la: faça as verificações manuais acima.

**Continue em [Testar a instalação — Windows](03-testar-instalacao.md#windows-nativo).** O teste serial deve preceder o paralelo. Use o caminho completo de `orca.exe`, obtido em `$orcaExe`, e deixe o próprio ORCA iniciar seus processos conforme o input.

## Quando algo não funciona

- **`orca` não reconhecido:** abra um novo terminal e confira o Path e o local real de `orca.exe`.
- **Só o serial funciona:** confira o runtime MS-MPI, os componentes paralelos e a pasta de trabalho. O diagnóstico procura `orca_startup_mpi.exe` ao lado do executável.
- **Versão .18 em vez de .52:** instale o runtime v10.1.3 indicado no passo 1 e confira novamente em um terminal novo.
- **`water.inp.txt` ou equivalente:** habilite a exibição de extensões no Explorador. Os inputs devem terminar em `.inp`.
- **Falha ao criar arquivos:** execute em uma pasta local na qual você tenha permissão de escrita.
- **Acesso controlado/antivírus bloqueando executáveis:** consulte a política da máquina ou o suporte institucional; não desative a proteção globalmente.
- **Erro no input:** envie as últimas linhas da saída junto da versão do programa e do MPI.

[Próximo: testes serial e paralelo →](03-testar-instalacao.md)
