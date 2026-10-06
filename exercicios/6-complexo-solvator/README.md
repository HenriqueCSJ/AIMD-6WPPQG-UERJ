# 04a · Zn²⁺ isolado + 20 águas com SOLVATOR

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html?exemplo=zn_solvation&aba=trajetoria)

**Bloco Zn²⁺ → águas → en · carga +2 · singlete · sem en nesta etapa**

> **Pergunta:** como construir um ambiente de águas explícitas a partir somente do íon Zn²⁺?

## 1. Comece pelo íon isolado

O soluto inicial contém **um único átomo: Zn**. O SOLVATOR acrescenta **20 moléculas de água**. A contagem final esperada é **1 + 20 × 3 = 61 átomos**, sem etilenodiamina (en). ALPB(water) representa o ambiente implícito; as 20 águas são moléculas explícitas.

A en entra somente em 04c, depois de estudarmos a hidratação e o efeito das paredes em 04b.

## 2. Execute a montagem

[Baixar input ORCA](inputs/zn_ion_20h2o_solvator.inp) · [Baixar pacote da montagem](aula-zn_ion_20h2o_solvator.zip) · [Consultar o Zn isolado em XYZ](estruturas/zn2_isolado.xyz)

O Zn inicial está escrito dentro do input; não há XYZ auxiliar obrigatório nesta execução.

<!-- input-source: inputs/zn_ion_20h2o_solvator.inp -->
```text
# Etapa 04a: apenas Zn2+ como soluto; acrescentar 20 aguas.
! XTB2 ALPB(water) PAL8
%maxcore 256
%solvator
  nsolv 20
  clustermode stochastic
  fixsolute true
end
* xyz 2 1
Zn 0.0 0.0 0.0
*
```

- `nsolv 20` acrescenta vinte águas ao íon isolado.
- `fixsolute true` mantém o Zn fixo durante a montagem.
- `clustermode stochastic` seleciona o procedimento de construção indicado no input.

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Na pasta do input, com ORCA já [instalado](../../tutoriais/01-wsl2-ubuntu-orca.md):

```bash
orca zn_ion_20h2o_solvator.inp > zn_ion_20h2o_solvator.out &
```

Espere encerrar antes de iniciar outro cálculo. Veja [como acompanhar](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

No Prompt de Comando (`cmd`), na pasta do input, com ORCA e MS-MPI [configurados](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_ion_20h2o_solvator.inp > zn_ion_20h2o_solvator.out
```

Espere o prompt voltar antes de iniciar outro cálculo.

</details>

## 3. Confira a estrutura gerada

[Abrir 04a no laboratório](../../visualizador/index.html?exemplo=zn_solvation&aba=trajetoria) · [Carregar meus arquivos](../../visualizador/index.html?exemplo=zn_solvation&aba=trajetoria)

**A nova montagem de 20 águas está disponível como referência estática.** No laboratório, alterne entre o Zn isolado, a montagem SOLVATOR bruta e a preparação radial para 04b. Para seus próprios arquivos, execute a montagem e carregue a saída `.out` e **`zn_ion_20h2o_solvator.solvator.xyz`**. Confira o término no `.out` antes de usar a geometria.

1. Verifique **61 átomos**, sendo um Zn, 20 O e 40 H; não deve haver N.
2. Meça as distâncias Zn–O e observe quais águas ficam mais próximas.
3. Ative **Coordenação** e **Ligações H**. Os traços são critérios geométricos; a estrutura XYZ não contém ordens de ligação.
4. Preserve a geometria **bruta** gerada pelo SOLVATOR. Em 04b, use o XYZ de partida já fornecido na página para comparar com as quatro trajetórias de referência.

**SOLVATOR fornece uma estrutura candidata de solvatação.** A montagem não é uma trajetória de dinâmica molecular, não demonstra equilíbrio e não mede uma constante de formação. Não chame o histórico de construção de filme de hidratação.

## 4. Continue com a geometria fornecida para 04b

**A execução da aula usa somente ORCA.** Em [04b](../7-dinamica-complexo/README.md#geometria-copiar-e-colar-ou-baixar), copie o XYZ completo e salve-o como **`zn_20h2o_inicial.xyz`**, na mesma pasta do input de MD. Você também pode baixar esse arquivo, se preferir. Ele já está pronto: não há etapa de ajuste das águas a executar.

### Origem da geometria de referência

SOLVATOR pode colocar águas próximas já na montagem. Na referência nova conferida, **três O já estão abaixo de 2,6 Å do Zn**. Isso impede chamar todo contato inicial de coordenação formada pela dinâmica.

O XYZ fornecido para 04b foi preparado previamente: cada água foi transladada rigidamente **0,8 Å para fora**, na direção radial Zn→O. O e seus dois H receberam a mesma translação; a geometria interna da água foi preservada e o Zn permaneceu na origem. Isso explica por que as trajetórias de referência começam sem contatos abaixo de 2,6 Å. **É a origem do arquivo pronto, não uma tarefa da aula.** Esse arquivo não é a saída bruta do SOLVATOR, uma otimização ou um resultado de MD.

[Baixar o pacote de resultados da montagem](resultado-zn_ion_20h2o_solvator.zip) · [Baixar a montagem bruta](resultados/zn_ion_20h2o_solvator/zn_ion_20h2o_solvator.solvator.xyz) · [Saída SOLVATOR](resultados/zn_ion_20h2o_solvator/zn_ion_20h2o_solvator.out) · [Baixar o XYZ pronto de 04b](estruturas/zn_20h2o_inicial.xyz)

Conserve os dois arquivos separados: a montagem bruta `.solvator.xyz` e a preparação **`zn_20h2o_inicial.xyz`** de 04b. Se você refizer SOLVATOR, não presuma que sua montagem será idêntica; confira os contatos e use a geometria comum fornecida para reproduzir a comparação pronta.

## Antes de avançar

Registre a contagem de águas, uma distância Zn–O e uma conclusão que a montagem ainda não permite. Siga para **[04b · Hidratação sem en e paredes](../7-dinamica-complexo/README.md)**.

[Entenda o modelo e confira a contagem](apoio.md) · [Histórico: complexo Zn–en pré-formado, 25/43 átomos](historico.md)

**Manual:** [SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).
