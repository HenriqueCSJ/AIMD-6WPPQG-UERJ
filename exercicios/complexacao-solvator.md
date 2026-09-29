# Complexação de Zn²⁺ com etilenodiamina e solvatação explícita

[← Roteiro de 4 horas](roteiro-4h.md)

**Escolha confirmada por Henrique:** Zn²⁺ e um ligante pequeno, etilenodiamina; SOLVATOR deve ser usado durante a aula. **Estado:** preparação computacional concluída com PAL8; [exercício 6](6-complexo-solvator/README.md) e [exercício 7](7-dinamica-complexo/README.md) incluem inputs comentados e resultados reais. Permanece necessário o ensaio integral da aula.

## Caso principal

Modelo de partida: **[Zn(en)(H₂O)₄]²⁺**, com en = H₂N–CH₂–CH₂–NH₂ neutra, 25 átomos, carga +2 e multiplicidade 1. A coordenação inicial de seis doadores é uma condição de partida para observação; não se afirma que seja a única estrutura ou espécie relevante em solução. A química real depende também de pH, concentração e composição, que não serão determinados pela trajetória curta.

Usar o complexo pré-formado resolve um problema pedagógico: permite que todos observem a geometria de coordenação sem depender de uma associação rara acontecer durante a aula. Os alunos vão reconhecer os dois N do ligante, as águas coordenadas, acrescentar solvente e acompanhar movimentos Zn–N/Zn–O.

## Fluxo dos arquivos

1. [Complexo otimizado, 25 átomos](6-complexo-solvator/estruturas/zn_en.xyz), com geometria inicial construída e otimização XTB2/ALPB documentadas.
2. [Input SOLVATOR comentado](6-complexo-solvator/inputs/zn_solvator.inp): acrescenta seis águas; execução real em 201,6 s. A [alternativa de duas águas](6-complexo-solvator/inputs/zn_solvator_2aguas.inp) levou 64,4 s.
3. [Candidato solvatado, 43 átomos](6-complexo-solvator/resultados/zn_solvator/zn_solvator.solvator.xyz).
4. [Relaxação de todos os átomos](6-complexo-solvator/resultados/relaxar_solvato/relaxar_solvato.xyz), convergida em 20,8 s, seguida de [preparação térmica de 100 fs](7-dinamica-complexo/inputs/preparacao_termica.inp). Essa preparação não demonstra equilíbrio convergido.
5. [MD com parede](7-dinamica-complexo/inputs/zn_parede.inp) e [controle sem parede](7-dinamica-complexo/inputs/zn_sem_parede.inp): o mesmo reinício conserva posições e velocidades, e cada etapa acrescenta 0,5 ps. Tempos reais de 26,1 e 25,8 s.
6. [Atividade de leitura de energias, temperatura e distâncias no aplicativo](7-dinamica-complexo/README.md#3-veja-e-interprete). Os doze Colvars permanecem nos [resultados históricos](7-dinamica-complexo/apoio.md#resultados-de-referência); os inputs de aula medem distâncias a partir do XYZ no aplicativo.

Todos usam `XTB2 ALPB(water) PAL8`, com o executável externo configurado como `otool_xtb`. `Native-XTB2` foi rejeitado pelo SOLVATOR no teste anterior com ORCA 6.1.1. [Preparação do xTB](../tutoriais/05-xtb-solvator.md).

A versão de duas águas produz **31 átomos** e é uma alternativa para praticar SOLVATOR. Para a dinâmica, todos retomam a referência comum de **43 átomos**, relaxada e fornecida no exercício 7. Não comparar diretamente energias absolutas de composições diferentes. O [roteiro](roteiro-4h.md) reserva 30 min para reconhecer o complexo, executar SOLVATOR e inspecionar o candidato.

No SOLVATOR, o arquivo intermediário `.solvator.solventbuild.xyz` mostra a inserção de moléculas, não intervalos regulares de tempo. O `.solvator.xyz` final fornece as coordenadas de partida. O potencial de parede usado automaticamente na construção não é transportado no XYZ: configurar `Walls` separadamente na MD, conforme os inputs de aula testados no ORCA 6.1.1. [Documentação do SOLVATOR](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).

## Perguntas que os alunos podem responder

- Os dois nitrogênios permanecem próximos do Zn? As distâncias oscilam em torno de valores semelhantes?
- Que águas estão mais próximas do metal? Há reorganização das águas externas?
- A temperatura e as energias são compatíveis com a configuração NVT escolhida?
- Alguma molécula atinge a parede? O raio comprime o aglomerado desde o início?
- Qual observação é um movimento estrutural, e qual seria evidência de mudança de coordenação?

Não ensinar ligação como simples traço no visualizador: algoritmos de desenho podem manter uma conectividade fixa ou usar um corte geométrico. As distâncias oferecem uma verificação explícita.

## Extensão para associação/troca de ligante

Se houver tempo após o ensaio, preparar uma segunda condição com Zn aquoso e en próximos, mas sem a ligação inicial. Para comparar composições, conservar **os mesmos átomos, carga e solvente**. Um esquema idealizado é [Zn(H₂O)₆]²⁺ + en ↔ [Zn(en)(H₂O)₄]²⁺ + 2 H₂O: os dois lados têm 31 átomos, antes de adicionar águas externas. Isso evita comparar diretamente um sistema que tem seis águas com outro que perdeu duas do arquivo.

Essa extensão não garante associação em poucos ps. Não aquecer excessivamente, reduzir a caixa nem impor uma restrição para produzir uma “reação espontânea” sem declarar a intervenção. Dinâmica enviesada pode ser apresentada depois como outro problema metodológico. Não calcular constante de formação, energia livre ou barreira a partir de uma diferença entre duas energias instantâneas.

## O que foi conferido e o que falta ensaiar

Foram conferidos carga +2, multiplicidade 1, número e ordem dos átomos, término normal dos cálculos, convergência das otimizações, duração física e correspondência das distâncias do CSV com o XYZ. SOLVATOR gerou 31 e 43 átomos nas duas versões. Os controles partem de um reinício comum. Na trajetória com parede, os N permanecem aproximadamente a 1,91–2,16 Å do Zn. A parede suave permite ultrapassar o raio: os máximos observados foram 6,608 Å com parede e 7,283 Å sem parede.

O timestep de 0,5 fs do complexo foi usado nas referências NVT, mas não recebeu aqui um estudo próprio de convergência NVE. A comparação sistemática de timestep da aula usa etanol. Não extrapolar seu diagnóstico como validação quantitativa do complexo. O aplicativo local já oferece a visualização; faltam ensaio integral da aula e teste em equipamento mais modesto. Zn d¹⁰ simplifica a discussão de spin, mas não valida automaticamente a química de coordenação do método semiempírico.
