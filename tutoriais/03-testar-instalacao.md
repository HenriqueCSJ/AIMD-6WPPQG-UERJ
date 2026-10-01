# Teste sua instalação

[← Tutoriais](README.md)

O teste calcula a energia de uma água, primeiro em um processo e depois em dois. **Não é uma dinâmica molecular.** Faça-o depois de configurar o PATH e abrir um terminal novo.

## Prepare os arquivos

Crie duas pastas, `teste-serial` e `teste-paralelo`, onde quiser guardar os resultados. Copie:

- para `teste-serial`: [agua_serial.inp](../inputs/00-teste-instalacao/agua_serial.inp) e [agua.xyz](../estruturas/agua.xyz);
- para `teste-paralelo`: [agua_parallel.inp](../inputs/00-teste-instalacao/agua_parallel.inp) e o mesmo [agua.xyz](../estruturas/agua.xyz).

O input e o XYZ ficam **na mesma pasta**. Você pode copiá-los pelo gerenciador de arquivos; não é necessário criar pastas com nomes automáticos.

## WSL2 / Ubuntu

Na pasta `teste-serial`, execute:

```bash
orca agua_serial.inp > agua_serial.out &
```

Para acompanhar, use `tail -f agua_serial.out`; Ctrl+C sai desse acompanhamento sem parar o cálculo em segundo plano. Espere o teste terminar e confira **Program Version 6.1.1** e **ORCA TERMINATED NORMALLY** no output.

Só depois entre na pasta `teste-paralelo` e execute:

```bash
orca agua_parallel.inp > agua_parallel.out &
```

Confira o término normal e a indicação de **dois processos MPI** no output. `jobs` mostra se há um cálculo ativo neste terminal. Se houver erro, resolva-o antes de seguir para os exercícios.

## Windows nativo

No Explorador, abra `teste-serial`, digite `cmd` na barra de endereço e pressione Enter. Execute:

```bat
orca agua_serial.inp > agua_serial.out
```

Espere o prompt voltar. Confira a versão **6.1.1** e o término normal no output. Depois abra o Prompt de Comando na pasta `teste-paralelo` e execute:

```bat
orca agua_parallel.inp > agua_parallel.out
```

O resultado deve indicar **dois processos MPI** e término normal. No Windows `cmd`, não acrescente `&` para tentar executar em segundo plano. Se o serial passar, mas o paralelo não encontrar módulos, siga a [correção do guia Windows](02-windows-orca-msmpi.md#se-o-paralelo-nao-encontrar-os-modulos).

## O que conferir

- ORCA **6.1.1** no cabeçalho e término normal em ambos os testes.
- O segundo realmente inicia **dois processos**; abrir o programa não basta.
- Energias finais compatíveis, salvo pequenas diferenças de arredondamento.

O input paralelo contém `%pal nprocs 2 end`. É o ORCA que inicia os processos necessários: **não execute `mpirun orca` ou `mpiexec orca`**. O lançador configurado no Ubuntu fornece internamente o caminho completo recomendado no [manual de execução paralela](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/parallel.html).

Para pedir ajuda, guarde o output e informe sistema, versão do ORCA e MPI. No Ubuntu, `tail -n 30 agua_parallel.out` mostra o final da saída. No Windows, abra o arquivo no editor de texto.

## Verificação desta versão dos materiais

Em 28/09/2026, os dois inputs deste repositório foram executados sequencialmente com uma instalação existente de **ORCA 6.1.1** e **Open MPI 4.1.6 dos pacotes Ubuntu** (`4.1.6-7ubuntu2`), sob Ubuntu 24.04.4/WSL2. Foi usado `/usr/bin/mpirun`, e o módulo paralelo do ORCA carregou a `libmpi.so.40` do sistema. Ambos terminaram normalmente; o segundo iniciou dois processos e as energias finais coincidiram.

Essa verificação confirma os testes de instalação neste ambiente; não cobre todos os módulos do ORCA. Os pacotes MPI já estavam instalados: não foi repetida uma instalação limpa pelo apt. Também não incluiu instalar o Windows/WSL do zero nem baixar novamente o pacote ORCA autenticado do fórum. A rota Windows nativa foi conferida na documentação oficial e na sintaxe dos comandos, mas não foi executada de ponta a ponta nesta revisão.

[Voltar à preparação →](00-preparacao.md)
