# ORCA no Windows com WSL2 e Ubuntu

[← Tutoriais](README.md) · [Alternativa Windows nativo](02-windows-orca-msmpi.md)

**Rota recomendada para o minicurso:** Windows 11/10 → WSL2 → Ubuntu 24.04 LTS → Open MPI **4.1.6 via apt** → ORCA **6.1.1** Linux x86-64 AVX2.

## 1. Instale o WSL2

**Ainda não tem WSL? Comece aqui.** Este passo instala o ambiente Linux antes de preparar o ORCA. WSL é o Subsistema do Windows para Linux; Ubuntu é a distribuição que usaremos dentro dele.

### 1.1. Confira seu ponto de partida

Pressione **Win+R**, digite `winver` e confirme a versão do Windows. O procedimento abaixo requer **Windows 11** ou **Windows 10 versão 2004/build 19041 ou posterior**. Em versões anteriores, atualize pelo Windows Update ou consulte a [instalação manual da Microsoft](https://learn.microsoft.com/pt-br/windows/wsl/install-manual).

No menu Iniciar, procure **PowerShell**, clique com o botão direito e escolha **Executar como administrador**. Aceite a solicitação do Windows. Você precisará de acesso à internet.

Se nunca instalou o WSL, pode ir direto ao **passo 1.2**. Se não sabe se ele já está instalado, confira:

```powershell
wsl --list --verbose
```

- **WSL ausente ou nenhuma distribuição instalada:** siga o passo 1.2.
- **Ubuntu já aparece:** não precisa reinstalá-lo; vá ao passo 1.3. No passo 2, confira se a versão real é Ubuntu 24.04. Se quiser instalar essa versão separadamente, siga o passo 1.2.
- **Comando não reconhecido ou opção inválida:** consulte as orientações ao final desta seção.

### 1.2. Se você ainda não tem WSL, instale do zero

Na mesma janela do **PowerShell como administrador**, execute:

```powershell
wsl --install -d Ubuntu-24.04
```

Esse comando instala o WSL e solicita o Ubuntu **24.04 LTS**. Se o WSL já existir, ele adiciona a distribuição indicada. O procedimento segue a [instalação oficial da Microsoft](https://learn.microsoft.com/pt-br/windows/wsl/install).

Salve seu trabalho e **reinicie o computador quando solicitado**. Depois, abra **Ubuntu 24.04** pelo menu Iniciar. Se ele ainda não aparecer, confira novamente `wsl --list --verbose`; se Ubuntu-24.04 não estiver listado, repita o comando de instalação após o reinício.

### 1.3. Abra o Ubuntu e crie seu usuário Linux

Na primeira abertura, aguarde a configuração e crie um nome de usuário simples, como `aluno`, e uma senha. Essa conta pertence ao **Ubuntu** e pode ser diferente da conta do Windows. Ao digitar a senha, **nenhum caractere ou asterisco aparece**; digite normalmente e pressione Enter. Ela será usada nos comandos `sudo`. Veja a [orientação oficial sobre a conta Linux](https://learn.microsoft.com/pt-br/windows/wsl/setup/environment).

Se o Ubuntu já estava configurado, use seu usuário existente. Para abri-lo pelo PowerShell, também é possível executar:

```powershell
wsl -d Ubuntu-24.04
```

Use o nome exato mostrado por `wsl --list --verbose` se sua distribuição tiver outro nome.

### 1.4. Confirme que está usando WSL2

Volte à janela do **PowerShell**. Se abriu o Ubuntu pelo comando `wsl -d`, digite `exit` para retornar ao PowerShell na mesma janela. Então execute:

```powershell
wsl --update
wsl --set-default-version 2
wsl --list --verbose
```

A coluna **VERSION** deve mostrar **2** na linha do Ubuntu. O comando de versão padrão vale para novas distribuições; ele não converte as existentes. Se a linha mostrar **1**, salve uma cópia dos arquivos importantes dessa distribuição antes de convertê-la:

```powershell
wsl --set-version Ubuntu-24.04 2
wsl --list --verbose
```

Use o nome exato da sua distribuição. A [referência de comandos da Microsoft](https://learn.microsoft.com/pt-br/windows/wsl/basic-commands) explica a atualização e a conversão. O estado `Stopped` é normal quando o Ubuntu está fechado.

**Pronto para continuar:** você consegue abrir o Ubuntu, tem um usuário Linux e a coluna VERSION mostra **2**. Abra o Ubuntu e siga o passo 2. O nome registrado no WSL pode sobreviver a uma atualização do Ubuntu; a versão real será conferida dentro do Linux.

### Se a instalação inicial não funcionar

- **`wsl` não reconhecido ou `--install` indisponível:** confira `winver`, aplique as atualizações do Windows e reinicie. Se persistir, siga o [procedimento manual completo](https://learn.microsoft.com/pt-br/windows/wsl/install-manual), que inclui habilitar os recursos do Windows, reiniciar, instalar o kernel quando necessário e adicionar a distribuição Linux.
- **Download parado em 0% ou problema com a Microsoft Store:** tente, no PowerShell como administrador, `wsl --install --web-download -d Ubuntu-24.04`.
- **Ubuntu-24.04 não encontrado:** execute `wsl --list --online` e confira a grafia disponível; atualize o WSL com `wsl --update` antes de tentar novamente.
- **Erro `0x80370102` ou mensagem de virtualização:** confira a Plataforma de Máquina Virtual e a virtualização no BIOS/UEFI, conforme a [solução de problemas da Microsoft](https://learn.microsoft.com/pt-br/windows/wsl/troubleshooting). Reinicie depois de habilitar os recursos. Em computador institucional, peça apoio à equipe de TI se precisar de permissão.

## 2. Confira o Linux e o processador

A partir daqui, execute os blocos **Bash no Ubuntu**, como usuário comum:

```bash
cat /etc/os-release
uname -m
grep -m1 -o 'avx2' /proc/cpuinfo
getconf GNU_LIBC_VERSION
```

Espere Ubuntu **24.04**, arquitetura **x86_64** e a palavra **avx2**. O pacote ORCA selecionado informa **glibc ≥ 2.17**; o Ubuntu 24.04 atende a esse piso.

Se AVX2 não aparecer, não execute esse pacote: será necessário escolher uma compilação compatível com o processador. Um Windows em ARM também exige outra rota.

### Por que Ubuntu 24.04?

É a base LTS escolhida para padronizar a aula. Instalaremos o [Open MPI 4.1.6 fornecido pelo Ubuntu](https://packages.ubuntu.com/noble/amd64/openmpi-bin) diretamente pelo gerenciador de pacotes `apt`, sem compilação manual.

## 3. Prepare as ferramentas e baixe o material da aula

```bash
sudo apt update
sudo apt install -y ca-certificates tar xz-utils git nano
mkdir -p "$HOME/cursos"
cd "$HOME/cursos"
git clone https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ.git
cd AIMD-6WPPQG-UERJ
```

Se a pasta já existir, entre nela em vez de repetir o clone. Também é possível baixar o ZIP no GitHub e extraí-lo em `~/cursos/`.

Para os cálculos, prefira o sistema de arquivos Linux. A [Microsoft explica a diferença entre arquivos no Windows e no WSL](https://learn.microsoft.com/pt-br/windows/wsl/filesystems). Você pode abrir a pasta atual no Explorador com `explorer.exe .`.

## 4. Instale o Open MPI pelo apt

No **Ubuntu**, execute:

```bash
sudo apt update
sudo apt install -y openmpi-bin libopenmpi-dev
command -v mpirun
mpirun --version
```

O caminho esperado é **`/usr/bin/mpirun`**, com **Open MPI 4.1.6** no Ubuntu 24.04. O `apt` instala os pacotes e suas dependências; não é necessário configurar um diretório próprio de MPI em `PATH` ou `LD_LIBRARY_PATH`.

Confirme o lançamento de dois processos:

```bash
mpirun -np 2 hostname
```

O nome do computador deve aparecer duas vezes. Esse comando verifica o MPI; mais adiante, o ORCA será iniciado diretamente pelo seu próprio executável.

**Versão de compilação e ambiente da aula:** o pacote ORCA escolhido informa vínculo com **Open MPI 4.1.8**. Para o minicurso, adotamos o **4.1.6 do Ubuntu via apt**, também indicado genericamente no [tutorial oficial do ORCA](https://www.faccts.de/docs/orca/6.1/tutorials/first_steps/parallel.html). Essa combinação passou nos nossos testes locais serial e paralelo com ORCA 6.1.1; faça os [testes na sua instalação](03-testar-instalacao.md). Esse resultado não garante todos os módulos ou ambientes possíveis.

**Se você seguiu a versão anterior deste guia:** retire as referências ao MPI compilado em `~/.local/opt/openmpi-4.1.8` dos arquivos de ativação que editou, como `~/.config/aimd/env.sh` e, se aplicável, `~/.bashrc`. Abra um novo terminal Ubuntu, sem outro ambiente MPI ativo, e confira novamente `command -v mpirun` e `mpirun --version`. Não é necessário apagar a instalação antiga.

## 5. Cadastre-se e baixe o ORCA

1. Abra o [cadastro do fórum ORCA](https://orcaforum.kofo.mpg.de/index.php?register/) e aceite os termos aplicáveis.
2. Ative a conta e faça login. Se o link de cadastro redirecionar, entre pela [página inicial do fórum](https://orcaforum.kofo.mpg.de/) e procure **Register**.
3. Acesse o [pacote ORCA 6.1.1 Linux x86-64 AVX2 — arquivo 275](https://orcaforum.kofo.mpg.de/filebase/index.php?file/275-orca-6-1-1-linux-x86-64-avx2-tar-xz-archive/).
4. Baixe o arquivo **.tar.xz** associado ao pacote. Cada participante usa sua própria conta.

**Especificação informada para o download:** binários seriais e paralelos vinculados dinamicamente a **Open MPI 4.1.8**, **AVX2 obrigatório**, **glibc mínima 2.17**. O runtime usado neste roteiro é o **Open MPI 4.1.6 via apt**, conforme o passo 4.

> **Confira o arquivo baixado.** A descrição fornecida para essa página de 6.1.1 cita o nome `orca_6_1_0_linux_x86-64_shared_openmpi418_avx2.tar.xz`. Preserve o nome real do download e confira a versão no cabeçalho do primeiro cálculo. Renomear o arquivo não muda a versão do programa. Se o cabeçalho mostrar 6.1.0, volte à página de downloads e confirme o pacote 6.1.1.

## 6. Extraia o arquivo no Linux

Se o navegador do Windows salvou o arquivo em Downloads, copie-o para o Linux. Substitua os dois campos em maiúsculas pelos seus dados reais:

```bash
mkdir -p "$HOME/Downloads"
cp "/mnt/c/Users/SEU_USUARIO_WINDOWS/Downloads/NOME_EXATO_DO_ARQUIVO.tar.xz" "$HOME/Downloads/"
```

Extraia em uma pasta dedicada. Os comandos abaixo são para o **.tar.xz** indicado; não são instruções para um instalador `.run`.

```bash
mkdir -p "$HOME/software/orca-6.1.1"
tar -xJf "$HOME/Downloads/NOME_EXATO_DO_ARQUIVO.tar.xz" -C "$HOME/software/orca-6.1.1"
find "$HOME/software/orca-6.1.1" -type f -name orca
```

O último comando mostra o executável. Use **a pasta que o contém** no passo seguinte. Alguns arquivos criam uma subpasta ao serem extraídos; mantenha os módulos e bibliotecas juntos.

## 7. Deixe o comando `orca` disponível em todo terminal

Faça esta configuração **uma única vez**. Depois, em qualquer pasta de cálculo, você poderá usar `orca arquivo.inp > arquivo.out &`.

### 7.1. Defina os caminhos da instalação

```bash
mkdir -p "$HOME/.config/aimd" "$HOME/.local/bin"
nano "$HOME/.config/aimd/env.sh"
```

Cole as três linhas abaixo. Troque `PASTA_QUE_CONTEM_ORCA` pela subpasta real encontrada no passo 6; se `orca` estiver diretamente em `~/software/orca-6.1.1/`, retire esse último componente. `ORCA_DIR` deve apontar para **a pasta do executável real**, nunca para `~/.local/bin`.

```bash
export ORCA_DIR="$HOME/software/orca-6.1.1/PASTA_QUE_CONTEM_ORCA"
export PATH="$HOME/.local/bin:$ORCA_DIR:$PATH"
export LD_LIBRARY_PATH="$ORCA_DIR:$ORCA_DIR/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
```

No nano, salve com **Ctrl+O**, Enter e saia com **Ctrl+X**. Agora abra:

```bash
nano "$HOME/.bashrc"
```

Acrescente ao final **uma única vez**, preservando o conteúdo existente:

```bash
# ORCA do minicurso: carregar automaticamente em cada terminal Bash.
[ -f "$HOME/.config/aimd/env.sh" ] && . "$HOME/.config/aimd/env.sh"
```

### 7.2. Prepare o comando curto para os inputs com PAL8

O [manual do ORCA paralelo](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/parallel.html) pede que o driver receba o caminho completo para localizar seus módulos. Este pequeno lançador resolve isso na instalação; durante a aula você continua digitando apenas `orca`.

Crie `~/.local/bin/orca` com o conteúdo abaixo. Se esse arquivo já existir, guarde uma cópia antes de substituí-lo.

```bash
nano "$HOME/.local/bin/orca"
```

Conteúdo do arquivo:

```sh
#!/bin/sh
. "$HOME/.config/aimd/env.sh"
exec "$ORCA_DIR/orca" "$@"
```

Salve e execute:

```bash
chmod u+x "$HOME/.local/bin/orca"
source "$HOME/.bashrc"
hash -r
```

O lançador mantém a pasta atual, os argumentos e o output do cálculo. Ele chama o executável real, sem iniciar `mpirun` manualmente.

### 7.3. Confira em um terminal novo

Feche e abra o Ubuntu. **Não digite `source` novamente**: o `.bashrc` já carrega a configuração. Confira:

```bash
command -v orca
type -a orca
command -v mpirun
mpirun --version
ldd "$ORCA_DIR/orca_startup_mpi"
```

O primeiro comando deve mostrar `/home/SEU_USUARIO/.local/bin/orca`, seguido da instalação real na lista de `type -a`. Se um alias ou função antigos aparecerem antes dele, remova essa definição antiga do seu `.bashrc`. O MPI deve vir de `/usr/bin/mpirun`. Não deve haver bibliotecas `not found`; `libmpi.so.40` deve apontar para o MPI do Ubuntu.

Opcionalmente, na raiz do repositório, execute `bash scripts/verificar-ambiente-linux.sh`. Depois conclua os [testes serial e paralelo](03-testar-instalacao.md#wsl2--ubuntu) usando o comando curto. O guia de [instalação oficial](https://www.faccts.de/docs/orca/6.1/tutorials/first_steps/install.html) também explica PATH e terminais novos.

## Quando algo não funciona

- **Instalação do WSL ou virtualização:** volte às [orientações de instalação inicial](#se-a-instalação-inicial-não-funcionar).
- **Pacote não encontrado pelo apt:** execute `sudo apt update` e confirme Ubuntu 24.04. Os pacotes Open MPI ficam no repositório Universe; se estiver desabilitado, habilite-o com `sudo add-apt-repository universe`, atualize a lista e repita a instalação. Se o comando não existir, instale `software-properties-common` pelo apt.
- **`mpirun` mostra outra versão ou outro caminho:** confira `command -v mpirun` e `apt-cache policy openmpi-bin`. Desative ambientes Conda ou configurações de MPI que estejam tomando precedência e reabra o terminal. O roteiro espera o MPI de `/usr/bin`; não remova o MPI do sistema.
- **`Illegal instruction`:** confira AVX2 e se o arquivo corresponde à arquitetura.
- **Biblioteca ausente:** confira `LD_LIBRARY_PATH` e `ldd "$ORCA_DIR/orca_startup_mpi"`; não copie bibliotecas aleatórias para o sistema.
- **`bad interpreter` ou `$'\r'`:** o script foi salvo com fins de linha Windows. Use a cópia do Git ou salve o arquivo com finais de linha LF no editor.
- **Duas instalações misturadas:** `command -v orca` e `command -v mpirun` devem apontar para os caminhos esperados.

[Próximo: testes serial e paralelo →](03-testar-instalacao.md)
