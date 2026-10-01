# Apoio · a geometria precisa de um ajuste SCC

[← Voltar à atividade](README.md)

A primeira tentativa substituiu diretamente BLYP/D3/def2-SVP por `! MD XTB2 PAL8`. O cálculo eletrônico SCC oscilou e atingiu 250 iterações sem convergir. **Nenhum passo de dinâmica foi produzido: 0 fs.** Reduzir o timestep não corrige uma falha que ocorre antes da integração.

[Input da tentativa](apoio/falha-scc/al_agua_nh3_xtb2.inp) · [Output preservado](apoio/falha-scc/al_agua_nh3_xtb2.out) · [Registro de execução](apoio/falha-scc/execucao.json)

O retorno do processo foi zero, mas não houve a mensagem de término normal do ORCA. Por isso, o código de saída sozinho não serve como evidência de sucesso.

Com `broydamp=0.1` e `iterations=1000`, o primeiro SCC convergiu em 66 iterações. Todos os 2001 cálculos eletrônicos do teste de 1 fs e todos os 4001 do teste de 0,5 fs convergiram. Não alteramos a geometria, a carga, a temperatura eletrônica de 300 K ou o Hamiltoniano XTB2.

O gap inicial foi aproximadamente 0,128 eV; as ocupações HOMO/LUMO, 1,844/0,156. A convergência numérica resolveu a execução, mas não verifica sozinha a descrição eletrônica do sistema tricationico. O comportamento reativo deve ser apresentado com os limites discutidos na atividade. Não usamos a ocupação fracionária como prova de reação redox.

O controle com 0,5 fs repete os mesmos 2 ps, semente e modelo. As duas trajetórias mostram a mesma transferência com recrossamentos iniciais e separação dos produtos. Não são réplicas estatísticas independentes, e os tempos de evento não representam constantes cinéticas.

Não foi adicionado ALPB(water): fazê-lo definiria outra comparação química. Também não adicionamos parede para manter artificialmente os produtos próximos. Os logs SCC completos estão preservados no diretório local de preparação; os outputs, estruturas, energias e análises usados na aula estão nos links da atividade.
