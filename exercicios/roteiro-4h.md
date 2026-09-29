# Roteiro progressivo — minicurso de 4 horas

[← Exercícios](README.md) · [Visualizador de energias](visualizador-energias.md)

**Data:** 7 de outubro de 2026, horário de Brasília. **Estado:** sete exercícios preparados, com inputs comentados e 15 execuções reais PAL8. As páginas estão no [percurso do aluno](README.md). Falta o ensaio integral pelos ministrantes e a conferência em computador mais modesto. O planejamento reserva **200 minutos de conteúdo e prática + 25 minutos de margem**, além das pausas.

O percurso é **água com DFT → solvatação implícita → GFN2-xTB → passo de integração → termostato → complexação Zn²⁺–etilenodiamina → SOLVATOR → dinâmica em solvente explícito e confinamento**. Aumentar uma dificuldade por vez, mantendo os inputs curtos e os gráficos como apoio à interpretação. GFN2-xTB é um método semiempírico de estrutura eletrônica: preserva o ciclo energia–forças–movimento, mas não é DFT nem um campo de força clássico.

## Distribuição do encontro

| Horário | Atividade | Tempo |
| :--- | :--- | :--- |
| 13h00–13h15 | Abertura: conferência rápida e introdução | 15 min |
| 13h15–13h45 | 1–2. Água com DFT e alteração do mesmo input para CPCM | 30 min |
| 13h45–14h10 | 3. XTB2 e primeira trajetória de etanol | 25 min |
| 14h10–14h20 | Margem para dúvidas e recuperação da turma | 10 min |
| 14h20–14h35 | Descanso | 15 min |
| 14h35–15h00 | 4. Timestep: executar uma variação e comparar referências | 25 min |
| 15h00–15h25 | 5. Termostato: reutilizar NVE e executar CSVR/NVT | 25 min |
| 15h25–15h55 | 6. Complexo Zn²⁺–etilenodiamina, ALPB e SOLVATOR | 30 min |
| 15h55–16h00 | Margem e organização dos arquivos para a retomada | 5 min |
| 16h00–17h00 | Intervalo oficial na programação | 60 min |
| 17h00–17h05 | Retomada: abrir o caso preparado e recordar a pergunta | 5 min |
| 17h05–17h40 | 7. MD do complexo: uma execução, coordenação e confinamento | 35 min |
| 17h40–17h50 | Margem para análise e dúvidas; extensão somente se houver folga | 10 min |
| 17h50–18h00 | Síntese, interpretação de um resultado e próximos passos | 10 min |

São **240 minutos reservados ao minicurso**, incluindo 15 minutos de descanso: **225 minutos de atividade, ou 3h45**, além do intervalo externo de 1 hora. Não prometer quatro horas líquidas de atividade dentro desses horários. Não depender de deixar cálculos rodando durante o intervalo.

Os **25 minutos de margem** já pertencem a esses 225 minutos, não são tempo adicional. Servem para dúvidas, transições entre ferramentas e recuperação de atrasos. Se não forem consumidos, usar para interpretação; não preencher antecipadamente com conteúdo obrigatório. Manter descanso, intervalo oficial e fechamento.

As sete etapas conceituais não são sete oficinas independentes: DFT/CPCM formam uma atividade; a trajetória NVE de etanol é reutilizada em timestep e termostato; o complexo tem arquivos intermediários preparados para permitir retomada sem esperar a conclusão do bloco anterior.

## Como conduzir cada exercício

Apresentar uma pergunta; apontar as linhas do input que a controlam; cada participante executa um caso curto; abrir trajetória e CSV; responder à pergunta usando uma observação. Explicações de teoria entram nesse momento, em blocos de poucos minutos. Manter saídas de referência disponíveis para quem tiver problema de instalação ou computador lento.

**Ensaio computacional realizado com PAL8:** água/DFT em 81 s, água/CPCM em 78 s; etanol NVE/NVT em 16/14 s; timestep fino em 45 s e grosseiro em 6 s; SOLVATOR com seis águas em 202 s e com duas em 64 s; MD do complexo em 26 s. Esses tempos foram medidos no Intel Core Ultra 9 185H dos ministrantes, com WSL2. Reservar até **2 min por água/DFT**, **3 min por etanol** e **5 min por SOLVATOR ou MD do complexo** antes de recorrer à saída fornecida. O SOLVATOR principal excedeu a meta anterior de 3 min; a alternativa de duas águas já está disponível. Conferir os tempos também em computador mais modesto. Rodar um cálculo por vez; PAL8 é a referência, com PAL2/PAL4 como ajustes aos recursos do aluno. O MPI deve ter sido testado antes do curso.

A abertura é uma conferência, não uma sessão de instalação: quem não passar no teste acompanha com as saídas de referência e recebe apoio em paralelo. Os ministrantes podem alternar explicação e atendimento sem parar toda a turma.

**Execução mínima por participante: sete cálculos curtos** — água DFT, água DFT/CPCM, etanol NVE, uma variação de timestep, etanol NVT, SOLVATOR e MD do complexo. A troca DFT → XTB2 na água fica em demonstração curta do ministrante; a terceira curva de timestep e a MD sem parede são referências já calculadas. Relaxação e preparação térmica do complexo são explicadas com arquivos intermediários fornecidos, sem exigir que todos completem essa cadeia ao vivo.

Cada bloco inclui editar, salvar, executar, localizar os arquivos, abrir e interpretar. O tempo de CPU ocupa apenas uma parte. Distribuir inputs comentados, estruturas e saídas por etapa; alunos alteram poucas linhas, sem redigitar um input inteiro. Na abertura, reservar no máximo 5 min para conferência e cerca de 10 min para a introdução conceitual.

**Visualização no Laboratório de trajetórias.** O [aplicativo local](../visualizador/index.html) já lê outputs, CSV e XYZ e inclui os exemplos reais. Usar suas três abas para energias/temperatura, animação e distâncias Zn–N/Zn–O; não montar gráficos em planilha durante a aula. O ensaio integral ainda deve verificar abertura em até 2 min no computador do aluno, incluindo a passagem WSL → Windows. As medidas podem ser calculadas do XYZ, sem acrescentar Colvars ao input.

Sugestão de divisão a combinar: Henrique conduz a explicação e Virginia acompanha dúvidas e participantes atrasados. Não interromper toda a turma por uma instalação individual. Um cálculo que ultrapassa o limite deixa de ser condição para acompanhar: abrir a saída de referência, identificar sua origem e prosseguir; não tratar o resultado fornecido como cálculo executado pelo aluno.

## 1. Água com DFT: do input ao movimento

**Sistema:** H₂O, 3 átomos, neutra, singlete. Usar para a aula uma geometria previamente otimizada e identificada. **Método de partida:** BLYP/def2-SVP, com convergência SCF apertada, escolhido como demonstração barata do procedimento, não como recomendação universal de precisão.

**Alvo inicial:** 40 passos de 0,5 fs = 20 fs = 0,020 ps = 2 × 10⁻¹⁴ s. É uma trajetória de demonstração, sem pretensão de equilíbrio ou estatística convergida. Uma extensão para 100 passos fica opcional após o ensaio.

- Localizar método, carga/multiplicidade, estrutura e bloco `%md`.
- Distinguir posição inicial de velocidade inicial e temperatura solicitada.
- Executar, confirmar término normal e abrir o XYZ de múltiplas geometrias.
- Abrir as séries de energia cinética K, potencial U, total E e temperatura T; reconhecer a relação E = K + U no caso simples.

**Pergunta:** os átomos se movem porque a geometria é otimizada a cada passo? Não: o gradiente determina a aceleração, e o integrador avança no tempo. Com apenas três átomos, T instantânea pode oscilar fortemente; não usar esse caso para cobrar uma linha plana em 300 K.

**Critério de conclusão:** localizar os arquivos produzidos e distinguir tempo físico de tempo de execução. A validação de conservação de energia será tratada no exercício 4.

## 2. A mesma água, agora com solvente implícito

Manter estrutura, passo, duração e semente de velocidades; acrescentar `CPCM(water)` ao cálculo DFT. A comparação curta isola a mudança do modelo de ambiente, não estima uma energia livre de solvatação nem uma distribuição de equilíbrio.

**Pergunta:** onde estão as moléculas do solvente? O modelo contínuo modifica a energia e as forças sem acrescentar moléculas explícitas. Não deve ser confundido com termostato nem com uma caixa que impede fragmentos de se afastarem. A ativação não garante uma diferença visual grande em uma trajetória de 20 fs.

**Critério de conclusão:** reconhecer no input e na saída que o modelo foi ativado e explicar o que ele representa. [Documentação de solvatação do ORCA](https://www.faccts.de/docs/orca/6.1/manual/contents/essentialelements/solvationmodels.html).

**Tempo conjunto dos exercícios 1–2:** aproximadamente 20 min para a primeira execução/análise e 10 min para acrescentar CPCM e comparar. O ganho vem de reutilizar a molécula, a pasta-modelo e os controles já apresentados; não se exige uma segunda explicação completa do fluxo.

## 3. Trocar o motor eletrônico e aumentar o sistema

O ministrante mostra rapidamente a troca para **GFN2-xTB**, `XTB2`, no caso de água, para mostrar que o bloco de dinâmica continua o mesmo. Essa demonstração não acrescenta uma execução obrigatória por participante. A partir daqui, todos os exercícios obrigatórios usam GFN2-xTB.

Depois passar ao **etanol, 9 átomos**, com geometria preparada. Alvo comum para o ensaio dos exercícios 3–5: **NVE, 1.000 passos de 0,5 fs = 0,5 ps = 5 × 10⁻¹³ s**, inicialização a 300 K e semente fixada. Guardar essa trajetória para as comparações seguintes. Se o ensaio exigir a versão curta, usar **400 passos = 0,2 ps = 2 × 10⁻¹³ s** e ajustar também as comparações de timestep e termostato para esse mesmo intervalo físico. Comparar animação e arquivos de energia. O xTB tem um Hamiltoniano diferente: não comparar energias absolutas DFT e xTB como se tivessem o mesmo zero ou usar o pequeno teste como medida universal de aceleração.

**Instalação:** como o curso também usará SOLVATOR, a rota principal passa a ser `XTB2`, com o executável externo xTB 6.7.1 instalado como `otool_xtb`. O teste local confirmou MD e SOLVATOR por essa rota. O `Native-XTB2` funciona para MD/ALPB, mas foi rejeitado pelo SOLVATOR no ORCA 6.1.1 testado; não é substituto para o curso inteiro. [Preparar xTB para SOLVATOR](../tutoriais/05-xtb-solvator.md).

## 4. Timestep: estabilidade e custo

**Sistema:** o mesmo etanol com GFN2-xTB, sem termostato, sem parede nem outros vieses. Partir da mesma geometria e das mesmas velocidades: manter a mesma semente e demais parâmetros. Usar convergência eletrônica consistente.

Proposta para o ensaio, mantendo **0,5 ps = 5 × 10⁻¹³ s** em todas as trajetórias:

- 0,25 fs = 2,5 × 10⁻¹⁶ s, 2.000 passos: referência mais fina.
- 0,5 fs = 5 × 10⁻¹⁶ s, 1.000 passos: ponto de partida da aula.
- 2,0 fs = 2 × 10⁻¹⁵ s, 250 passos: teste deliberadamente mais grosseiro para ligações envolvendo H sem restrições.

Não usar o mesmo número de passos nas três execuções: isso mudaria também o tempo simulado. **Reutilizar o caso de 0,5 fs do exercício 3; cada participante executa 2,0 fs**, deixando 0,25 fs como extensão opcional e recebendo as três referências prontas. Não prometer que 2 fs sempre causará uma explosão; a evidência é o comportamento da energia e da estrutura no caso ensaiado.

**Gráficos:** K e U trocando energia, E total, e ΔE(t) = E(t) − E(0), com unidades e escala visível. Oscilação limitada e deriva sistemática são diferentes. Passo maior resolve pior os movimentos mais rápidos; convergência SCF ruim também pode provocar deriva. O termostato deve ficar desligado neste diagnóstico, pois a troca de energia com o banho confundiria a interpretação.

**Critério de conclusão:** escolher um passo com base no compromisso entre custo e erro observado, não apenas porque o cálculo terminou.

## 5. Termostato: temperatura controlada, energia trocada

**Sistema:** etanol; reutilizar a NVE do exercício 3 e executar **uma** trajetória NVT com a mesma geometria, velocidades iniciais, duração e timestep. Alvo de ensaio: 0,5 ps = 5 × 10⁻¹³ s, 1.000 passos de 0,5 fs. A versão curta de 0,2 ps só deve ser usada com a NVE correspondente. Uma trajetória de 1 ps ou mais pode ser fornecida para discussão se o ensaio demonstrar utilidade; não é outra execução obrigatória.

Comparar a NVE com **CSVR a 300 K**, constante de tempo de 100 fs, mantendo também a inicialização em 300 K para reutilizar o caso anterior. Para tornar o resfriamento visível, o ministrante pode mostrar um par adicional previamente calculado, NVE e NVT ambos inicializados em 600 K; não comparar esse caso com a NVE iniciada em 300 K como se apenas o termostato tivesse mudado. Essa preparação é uma demonstração, não uma inferência de cinética. Reservar 10 fs versus 100 fs de acoplamento como extensão.

**Perguntas:** definir `Initvel 300_K` mantém a temperatura em 300 K? Não. Um termostato deve manter T instantânea perfeitamente plana? Não. Em NVT, K + U precisa ser constante? Não, pois o sistema troca energia com o banho.

Usar CSVR como opção principal. Apresentar Nosé–Hoover chains como alternativa; mencionar Berendsen apenas para pré-equilíbrio, sem tratá-lo como amostrador canônico correto. Uma curva curta não comprova amostragem canônica convergida. Constante de acoplamento menor significa atuação mais forte; o termostato não deve ser usado para esconder instabilidade numérica.

A coluna `Cons.Qty` do ORCA é distinta de `E_Tot`; não renomeá-la como energia molecular total no visualizador. [Termostatos no manual](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat).

## 6. Complexação Zn²⁺–etilenodiamina, ALPB e SOLVATOR

**Sistema escolhido por Henrique:** Zn²⁺ com etilenodiamina (en). Modelo inicial proposto: **[Zn(en)(H₂O)₄]²⁺**, 25 átomos, carga +2, multiplicidade 1. Zn(II) d¹⁰ evita, neste exemplo, comparar diferentes estados de spin. A etilenodiamina é tratada como ligante neutro; esse modelo não determina especiação ácido–base ou dependência de pH.

**Pergunta química:** como o ligante bidentado e as águas se organizam ao redor do metal? O modelo começa com dois N e quatro O coordenados; a manutenção dessa coordenação deve ser observada, não imposta nem presumida. Usar GFN2-xTB como demonstração exploratória e verificar se a geometria resultante é quimicamente razoável antes de adotá-la como material da aula.

Dividir os **30 minutos** em reconhecimento do complexo/ALPB (7 min), parâmetros do SOLVATOR (5 min), execução (5 min, incluindo operação dos arquivos), inspeção (8 min) e organização da retomada (5 min). Fornecer a estrutura de partida previamente preparada, preservando a construção do solvente como atividade do aluno:

1. Identificar metal, doadores N e águas da primeira esfera; conferir carga e multiplicidade.
2. Usar `XTB2 ALPB(water)` para o ambiente contínuo. O solvente implícito não é termostato nem parede.
3. Usar SOLVATOR para acrescentar **6 moléculas de água**, formando um candidato com **43 átomos**. Se o ensaio não atender ao limite de tempo, adotar 2 águas, **31 átomos**, como versão curta. Preparar uma referência compatível com a versão escolhida para a turma; não comparar energias absolutas de sistemas com números de águas diferentes.
4. Abrir o `nome.solvator.xyz` gerado e distinguir águas coordenadas iniciais das novas águas. O histórico `nome.solvator.solventbuild.xyz` mostra a montagem, não uma trajetória temporal de MD.
5. Conferir colisões e identificar o passo seguinte: relaxar o conjunto e preparar a dinâmica. Mostrar as estruturas e saídas intermediárias fornecidas; a relaxação completa não é outra execução obrigatória durante esses 30 min. `FIXSOLUTE TRUE` vale para a construção do solvente; a MD posterior deve deixar o complexo móvel, salvo restrições explicitamente estudadas.

**SOLVATOR constrói uma condição inicial; não simula por si só a associação do ligante nem produz uma solução equilibrada.** A rota `DOCKING`, padrão, é a principal para poucas águas. `STOCHASTIC` fica como comparação opcional de velocidade e qualidade inicial. Não escolher um grande `RADIUS` que acrescente centenas de moléculas durante a aula. [SOLVATOR no manual](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).

Os [inputs, geometrias e resultados do complexo](6-complexo-solvator/README.md) já estão preparados e executados. O complexo otimizado mantém dois N a aproximadamente 2,04 Å e quatro O entre 2,06 e 2,08 Å do Zn. Essas distâncias verificam a condição didática inicial, sem validar quantitativamente a descrição do metal por XTB2. [Detalhamento do caso de complexação](complexacao-solvator.md).

## 7. Dinâmica do complexo solvatado: coordenação e parede

Retomar o complexo preparado pelo SOLVATOR, **[Zn(en)(H₂O)₄]²⁺ + 6 H₂O**, 43 átomos, usado como referência comum por todos, inclusive quem executar a alternativa de SOLVATOR com 31 átomos. Não transportar essa alternativa para a MD de 43 átomos sem uma preparação própria. Distribuir uma geometria comum previamente relaxada, com a origem e as etapas intermediárias identificadas. O aluno inspeciona seu próprio resultado do SOLVATOR, mas não precisa concluir uma otimização para acompanhar a MD. Usar GFN2-xTB, ALPB e CSVR a 300 K, com alvo de ensaio de **0,5 ps = 5 × 10⁻¹³ s**, 1.000 passos de 0,5 fs. Extensão para 1 ps somente se o ensaio demonstrar tempo adequado. Não depender de deixar o cálculo rodando na pausa oficial.

Após **5 min de retomada**, distribuir os **35 min do bloco** em inspeção da geometria e preparação fornecida (5 min), configuração da MD (5 min), execução (8 min, incluindo os arquivos), análise de energias/temperatura e coordenação (12 min) e conclusão (5 min). A preparação térmica deve constar nos arquivos fornecidos e ser explicada; não declarar equilíbrio só porque passaram algumas centenas de passos. Não impor montagem, otimização, equilíbrio e duas MD como uma cadeia obrigatória dentro desse bloco.

**Observáveis:** K, U, E e T; distâncias Zn–N dos dois doadores; distâncias Zn–O relevantes. O módulo MD pode gravar distâncias como variáveis coletivas; essa saída complementa o visualizador de energias sem exigir reconstruir ligações a partir de uma animação. Começar com distâncias individuais; número de coordenação exige definir um critério e não deve ser presumido de ligações desenhadas automaticamente.

Cada participante executa **uma MD com parede** e compara com referências com/sem parede previamente calculadas, a partir da mesma estrutura e preparação, mantendo ALPB e termostato iguais. Executar a segunda trajetória fica opcional. O aglomerado é finito e não usa condições periódicas. Sua energia total em NVT pode variar por troca com o banho.

`Walls` define uma parede harmônica suave de MD no ORCA 6.1.1; o manual ainda a descreve na seção `Cell`. Para esfera, escolher centro, raio e rigidez; os átomos que ultrapassarem a fronteira recebem automaticamente a força repulsiva. Sintaxe do exercício 7: o raio de **6 Å** foi escolhido após medir a geometria centralizada, cujo raio atômico máximo é 5,087 Å:

```text
# Parede suave: centro na origem, raio em angstrom; nao e caixa periodica.
# Rigidez em kJ mol-1 A-2; os atomos podem ultrapassar o raio e receber forca.
Walls Sphere 0, 0, 0, 6_A Spring 10.0
```

`Spring 10.0` está em kJ mol⁻¹ Å⁻². Centralizar e medir a estrutura antes de escolher o raio, com folga e sem compressão inicial. O comando não escolhe automaticamente esse raio. Parede muito rígida pode exigir timestep menor. [Cell na MD](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell).

**Há duas paredes diferentes no fluxo:** a do SOLVATOR/DOCKING é criada automaticamente durante a montagem do solvente; a `Walls` é definida no novo input de MD. Um arquivo XYZ transfere coordenadas, não configurações de confinamento. Portanto, não supor que a parede de montagem acompanha o complexo na dinâmica.

Se nenhuma água atingir a parede, relatar essa observação e usar uma trajetória de apoio previamente preparada para discutir um caso de interação com a fronteira. Não comprimir arbitrariamente o sistema para forçar um efeito, nem usar a parede para esconder uma explosão numérica.

**Complexação na escala da aula:** partir do complexo já coordenado permite estudar sua reorganização. Uma trajetória sem troca de ligantes não demonstra inércia cinética ou estabilidade termodinâmica. Uma associação espontânea a partir de Zn hidratado e en separados fica como extensão previamente ensaiada; não é um evento garantido em 0,5–1 ps.

## Extensão se houver folga e fechamento obrigatório

O desafio deixou de ocupar 15 min obrigatórios. Se a turma estiver em dia, usar parte da margem de 17h40–17h50 para escolher **uma** mudança: timestep, temperatura-alvo, acoplamento térmico, ALPB ou raio da parede. Escrever a previsão e comparar com um caso disponível; nova execução só se couber. Não alterar tudo ao mesmo tempo. Se houver atraso, converter em atividade posterior ao curso.

**Fechamento de 17h50–18h00:** cada participante identifica um input, a duração física, uma curva ou distância e uma conclusão com sua limitação. Perguntas de síntese: o que o timestep controla, o que o termostato troca, o que SOLVATOR prepara e o que uma MD curta permite observar? Não exigir reação química espontânea, metadinâmica, barreira de energia livre ou espectro como parte obrigatória dessas quatro horas.

## Se a turma atrasar

- **Até 10 min:** absorver na próxima margem; manter as pausas e o fechamento.
- **Entre 10 e 25 min:** usar as margens restantes, retirar a extensão e ler referências para um cálculo que não terminou. Preservar SOLVATOR, uma MD do complexo e sua interpretação.
- **Acima de 25 min:** o atraso excede a reserva global. Converter uma repetição de timestep/termostato em leitura guiada de referências e usar o XYZ preparado para a MD. Participantes com instalação travada seguem pela análise; não estender a aula para compensar.

As margens não são intercambiáveis sem limite: há 15 min antes das 16h e 10 min depois das 17h. Às 15h25 iniciar o bloco Zn/SOLVATOR; se necessário, concluir termostatos com a referência. Às 15h55 guardar os arquivos e encerrar a primeira parte até 16h. Às 17h40 passar à interpretação com os dados disponíveis; às 17h50 iniciar o fechamento.

## O que já foi verificado e o que falta ensaiar

Em 28/09/2026 foram feitos quatro testes iniciais curtos com a água didática do repositório: DFT, DFT/CPCM, GFN2-xTB nativo e GFN2-xTB/ALPB/CSVR/Cell. Todos terminaram normalmente e geraram CSV e XYZ. Depois, MD com XTB2 externo e SOLVATOR/XTB2 também foram testados com sucesso; SOLVATOR/Native-XTB2 foi rejeitado antes de calcular. A rota externa foi adotada para o curso por esse motivo. [Dados e limites dos pilotos](../resultados/pilotos-progressao/README.md).

Esses pilotos confirmam sintaxe, execução básica e formato da saída. Os exercícios completos agora estão nas sete pastas numeradas: geometrias otimizadas, etanol e complexo Zn²⁺–en cronometrados, SOLVATOR com duas/seis águas, parede escolhida com folga inicial, comparação de timestep no etanol e contraste NVE/NVT. A água dos pilotos antigos não foi previamente otimizada; seus transientes não substituem as referências atuais.

Antes da aula, testar os casos obrigatórios também em um computador mais modesto, preparar versões curtas e conferir a visualização de trajetória escolhida. Toda comparação deve identificar método, ambiente, geometria inicial, semente, timestep, número de passos, termostato e parede.
