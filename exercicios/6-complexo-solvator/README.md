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
4. Preserve a geometria **bruta** gerada pelo SOLVATOR; a geometria de partida de 04b será uma preparação didática declarada, não uma cópia idêntica dessa saída.

**SOLVATOR fornece uma estrutura candidata de solvatação.** A montagem não é uma trajetória de dinâmica molecular, não demonstra equilíbrio e não mede uma constante de formação. Não chame o histórico de construção de filme de hidratação.

## 4. Distinga a montagem bruta da preparação para hidratar

SOLVATOR pode colocar águas próximas já na montagem. Na referência nova conferida, **três O já estão abaixo de 2,6 Å do Zn**. Isso impede chamar todo contato inicial de coordenação formada pela dinâmica.

Para observar as águas se aproximarem em 04b, usamos uma **preparação didática explícita**: cada água é transladada rigidamente **0,8 Å para fora**, na direção radial Zn→O. O e seus dois H recebem a mesma translação; a geometria interna da água é preservada. O Zn permanece na origem. Essa preparação remove os contatos iniciais abaixo do corte de 2,6 Å e não é uma otimização nem um resultado de MD.

[Baixar o pacote de resultados da montagem](resultado-zn_ion_20h2o_solvator.zip) · [Baixar a montagem bruta](resultados/zn_ion_20h2o_solvator/zn_ion_20h2o_solvator.solvator.xyz) · [Saída SOLVATOR](resultados/zn_ion_20h2o_solvator/zn_ion_20h2o_solvator.out) · [Baixar a preparação radial](estruturas/zn_20h2o_inicial.xyz)

Conserve os dois arquivos separados: a montagem bruta `.solvator.xyz` e a preparação **`zn_20h2o_inicial.xyz`** de 04b. Se você refizer SOLVATOR, não presuma que sua montagem será idêntica; confira os contatos e use a geometria comum fornecida para reproduzir a comparação pronta.

<details markdown="1"><summary>Opcional: reproduzir a preparação com Python 3</summary>

Para reproduzir a translação sobre a sua saída SOLVATOR, baixe **[preparar_aguas.py](preparar_aguas.py)** (também incluído no pacote da montagem). Requer somente Python 3, sem bibliotecas adicionais. O aluno pode usar diretamente a estrutura preparada fornecida e seguir a aula sem Python.

Na pasta do script e do XYZ bruto, execute:

```text
python preparar_aguas.py zn_ion_20h2o_solvator.solvator.xyz
```

No Ubuntu, use `python3` se esse for o comando da instalação. O script escreve **`zn_20h2o_inicial.xyz`**, preservando o arquivo bruto. Ele verifica 61 átomos na ordem Zn seguida de vinte grupos O–H–H, coordenadas finitas e águas intactas. Centraliza o Zn na origem e desloca **O e seus dois H juntos**, 0,8 Å para fora na direção Zn→O, mantendo a geometria interna.

O script rejeita uma montagem que ainda tenha O a **2,6 Å ou menos** do Zn, ou qualquer átomo a **6,5 Å ou mais** do centro. Também recusa sobrescrever um destino existente. Como sua montagem SOLVATOR pode diferir da referência, uma recusa pede usar a estrutura fornecida para a comparação da aula; não significa que a saída bruta foi alterada. O script não executa ORCA, otimização nem dinâmica.

</details>

## Antes de avançar

Registre a contagem de águas, uma distância Zn–O e uma conclusão que a montagem ainda não permite. Siga para **[04b · Hidratação sem en e paredes](../7-dinamica-complexo/README.md)**.

[Entenda o modelo e confira a contagem](apoio.md) · [Histórico: complexo Zn–en pré-formado, 25/43 átomos](historico.md)

**Manual:** [SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).
