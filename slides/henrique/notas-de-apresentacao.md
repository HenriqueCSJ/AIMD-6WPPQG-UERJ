# Notas de apresentação — introdução

[← Slides e PDF](README.md)

**Objetivo:** dar aos participantes uma explicação curta que permita entender o que o ORCA fará na atividade prática. Reservar aproximadamente cinco minutos para os quatro slides de conteúdo.

## Slide 2 — dinâmica molecular clássica

Começar pela geometria: os átomos têm posições, e essas posições determinam distâncias, ângulos e torções. Um campo de força associa uma energia a essa geometria usando expressões e parâmetros definidos para o modelo escolhido.

Percorrer a decomposição de `U_FF` da esquerda para a direita:

- **Ligações:** custo energético de alongar ou comprimir uma ligação.
- **Ângulos:** custo de alterar o ângulo entre ligações.
- **Torções:** variação da energia ao girar em torno de uma ligação.
- **Não ligadas:** contribuições de van der Waals e eletrostática.

A decomposição é ilustrativa de campos de força moleculares convencionais. Alguns modelos incluem termos adicionais. `U_FF` significa aqui energia do campo de força; a notação não escolhe o modelo Universal Force Field (UFF).

Explicar o gradiente em palavras: a força indica como a energia varia quando deslocamos um átomo. Dividindo a força pela massa, obtemos sua aceleração. A partir das posições e velocidades atuais, o integrador avança um pequeno intervalo de tempo. Repetimos o processo para construir a trajetória; a energia e as forças mudam conforme a geometria muda.

### Exemplo oral opcional: uma ligação

Se for útil concretizar uma parcela, usar o termo harmônico local:

\[
U_{\mathrm{lig}}(r)=\tfrac12 k(r-r_0)^2,
\qquad
F_r=-\frac{dU_{\mathrm{lig}}}{dr}=-k(r-r_0).
\]

`r` é o comprimento da ligação, `r₀` a distância de equilíbrio e `k` a constante de força. `F_r` é a força generalizada ao longo dessa coordenada. Alongar ou comprimir a ligação gera uma força restauradora. Esse é apenas um termo do modelo, válido como exemplo perto do equilíbrio.

## Slide 3 — dinâmica de Born–Oppenheimer no ORCA

Começar pela composição da energia, em paralelo à decomposição de `U_FF` no slide anterior:

\[
E_{\mathrm{BO}}(\mathbf R)=E_{\mathrm{el}}(\mathbf R)+V_{\mathrm{NN}}(\mathbf R).
\]

`E_el` é a contribuição eletrônica **sem a repulsão entre núcleos**: contém a energia cinética dos elétrons, sua atração pelos núcleos e a interação entre elétrons. `V_NN` é a repulsão entre os núcleos. A soma fornece a energia potencial para o movimento nuclear; não inclui a energia cinética dos núcleos.

Apontar então que a equação de Newton é a mesma. A mudança está na obtenção da energia e das forças: para cada geometria, o método eletrônico escolhido — DFT, por exemplo — calcula uma aproximação para a energia e seu gradiente.

Percorrer os três passos do slide. Durante cada cálculo eletrônico, as posições nucleares ficam fixas. Depois, o integrador atualiza posições e velocidades, e o cálculo se repete para a nova geometria. O esquema é conceitual: o ORCA usa Velocity Verlet para a integração no tempo, que envolve forças na geometria atual e na seguinte.

`E_BO` é a energia potencial total de Born–Oppenheimer, incluindo a contribuição eletrônica e a repulsão entre os núcleos. No caso introdutório tratado aqui, os núcleos são clássicos e o cálculo eletrônico acompanha o estado fundamental. Não se está fazendo uma otimização completa da geometria a cada passo de dinâmica.

Ao relacionar a expressão à saída do ORCA, observar a convenção: no bloco `TOTAL SCF ENERGY`, `Total Energy` já inclui `Nuclear Repulsion`. Não somar essa parcela novamente ao total. A composição do slide é conceitual; correções adicionais do método escolhido devem permanecer consistentes entre energia e gradiente.

## Escalas de tempo em segundos — apoio para os slides 4 e 5

Apontar as equivalências nos slides antes de comparar os métodos:

- **1 ns = 10⁻⁹ s = 0,000000001 s:** um bilionésimo de segundo.
- **1 ps = 10⁻¹² s = 0,000000000001 s:** um trilionésimo de segundo.
- **1 fs = 10⁻¹⁵ s = 0,000000000000001 s:** um quadrilionésimo de segundo.

Cada unidade é mil vezes menor que a anterior: **1 ns = 1.000 ps** e **1 ps = 1.000 fs**. Nos exemplos: **10 ps = 10⁻¹¹ s = 0,00000000001 s** de tempo simulado; o passo de **0,5 fs = 5 × 10⁻¹⁶ s** divide esse intervalo em 20.000 passos. O benchmark de **31 ns/dia** corresponde a aproximadamente **3,1 × 10⁻⁸ s de tempo simulado por dia de execução**. Tempo físico simulado e duração do cálculo no computador são grandezas diferentes.

## Slide 4 — MD clássica: escala e custo

Começar pelo ganho de escala: a MD clássica favorece sistemas maiores e trajetórias mais longas. Apresentar os números em destaque e depois percorrer vantagens e limitações.

**MD clássica:** o menor custo por passo permite simular muitos átomos e acumular mais tempo físico com um orçamento computacional limitado. A faixa ilustrativa de `10³–10⁶` átomos descreve capacidades de programas especializados, como o GROMACS, em recursos adequados. Não é um limite máximo nem uma promessa de desempenho do ORCA, do WSL ou do notebook de cada participante. O tamanho viável depende do modelo e do computador; as trajetórias podem alcançar ns e, em condições apropriadas, µs ou mais.

**Número publicado de execução:** o CSCS informa **31,243 ns/dia** para **1.403.182 átomos** no GROMACS 2024.1, com **uma GPU na plataforma NVIDIA GH200**. O sistema contém proteínas hEGFR, membrana, água e íons. O slide arredonda esses valores para **1,4 milhão** e **31 ns/dia**. Trata-se de equipamento de HPC; o tempo inclui o trabalho da CPU e da GPU. “ns/dia” significa tempo físico simulado por dia de execução, não a duração total da trajetória publicada. Não extrapolar esse número para outro sistema ou computador. [Fonte: CSCS, seção Scaling](https://docs.cscs.ch/software/sciapps/gromacs/#scaling).

A qualidade depende dos parâmetros e de sua adequação à química estudada. Campos convencionais, com conectividade fixa, não descrevem a formação e a quebra de ligações. Existem campos clássicos reativos, como ReaxFF, mas eles também precisam de parametrização apropriada e têm custo próprio. Portanto, não dizer que toda MD clássica é incapaz de descrever reações.

## Slide 5 — AIMD: química, custo e amostragem

Fazer a passagem para a descrição eletrônica: a AIMD permite tratar a resposta eletrônica e reações, com custo computacional maior. Separar a escala indicativa à esquerda do exemplo de 10 ps à direita: este não é um limite nem uma duração obrigatória.

**AIMD:** o cálculo eletrônico acompanha a geometria, permitindo descrever redistribuição eletrônica e formação ou quebra de ligações. Essa capacidade depende do método eletrônico e do estado tratado. Calcular energia e forças eletrônicas repetidamente custa mais por passo; para um orçamento semelhante, isso costuma restringir o número de átomos e a duração da trajetória. AIMD não elimina aproximações nem garante melhor resultado para qualquer propriedade.

A ordem de **10² átomos e trajetórias de ps** é uma referência didática para AIMD/DFT convencional, não um teto tecnológico. A introdução de [Lu et al.](https://arxiv.org/html/2004.11658#S1) descreve essa escala para cálculos rotineiros e também menciona métodos de escala linear capazes de sistemas muito maiores. O resultado de milhões de átomos destacado no título daquele artigo é obtido com um potencial de aprendizado de máquina; não é um cálculo DFT completo a cada passo. O slide usa somente a discussão introdutória sobre AIMD convencional.

Poder descrever uma reação não significa que ela ocorrerá durante a trajetória curta do minicurso. **Duração da transformação e tempo de espera são coisas diferentes:** a passagem entre reagente e produto pode ser rápida, enquanto as condições para ultrapassar a barreira aparecem raramente. Barreiras, temperatura, condições iniciais e tempo de amostragem influenciam sua observação. Uma trajetória sem reação não demonstra que a reação seja impossível. Esse problema também existe em MD clássica; o maior custo por passo costuma torná-lo mais restritivo em AIMD direta. Os núcleos continuam clássicos nos dois tratamentos apresentados aqui.

Apontar primeiro as equivalências em segundos na base do slide e o destaque de 10 ps = 10⁻¹¹ s. Explicar a conta no bloco superior direito: **tempo simulado** é o intervalo físico da trajetória; **tempo de execução** é quanto o computador demora para produzi-la. Para simular **10 ps** com passo de **0,5 fs**, são necessários **20.000 passos**. **Se** o custo médio for **10 segundos por passo**, a estimativa será `20.000 × 10 / 3.600 = 55,56 horas`, arredondada para **56 h**. É um exemplo condicional, não um benchmark medido de ORCA. O manual do ORCA descreve custos de segundos a minutos por passo; o passo de 0,5 fs é sua recomendação para sistemas contendo hidrogênio.

Os dois exemplos têm naturezas diferentes: o número da MD clássica foi medido pelo CSCS; o da AIMD ilustra como estimar a execução a partir de um custo por passo. Eles não constituem uma comparação controlada e não devem ser divididos para anunciar um fator de aceleração. Não foram executados benchmarks locais nesta iteração.

### Mensagem central: reação rápida, espera longa

Encerrar o slide apontando a frase em destaque. O obstáculo para estudar eventos raros pode ser acumular tempo suficiente até observar transições, e depois observar transições suficientes para obter estatística. Métodos como metadinâmica e umbrella sampling ajudam a explorar regiões pouco visitadas, mas o tempo de uma trajetória enviesada não deve ser interpretado automaticamente como tempo físico de reação. [Piccini et al., revisão sobre AIMD e amostragem aprimorada](https://doi.org/10.1039/D1CY01329G).

### Pergunta opcional: há um limite de 30–50 ps?

Não apresentar esse intervalo como prazo universal de coerência ou validade de AIMD. [Reuter, Stampfl e Scheffler, preprint de 2004, Tabela I na página 3](https://arxiv.org/pdf/cond-mat/0404510#page=3) listam cerca de 50 ps como escala computacionalmente acessível naquele contexto histórico. A duração viável depende do sistema, método e recursos. Isso é diferente da convergência estatística e da validade das aproximações físicas usadas. Não transformar o número histórico em um teto atual.

**Detalhe avançado, apenas se perguntarem sobre validade física de trajetórias longas:** em trajetórias quase clássicas inicializadas com energia de ponto zero (ZPE) por modo vibracional, a propagação clássica pode transferir energia de modos de alta frequência para modos de baixa frequência ou translação, sem preservar os limites quânticos de energia modal. Esse vazamento pode produzir dissociações não físicas ou distribuições incorretas de produtos. Conservar a energia total não garante preservar a distribuição de ZPE. O problema depende do sistema e da preparação; não implica que toda trajetória do minicurso sofrerá esse artefato, nem fornece um corte universal em 30–50 ps. [Shu et al., PCCP 2018](https://doi.org/10.1039/C8CP04914A). Manter essa explicação nas notas para preservar a brevidade da introdução prática.

## Passagem para a atividade prática

Associar a explicação às escolhas que o participante fará: fornecer uma estrutura XYZ, escolher o método eletrônico, definir o passo de tempo e as velocidades iniciais, executar a dinâmica e observar a trajetória. Mostrar cada escolha no input quando a atividade prática começar.

## Referências

- [ORCA 6.1 — Molecular Mechanics](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/mm.html)
- [ORCA 6.1 — Molecular Dynamics, fundamentos e Velocity Verlet](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html)
- [ORCA 6.1 — componentes da energia na saída](https://www.faccts.de/docs/orca/6.1/tutorials/first_steps/input_output.html#the-output-file)
- [GROMACS — capacidades e escala dos sistemas](https://www.gromacs.org/about.html)
- [LAMMPS — ReaxFF e dependência da parametrização](https://docs.lammps.org/pair_reaxff.html)
- [CSCS — benchmark GROMACS/GH200](https://docs.cscs.ch/software/sciapps/gromacs/#scaling)
- [Lu et al. — contexto de escala da AIMD convencional, introdução](https://doi.org/10.1016/j.cpc.2020.107624)

- [Piccini et al. — eventos raros e amostragem aprimorada em AIMD](https://doi.org/10.1039/D1CY01329G)
- [Reuter et al. — escala de 50 ps no contexto histórico de 2004, Tabela I](https://arxiv.org/abs/cond-mat/0404510)
- [Shu et al. — manutenção de ZPE em trajetórias quase clássicas](https://doi.org/10.1039/C8CP04914A)
