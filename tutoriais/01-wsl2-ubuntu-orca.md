# ORCA no Windows com WSL2 e Ubuntu

[← Tutoriais](README.md) · [Alternativa Windows nativo](02-windows-orca-msmpi.md)

**Rota do minicurso:** Windows 11/10 → WSL2 → Ubuntu 24.04 LTS → Open MPI **4.1.8** → ORCA **6.1.1** Linux x86-64 AVX2.

## 1. Instale o WSL2

**No Windows**, abra o PowerShell como administrador. O procedimento simplificado requer Windows 11 ou Windows 10 versão 2004/build 19041 ou posterior. Consulte a [orientação da Microsoft](https://learn.microsoft.com/pt-br/windows/wsl/install); para builds antigas, use o [procedimento manual](https://learn.microsoft.com/pt-br/windows/wsl/install-manual).

Confira as distribuições e instale a versão escolhida:

```powershell
wsl --list --online
wsl --install -d Ubuntu-24.04
```

Reinicie quando solicitado. Abra **Ubuntu 24.04** no menu Iniciar e crie seu usuário Linux. Ao digitar a senha, o terminal não mostra caracteres: isso é normal.

De volta ao **PowerShell**, confira:

```powershell
wsl --update
wsl --list --verbose
```

A coluna `VERSION` da distribuição deve mostrar **2**. Se mostrar 1, converta-a:

```powershell
wsl --set-version Ubuntu-24.04 2
```

Se o nome exibido for diferente, use exatamente o nome da sua distribuição. O nome registrado no WSL pode sobreviver a uma atualização do Ubuntu; a versão real será conferida dentro do Linux.

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

É a base LTS escolhida para padronizar a aula. Seus repositórios trazem [Open MPI 4.1.6](https://packages.ubuntu.com/noble/openmpi-bin), enquanto **o pacote ORCA indicado aqui declara 4.1.8**. Por isso, instalaremos a versão exata em uma pasta própria. A recomendação genérica 4.1.6 encontrada em parte da documentação ORCA não substitui a dependência do arquivo selecionado.

## 3. Prepare as ferramentas e baixe o material da aula

```bash
sudo apt update
sudo apt install -y build-essential gfortran curl ca-certificates tar gzip xz-utils git nano
mkdir -p "$HOME/cursos"
cd "$HOME/cursos"
git clone https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ.git
cd AIMD-6WPPQG-UERJ
```

Se a pasta já existir, entre nela em vez de repetir o clone. Também é possível baixar o ZIP no GitHub e extraí-lo em `~/cursos/`.

Para os cálculos, prefira o sistema de arquivos Linux. A [Microsoft explica a diferença entre arquivos no Windows e no WSL](https://learn.microsoft.com/pt-br/windows/wsl/filesystems). Você pode abrir a pasta atual no Explorador com `explorer.exe .`.

## 4. Instale o Open MPI 4.1.8

Execute, na raiz do repositório:

```bash
bash scripts/instalar-openmpi-4.1.8.sh
```

O script baixa o [código oficial do Open MPI 4.1.8](https://www.open-mpi.org/software/ompi/v4.1/), compila com duas tarefas simultâneas e instala em `~/.local/opt/openmpi-4.1.8`. A compilação pode levar vários minutos. O [procedimento de compilação do projeto](https://www.open-mpi.org/faq/?category=building) usa a sequência configurar → compilar → instalar.

Apenas a instalação das dependências no passo anterior usa `sudo`. O MPI fica no seu usuário; o script não substitui o MPI do sistema, não baixa ORCA e não altera `.bashrc`. Se houver falha, ele indica a pasta dos logs.

Ative o MPI nesta janela:

```bash
export PATH="$HOME/.local/opt/openmpi-4.1.8/bin:$PATH"
export LD_LIBRARY_PATH="$HOME/.local/opt/openmpi-4.1.8/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
mpirun --version
```

A saída deve identificar **Open MPI 4.1.8**. Confirme o lançamento de dois processos:

```bash
mpirun -np 2 hostname
```

O nome do computador deve aparecer duas vezes. Esse comando verifica o MPI; mais adiante, o ORCA será iniciado diretamente pelo seu próprio executável.

## 5. Cadastre-se e baixe o ORCA

1. Abra o [cadastro do fórum ORCA](https://orcaforum.kofo.mpg.de/index.php?register/) e aceite os termos aplicáveis.
2. Ative a conta e faça login. Se o link de cadastro redirecionar, entre pela [página inicial do fórum](https://orcaforum.kofo.mpg.de/) e procure **Register**.
3. Acesse o [pacote ORCA 6.1.1 Linux x86-64 AVX2 — arquivo 275](https://orcaforum.kofo.mpg.de/filebase/index.php?file/275-orca-6-1-1-linux-x86-64-avx2-tar-xz-archive/).
4. Baixe o arquivo **.tar.xz** associado ao pacote. Cada participante usa sua própria conta.

**Especificação do pacote adotado:** binários seriais e paralelos vinculados dinamicamente a **Open MPI 4.1.8**, **AVX2 obrigatório**, **glibc mínima 2.17**.

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

## 7. Ative ORCA e MPI juntos

Crie um pequeno arquivo de configuração pessoal:

```bash
mkdir -p "$HOME/.config/aimd"
nano "$HOME/.config/aimd/env.sh"
```

Cole o bloco abaixo, substituindo `PASTA_QUE_CONTEM_ORCA` pelo caminho encontrado. Se `orca` estiver diretamente em `~/software/orca-6.1.1/`, use esse caminho.

```bash
export ORCA_DIR="$HOME/software/orca-6.1.1/PASTA_QUE_CONTEM_ORCA"
export PATH="$ORCA_DIR:$HOME/.local/opt/openmpi-4.1.8/bin:$PATH"
export LD_LIBRARY_PATH="$ORCA_DIR/lib:$HOME/.local/opt/openmpi-4.1.8/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
```

No nano, salve com **Ctrl+O**, Enter e saia com **Ctrl+X**. Ative o arquivo **em cada novo terminal** usado para a aula:

```bash
source "$HOME/.config/aimd/env.sh"
command -v orca
command -v mpirun
mpirun --version
ldd "$ORCA_DIR/orca_startup_mpi"
```

Não deve haver `not found`. A biblioteca `libmpi` deve resolver para o Open MPI 4.1.8 escolhido. O manual do ORCA orienta a [usar caminho completo e bibliotecas do ambiente correspondente](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/parallel.html).

Na raiz do repositório:

```bash
bash scripts/verificar-ambiente-linux.sh
```

**Continue em [Testar a instalação](03-testar-instalacao.md#wsl2--ubuntu).** Um MPI funcional, sozinho, não demonstra que o ORCA paralelo está configurado.

## Quando algo não funciona

- **WSL travado em 0%:** a Microsoft documenta `wsl --install --web-download -d Ubuntu-24.04` como alternativa.
- **Erro de virtualização:** confira a virtualização no firmware e as instruções oficiais de [solução de problemas do WSL](https://learn.microsoft.com/pt-br/windows/wsl/troubleshooting).
- **`mpirun` ainda mostra 4.1.6/5.x:** reative `env.sh` e confira `command -v mpirun`. Não remova o MPI do sistema.
- **Falha na compilação:** veja `configure.log`, `build.log` ou `install.log` na pasta informada pelo script. Refaça a instalação das dependências se faltarem compiladores. Um destino incompleto não é sobrescrito automaticamente.
- **`Illegal instruction`:** confira AVX2 e se o arquivo corresponde à arquitetura.
- **Biblioteca ausente:** confira `LD_LIBRARY_PATH` e `ldd "$ORCA_DIR/orca_startup_mpi"`; não copie bibliotecas aleatórias para o sistema.
- **`bad interpreter` ou `$'\r'`:** o script foi salvo com fins de linha Windows. Use a cópia do Git ou salve o arquivo com finais de linha LF no editor.
- **Duas instalações misturadas:** `command -v orca` e `command -v mpirun` devem apontar para os caminhos esperados.

[Próximo: testes serial e paralelo →](03-testar-instalacao.md)
