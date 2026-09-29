# Condução do minicurso · 4 horas

[← Percurso do aluno](README.md)

**7 de outubro de 2026, horário de Brasília.** A programação reserva 13h–16h e 17h–18h. Dentro dessas quatro horas há 15 min de descanso: **225 min de atividade**, dos quais **25 min são margem**, além do intervalo oficial de 1 h. Não preencher antecipadamente a margem com conteúdo obrigatório.

## Ordem e tempo

- **13h00–13h15:** abertura, conferência curta da instalação e ciclo energia–força–movimento.
- **13h15–13h45:** exercícios 1–2, dímero de água com DFT, ligação H e CPCM. A otimização já é fornecida. O participante executa o vácuo; CPCM pode ser uma demonstração com resultado pronto se necessário.
- **13h45–14h10:** exercício 3, etanol/XTB2. Meça o diedro e reconheça libração. Mostre brevemente o contraste com a referência em etapas, deixando o programa para o bloco 5.
- **14h10–14h20:** margem para dúvidas e recuperação.
- **14h20–14h35:** descanso.
- **14h35–15h00:** exercício 4, degradação com 2,5 fs, diagnóstico dos primeiros 75 fs, correção para 0,5 fs. Reutilize o controle do exercício 3 se não houver tempo para repetir a correção.
- **15h00–15h25:** exercício 5, etanol em cinco etapas no mesmo input. Execute uma vez; acompanhe a rampa do alvo e meça a torsão. O programa não reinicializa velocidades entre os `Run`.
- **15h25–15h55:** exercício 6, complexo Zn²⁺–en e SOLVATOR. Escolha seis águas ou a variante curta de duas. Diferencie coordenação de camada externa.
- **15h55–16h00:** margem e organização para a retomada.
- **16h00–17h00:** intervalo oficial, sem cálculo obrigatório em andamento.
- **17h00–17h05:** retomada com estrutura e restart fornecidos.
- **17h05–17h40:** exercício 7, uma MD com parede; controle sem parede já fornecido. Meça Zn 0–O 25, Zn–N e examine contatos H.
- **17h40–17h50:** margem; H₂O@C₆₀ somente se houver folga.
- **17h50–18h00:** fechamento: cada participante sustenta uma interpretação com uma medida.

## Perguntas que dão sentido às execuções

**1–2, dímero:** comparar a ligação covalente O–H com o contato H···O e o ângulo D–H···A. CPCM modifica o campo de forças sem construir uma rede de moléculas de solvente. A água isolada de 20 fs saiu do percurso principal e permanece como teste de execução opcional; ela não informa sobre água líquida ou rede de ligações H.

**3, etanol NVE:** controlar o observável. A câmera pode girar sem modificar o diedro interno. O controle de 0,5 ps mostra libração, não troca conformacional; a ligação O–H vibra sem se romper. É útil como referência íntegra para o teste numérico seguinte.

**4, timestep:** olhar a energia antes de a temperatura explodir. Em 75 fs, o caso de 2,5 fs ainda mostra T de 269 K, embora ΔE já seja +43,6 kJ/mol. A referência termina depois de 325 fs registrados. Reduzir o passo, restaurar a geometria original e preservar a duração-alvo de 500 fs. Não chamar a distorção numérica de reação.

**5, programa de temperatura:** 0,5 ps a 300 K; rampa de 1 ps até 600 K; 2 ps a 600 K; rampa de 1 ps até 300 K; mais 0,5 ps a 300 K. O diedro C–C–O–H visita orientações de sinais opostos. O protocolo deliberadamente altera temperatura e dura mais que o controle; não atribuir causalidade isolada ao aquecimento nem extrair populações/velocidades de equilíbrio. `Run` consecutivos continuam a mesma trajetória. `Ramp` atua no próximo `Run`; depois permanece seu alvo final.

**6–7, complexo:** SOLVATOR gera um arranjo de águas; não simula a associação do ligante nem mede constante de formação. ALPB, água explícita e parede têm papéis diferentes. Reter O 25 a 4,19 Å do Zn não o torna diretamente coordenado. Sem parede, a mesma água termina a 9,13 Å neste modelo de aglomerado. Traços do viewer são critérios geométricos, não análise eletrônica de ligação.

**8, C₆₀:** mostrar reorientação e confinamento pelas interações reais do modelo molecular. Não há parede artificial nesse input; a simulação não descreve inserção através da gaiola ou efeitos de rotor quântico.

## Operação ao vivo

Inputs curtos, comentados e PAL8; uma execução de cada vez. Com recursos menores, ajustar PAL2/PAL4. A instalação deve ter sido testada antes do encontro. Evitar reexplicar todo o fluxo de arquivos em cada atividade: executar → carregar `.out`, CSV e XYZ → medir → interpretar.

Dar até **5 min** a um primeiro caso DFT ou ao SOLVATOR, e até **3 min** ao etanol em etapas, antes de abrir os dados fornecidos. Isso é um limite operacional da aula, não uma previsão de desempenho. A referência de etanol em etapas levou 150,1 s; a de falha com 2,5 fs, poucos segundos; MD do complexo, aproximadamente 139 s por caso, no Intel Core Ultra 9 185H / WSL2 com PAL8. Tempos exatos ficam junto de cada resultado em `execucao.json`.

Uma divisão possível é Henrique conduzir a interpretação e Virginia apoiar participantes com dificuldades. Preservar as pausas. Não condicionar a segunda parte a concluir a preparação computacional durante o intervalo. A versão de aula é uma **working candidate** até o ensaio integral pelos ministrantes e a conferência em computador mais modesto.

[Manual do ORCA: comandos sequenciais, termostatos e integração](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).
