> **Referência histórica: complexo Zn–en pré-formado.** Este material conserva os sistemas de 25/43 átomos e os resultados antigos. O percurso principal agora começa pelo Zn²⁺ isolado e 20 águas, sem en. [Voltar à atividade atual](README.md).

# 04a · Construir o ambiente com SOLVATOR

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html?exemplo=solvator&aba=trajetoria)

**Parte do bloco Zn–en (45 min com a parede) · Zn²⁺–etilenodiamina · carga +2 · singlete**

> **Pergunta da atividade:** Como acrescentar águas explícitas a um complexo já preparado?

## 1. Prepare

No dímero, duas águas permitiam medir uma ligação H. Ao redor de um metal, precisamos distinguir águas diretamente coordenadas e águas da camada externa. O ponto de partida tem Zn, etilenodiamina e quatro águas: **25 átomos**. O SOLVATOR acrescentará seis águas, chegando a **43 átomos**. ALPB(water) representa o solvente implícito; as águas acrescentadas representam moléculas explícitas. O controle térmico será definido na dinâmica da próxima atividade.

[Baixar os arquivos da atividade](aula-zn_solvator.zip) · [Baixar a estrutura](estruturas/zn_en.xyz)

Extraia o pacote. Ele contém o input e os arquivos que precisam ficar juntos. Use uma pasta para esta atividade.

## 2. Execute

Salve este conteúdo como **`zn_solvator.inp`**; ele já está no pacote.

[Baixar input ORCA](inputs/zn_solvator.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_en.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar pacote com os arquivos necessários](aula-zn_solvator.zip)

<!-- input-source: inputs/zn_solvator.inp -->
```text
# SOLVATOR: acrescenta aguas explicitas ao complexo.
! XTB2 ALPB(water) PAL8
%maxcore 256

%solvator
  # Numero de novas aguas; o soluto fica fixo na montagem.
  nsolv 6
  clustermode docking
  fixsolute true
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_en.xyz
```

**Repare nestas escolhas:**

- `nsolv 6` significa seis águas novas, além das quatro já presentes.
- `fixsolute true` mantém o conjunto inicial fixo durante a montagem.

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca zn_solvator.inp > zn_solvator.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa: executar no Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_solvator.inp > zn_solvator.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

## 3. Veja e interprete

Ative **Coordenação** e **Ligações H** no visualizador. Identifique os dois N da etilenodiamina ligados geometricamente ao Zn e compare águas próximas do metal com as acrescentadas ao redor. **SOLVATOR constrói um arranjo de solvatação**; não é uma trajetória de associação do ligante nem demonstra uma constante de formação. O exercício seguinte pergunta se essa camada externa permanece por perto.


[Carregar meus arquivos no aplicativo](../../visualizador/index.html?exemplo=solvator&aba=trajetoria) · [Comparar estrutura inicial e seis águas adicionadas](../../visualizador/index.html?exemplo=solvator&aba=trajetoria) · [Comparar estrutura inicial e duas águas adicionadas](../../visualizador/index.html?exemplo=solvator_two&aba=trajetoria)

1. Clique em **Limpar sessão** se houver outro exemplo aberto. Carregue `zn_solvator.out`, **`zn_solvator.solvator.xyz`** e a [estrutura inicial `zn_en.xyz`](estruturas/zn_en.xyz) no aplicativo.
2. Mantenha os dois sistemas selecionados. Na aba **Trajetória**, alterne o campo **Simulação** entre a estrutura inicial de 25 átomos e a estrutura solvatada de 43 átomos. O número de átomos mudou como esperado?
3. As seis novas águas estão todas coordenadas ao Zn? Inspecione as posições e distâncias.

> **Para levar:** SOLVATOR constrói uma estrutura candidata. Seu histórico de montagem não é uma trajetória de MD.

<details markdown="1" open><summary>Opcional: montagem mais curta</summary>

Troque seis por duas águas para praticar em menos tempo: o resultado tem 31 átomos. Execute somente uma versão. Na etapa 04b todos usarão o sistema fornecido de 43 átomos.

[Abrir a referência pronta com duas águas adicionadas](../../visualizador/index.html?exemplo=solvator_two&aba=trajetoria). No seletor da trajetória, alterne entre o complexo inicial de 25 átomos e a estrutura de 31 átomos produzida pelo SOLVATOR. Esta comparação mostra as duas estruturas, sem representar uma trajetória de dinâmica.

[Baixar input ORCA](inputs/zn_solvator_2aguas.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_en.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar pacote com os arquivos necessários](aula-zn_solvator_2aguas.zip)

<!-- input-source: inputs/zn_solvator_2aguas.inp -->
```text
# Alternativa curta: acrescenta somente duas aguas.
! XTB2 ALPB(water) PAL8
%maxcore 256

%solvator
  # Numero de novas aguas; o soluto fica fixo na montagem.
  nsolv 2
  clustermode docking
  fixsolute true
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_en.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2 — recomendado</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca zn_solvator_2aguas.inp > zn_solvator_2aguas.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa: executar no Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_solvator_2aguas.inp > zn_solvator_2aguas.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

</details>

Para observar a formação da primeira camada de águas, abra também [Zn, águas e en inicialmente afastados](../7-dinamica-complexo/hidratacao.html). O SOLVATOR desta atividade parte de um complexo preparado; não mostra sua formação por dinâmica.

**Na próxima atividade**, use a estrutura relaxada e o reinício fornecidos. Não é preciso executar otimização e preparação térmica durante a aula.

<details markdown="1"><summary>Referências, preparação e explicações adicionais</summary>

Compare a estrutura inicial com a montagem de seis águas ou com a alternativa de duas águas. Os inputs abaixo permitem reproduzir cada construção.

- **zn_solvator:** [input completo usado](resultados/zn_solvator/zn_solvator.inp) · [saída](resultados/zn_solvator/zn_solvator.out) · [estrutura](resultados/zn_solvator/zn_solvator.solvator.xyz).
- **zn_solvator_2aguas:** [input completo usado](resultados/zn_solvator_2aguas/zn_solvator_2aguas.inp) · [saída](resultados/zn_solvator_2aguas/zn_solvator_2aguas.out) · [estrutura](resultados/zn_solvator_2aguas/zn_solvator_2aguas.solvator.xyz).

[Consultar preparação, números e respostas](historico-apoio.md).

</details>

**Manual:** [SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).

**Antes de avançar:** anote uma mudança no input, uma observação e uma conclusão que esta estrutura ainda não permite.

## Inputs das variantes e preparações

- **preparar_complexo:** [Baixar input ORCA](inputs/preparar_complexo.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_en_inicial.xyz) (obrigatório; manter na mesma pasta do input).
- **relaxar_solvato:** [Baixar input ORCA](inputs/relaxar_solvato.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvator.xyz) (obrigatório; manter na mesma pasta do input).
