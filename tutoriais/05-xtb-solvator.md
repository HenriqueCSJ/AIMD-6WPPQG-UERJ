# XTB2 e SOLVATOR: confira antes da aula

[← Tutoriais](README.md) · [Exercício de complexação](../exercicios/complexacao-solvator.md)

Nos inputs do minicurso usaremos **`! XTB2`**, acrescentando `ALPB(water)` quando houver solvente implícito. Não é necessário chamar o programa xTB manualmente durante os exercícios: o ORCA faz essa chamada.

**Se XTB2 e SOLVATOR já funcionam no seu computador, não reinstale nada.** Primeiro execute o teste abaixo. No ambiente Linux/WSL2 dos ministrantes, ORCA 6.1.1 chamou o xTB externo 6.7.1, disponível como `otool_xtb` na pasta do ORCA. Essa é a configuração verificada para a aula.

## 1. Teste com duas águas adicionais

Crie uma pasta de execução nova e copie para ela o input [agua_solvator_external.inp](../inputs/03-solvatacao/pilotos-validacao/agua_solvator_external.inp). O arquivo já contém uma molécula de água; SOLVATOR acrescenta outras duas. Execute somente este cálculo, em serial.

Entre na pasta do input. **Ubuntu / WSL2:**

```bash
orca agua_solvator_external.inp > agua_solvator_external.out &
```

**Windows nativo — Prompt de Comando (`cmd`):**

```bat
orca agua_solvator_external.inp > agua_solvator_external.out
```

Espere o cálculo terminar. No Ubuntu, `tail -f agua_solvator_external.out` acompanha a saída; Ctrl+C sai apenas do acompanhamento. No Windows, espere o prompt voltar. Não inicie outro cálculo enquanto este estiver ativo.

Confira `ORCA TERMINATED NORMALLY`, o término normal do SOLVATOR e o arquivo final com **9 átomos** na primeira linha. Abra esse XYZ no Avogadro. A montagem não é uma trajetória de MD: é uma condição inicial para um cálculo posterior.

O piloto Linux/WSL2 terminou normalmente em 7,385 s neste computador; esse tempo não é uma previsão para outros sistemas. A variante Windows deste teste ainda precisa de verificação local.

## 2. Somente se o ORCA não encontrar o xTB

Para Linux, o [manual da interface xTB](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html) orienta instalar a versão 6.7.1 ou posterior e disponibilizar o executável como `otool_xtb` junto ao ORCA. Para reproduzir o ambiente ensaiado, use 6.7.1 no Linux.

### WSL2 / Ubuntu — rota recomendada

1. Confira se já existe e funciona:

   ```bash
   otool_xtb --version
   ```

2. Se estiver ausente, obtenha o [pacote oficial xTB 6.7.1 para Linux x86-64](https://github.com/grimme-lab/xtb/releases/download/v6.7.1/xtb-6.7.1-linux-x86_64.tar.xz), listado na [página da versão](https://github.com/grimme-lab/xtb/releases/tag/v6.7.1). Extraia o arquivo em uma pasta de software dentro do Linux e localize o executável `bin/xtb`.
3. Copie esse executável para a pasta que contém `orca`, com o nome `otool_xtb`. No exemplo, **substitua o caminho de origem pelo caminho real**. A opção `-n` preserva um arquivo existente; se já houver uma versão que falha, guarde-a com outro nome antes de substituí-la.

   ```bash
   cp -n /CAMINHO/DO/XTB/bin/xtb "$ORCA_DIR/otool_xtb"
   chmod u+x "$ORCA_DIR/otool_xtb"
   otool_xtb --version
   ```

4. Repita o teste SOLVATOR em uma pasta nova. Se aparecer uma biblioteca ausente, confira a mensagem e as instruções da distribuição oficial; não considere a instalação concluída apenas porque o arquivo foi copiado.

### Windows nativo

O instalador do ORCA 6.1 configura **`XTBEXE`** para o executável xTB fornecido. Primeiro confira no Prompt de Comando novo:

```bat
echo %XTBEXE%
"%XTBEXE%" --version
```

Se XTB2 já funciona, mantenha essa instalação. Se precisar instalar outra versão, obtenha o pacote oficial na [página do xTB 6.7.1](https://github.com/grimme-lab/xtb/releases/tag/v6.7.1); o [arquivo Windows](https://github.com/grimme-lab/xtb/releases/download/v6.7.1/xtb-6.7.1pre-windows-x86_64.zip) está identificado como **6.7.1pre**, diferente do binário Linux ensaiado. Extraia-o com suas bibliotecas. Em **Variáveis de ambiente**, ajuste `XTBEXE` para o caminho completo do **arquivo `xtb.exe` real**, não apenas da pasta. Abra um terminal novo e repita o teste.

Esta é a orientação da [instalação oficial do ORCA 6.1](https://www.faccts.de/docs/orca/6.1/manual/contents/quickstartguide/installation.html#how-do-i-install-the-xtb-module). No Linux o nome esperado é `otool_xtb`; no Windows, mantenha a distribuição fornecida e use `XTBEXE`. Não baixe DLLs de sites avulsos. A rota Windows continua dependente de passar no teste local.

## 3. Diagnóstico rápido

- **`otool_xtb` não encontrado:** conferir nome, pasta do ORCA e permissão de execução no Linux.
- **`Native-XTB2` rejeitado pelo SOLVATOR:** usar `XTB2`. A implementação nativa funcionou nos pilotos de MD, mas foi rejeitada pelo SOLVATOR no ORCA 6.1.1 testado.
- **Teste termina, mas o XYZ não existe:** conferir a saída completa, o diretório de trabalho e o nome do input; não usar um XYZ antigo como prova do novo teste.
- **Arquivo com 9 átomos e término normal:** preparação básica conferida; guardar a saída para identificar a versão utilizada.

O uso de `XTB2` não exige mudar o Open MPI do tutorial. O teste deste guia é serial; os [testes de MPI](03-testar-instalacao.md) continuam sendo uma verificação separada.

Referências consultadas em 28/09/2026: [interface xTB](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html), [SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html) e [distribuição oficial xTB](https://github.com/grimme-lab/xtb/releases/tag/v6.7.1). [Resultados dos pilotos](../resultados/pilotos-progressao/README.md).
