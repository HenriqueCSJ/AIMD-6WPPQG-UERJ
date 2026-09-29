# Sete exercícios e uma extensão: do input à interpretação

[← Materiais do minicurso](../README.md#materiais-do-minicurso)

> **A pergunta central:** como escolher as condições da dinâmica e interpretar o que os átomos fazem?

**7 de outubro de 2026 · 13h–16h e 17h–18h · remoto**<br>
Henrique de Castro Silva Junior e Virginia Camila Rufino Ferreira

Começamos com uma molécula de água e DFT. Passamos cedo para **XTB2**, ganhamos tempo para testar integração e termostatos e terminamos acompanhando um complexo de Zn²⁺ com etilenodiamina e águas explícitas. Uma extensão opcional retoma a água dentro de C₆₀.

Cada atividade segue três etapas: **prepare, execute e interprete**. O input principal tem entre **13 e 20 linhas**, com comentários curtos. Um pacote reúne o input, a estrutura e, quando necessário, o reinício. Nas páginas HTML, use **Copiar** para levar o conteúdo ao editor. Variantes, preparação e explicações extensas ficam em seções opcionais.

## Comece aqui

1. Conclua o [teste de instalação do ORCA](../tutoriais/03-testar-instalacao.md) e o [teste de XTB2/SOLVATOR](../tutoriais/05-xtb-solvator.md). Recomendamos Ubuntu no WSL2.
2. Mantenha uma cópia completa do repositório. Abra `exercicios/index.html` no navegador, ou leia os README no GitHub. Não é preciso instalar um serviço web para ler as páginas.
3. Baixe o pacote da atividade e extraia os arquivos. Abra o terminal nessa pasta e copie o bloco de execução da página. Ele cria uma pasta nova a cada execução e mantém o terminal na pasta inicial.
4. Abra o [Laboratório de trajetórias](../visualizador/index.html) e carregue o `.out`, o `*-md-ener.csv` e o `*-traj.xyz`. Os gráficos, a animação e as distâncias ficam disponíveis nas três abas.

Os inputs usam **PAL8**: oito processos ORCA ou oito threads na interface XTB2. Se sua máquina tiver menos recursos, ajuste para PAL2 ou PAL4. `%maxcore 256` indica MB por processo, além da memória adicional do programa. Execute **um cálculo por vez**. `Randomize 42` mantém a mesma semente dentro do ambiente usado. O [aplicativo de análise](../visualizador/index.html) inclui exemplos reais e lê seus arquivos localmente. Consulte o [guia](../visualizador/README.md).

## Percurso da aula

### 1. Água com DFT — reconhecer o ciclo

[Abrir exercício 1](1-agua-dft/README.md) · 20 min de aula<br>
Três átomos, uma geometria otimizada e 20 fs de dinâmica. Identifique método, forças, posições e velocidades. **Referência calculada em 80,6 s.**

### 2. Solvente implícito — mudar uma escolha

[Abrir exercício 2](2-solvente-implicito/README.md) · 10 min de aula<br>
Ative CPCM(water) mantendo as demais condições. O número de átomos continua igual. **Referência calculada em 77,7 s.**

### 3. XTB2 e etanol — aumentar a duração

[Abrir exercício 3](3-xtb2-etanol/README.md) · 25 min de aula<br>
Nove átomos e 0,5 ps = 5 × 10⁻¹³ s de NVE. Guarde esse resultado para os dois exercícios seguintes. **Referência calculada em 15,8 s.**

### 4. Timestep — confrontar custo e erro

[Abrir exercício 4](4-timestep/README.md) · 25 min de aula<br>
Provoque uma falha com 5 fs e repita do início com 0,5 fs. O caso ruim para após 15 fs; a correção chega aos 500 fs planejados. **Falha em 2,7 s; correção em 18,8 s.** A comparação fina 0,25/0,5/2 fs fica como apoio.

### 5. Termostato — permitir troca de energia

[Abrir exercício 5](5-termostato/README.md) · 25 min de aula<br>
Reutilize a NVE e acrescente CSVR a 300 K. Compare temperatura e energias; não exija temperatura instantânea constante. **Referência calculada em 13,6 s.**

### 6. Zn–etilenodiamina e SOLVATOR — construir o ambiente

[Abrir exercício 6](6-complexo-solvator/README.md) · 30 min de aula<br>
Acrescente seis águas ao complexo preparado: 25 → 43 átomos. **Referência em 3 min 22 s**; a alternativa com duas águas, de 31 átomos, levou **1 min 4 s**. A estrutura de 43 átomos já relaxada fica disponível para a retomada.

### 7. Dinâmica do complexo — medir coordenação e confinamento

[Abrir exercício 7](7-dinamica-complexo/README.md) · 35 min, após 5 min de retomada<br>
Execute uma trajetória de 2 ps com parede e compare com o controle fornecido sem parede. Acompanhe Zn 0–O 25: a água se afasta sem confinamento. **Referências em aproximadamente 2 min 19 s cada.**

### 8. Água dentro de C₆₀ — extensão opcional

[Abrir exercício 8](8-agua-no-fulereno/README.md) · 10–15 min com referência pronta<br>
63 átomos, 1 ps = 10⁻¹² s e a água visível dentro da gaiola. Compare confinamento molecular com a parede artificial. Usar apenas se houver folga; caso contrário, fica para depois da aula.

## Ritmo e referências

O [roteiro dos ministrantes](roteiro-4h.md) reserva **200 min de conteúdo/prática + 25 min de margem + 15 min de descanso** dentro dos dois blocos. O descanso é de 14h20–14h35; o intervalo oficial é de 16h–17h. As sete execuções obrigatórias são curtas; otimizações e preparação térmica estão fornecidas como apoio.

Os tempos acima foram medidos uma vez por caso, com **ORCA 6.1.1, xTB 6.7.1, PAL8 e Open MPI 4.1.6**, no Ubuntu 24.04.4/WSL2 de um Intel Core Ultra 9 185H. São referências deste ambiente, não promessas de desempenho. Ao todo estão preservadas **21 execuções preservadas (20 normais e uma falha deliberada de timestep)**, incluindo controles, otimizações e preparação.

Se uma execução atrasar, abra o resultado de referência e prossiga, identificando que ele foi fornecido. O aplicativo foi testado localmente com esses arquivos. O ensaio completo da aula e o teste em computador mais modesto ainda precisam ser realizados.

Os inputs completos usados nos resultados originais permanecem dentro de cada pasta `resultados`. As versões para a aula mantêm os parâmetros físicos. No exercício 7, retiramos o registro de Colvars, pois as distâncias são obtidas do XYZ no aplicativo, e usamos a grafia `Walls` do ORCA 6.1.1 para a parede antes escrita como `Cell`.

### Apoio

- [Modelo químico do complexo](complexacao-solvator.md).
- [Manual: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).
- [Manual: XTB2](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html).
- [Manual: SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).
- [Pilotos operacionais anteriores](../resultados/pilotos-progressao/README.md), preservados separadamente dos exercícios.

**Para sair de cada atividade:** anote o que mudou no input, quanto tempo físico foi simulado, uma observação dos dados e uma conclusão que esses dados ainda não permitem.
