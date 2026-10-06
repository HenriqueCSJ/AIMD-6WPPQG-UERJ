# Apoio · a geometria precisa de um ajuste SCC

[← Voltar à atividade](README.md)

A primeira tentativa substituiu diretamente BLYP/D3/def2-SVP por `! MD XTB2 PAL8`. O cálculo eletrônico SCC oscilou e atingiu 250 iterações sem convergir. **Nenhum passo de dinâmica foi produzido: 0 fs.** Reduzir o timestep não corrige uma falha que ocorre antes da integração.

[Input da tentativa](apoio/falha-scc/al_agua_nh3_xtb2.inp) · [Output preservado](apoio/falha-scc/al_agua_nh3_xtb2.out) · [Registro de execução](apoio/falha-scc/execucao.json)

O retorno do processo foi zero, mas não houve a mensagem de término normal do ORCA. Por isso, o código de saída sozinho não serve como evidência de sucesso.

Com `broydamp=0.1` e `iterations=1000`, o primeiro SCC convergiu em 66 iterações. Todos os 2001 cálculos eletrônicos do teste de 1 fs e todos os 4001 do teste de 0,5 fs convergiram. Não alteramos a geometria, a carga, a temperatura eletrônica de 300 K ou o Hamiltoniano XTB2.

O gap inicial foi aproximadamente 0,128 eV; as ocupações HOMO/LUMO, 1,844/0,156. A convergência numérica resolveu a execução, mas não verifica sozinha a descrição eletrônica do sistema tricationico. O comportamento reativo deve ser apresentado com os limites discutidos na atividade. Não usamos a ocupação fracionária como prova de reação redox.

O controle com 0,5 fs repete os mesmos 2 ps, semente e modelo. As duas trajetórias mostram a mesma transferência com recrossamentos iniciais e separação dos produtos. Não são réplicas estatísticas independentes, e os tempos de evento não representam constantes cinéticas.

Neste agregado isolado, os produtos podem se afastar livremente. Acrescentar ALPB ou parede mudaria as condições químicas; para estudar apenas a convergência SCC, mantenha o modelo e ajuste o controle eletrônico descrito acima. Os outputs e medidas estão nos links da atividade.

## Diagnóstico: falha SCC antes da MD, 0 fs

<!-- input-source: apoio/falha-scc/al_agua_nh3_xtb2.inp -->
```text
# Caso fornecido: Al3+ + 6 aguas + NH3, agora com XTB2.
! MD XTB2 PAL8
%maxcore 256
%md
  # Semente fixa para reproduzir as velocidades iniciais.
  Randomize 42
  Initvel 300_K
  # Preserva o passo e o banho do exemplo; conferir a sensibilidade ao passo.
  Timestep 1.0_fs
  Thermostat Berendsen 300_K Timecon 20.0_fs
  Dump Position Stride 1 Filename "al_agua_nh3_xtb2-traj.xyz"
  # 2000 x 1 fs = 2 ps = 2e-12 s.
  Run 2000
end
# Carga total +3 e multiplicidade 1; geometria original sem pre-otimizacao.
* xyzfile 3 1 al_agua_nh3.xyz
```
