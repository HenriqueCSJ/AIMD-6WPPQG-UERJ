# 04c · en: primeiro N assistido, segundo N livre

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Núcleo da aula · 20 min após o intervalo · interpretar resultado pronto · 97 átomos**

> **Pergunta:** como as águas coordenam o Zn e como uma en passa de um para dois N coordenados?

[**Abrir hidratação → primeiro N assistido → segundo N livre**](../../visualizador/index.html?exemplo=chelation&aba=trajetoria) · [Baixar os arquivos e inputs](resultado-chelation-continuous.zip)

**Depois de estudar a hidratação sem en em 04a–b, passamos ao ligante.** A trajetória pronta abaixo é uma **referência independente de 97 átomos**, preparada anteriormente; ela não foi calculada a partir da nova saída do SOLVATOR nem dos controles de hidratação de 61 átomos. Dentro desta referência, o percurso acompanha o mesmo sistema: **Zn²⁺, 20 águas e três etilenodiaminas (en)**. No início, dez oxigênios estão a 3,1 Å do Zn, dez a 5,0 Å e todos os N, a pelo menos 6,5 Å. Ao final, há **quatro águas e uma en bidentada** na primeira esfera. **Apenas N 61 recebeu ajuda para se aproximar. N 64 e as águas não receberam restrições externas para induzir a coordenação.**

## 1. Veja a sequência nos cálculos prontos

Selecione **04c · en: primeiro N assistido → segundo N livre** no aplicativo. O controle **Trecho para repetir** permite observar cada etapa com calma; **Trajetória completa** percorre todas. O relógio exibido é o **tempo acumulado da sequência**, de 0 a 10083 fs.

1. **Hidratação · 0–500 fs.** As águas se aproximam sem força imposta Zn–O. A primeira cruza o corte de 2,6 Å em **33,5 fs**; seis águas, até **66,5 fs**.
2. **Encontro com a en · 500–7083 fs.** O Zn permanece hidratado; a en alcança uma posição de encontro, ainda sem coordenação Zn–N.
3. **Primeiro N assistido · 7083–8083 fs.** Uma restrição atua somente em **Zn 0–N 61**. O primeiro contato abaixo de 2,6 Å ocorre em **7623 fs da sequência**, ou 540 fs no relógio desta execução.
4. **Segundo N livre · 8083–10083 fs.** A restrição de N 61 foi removida. **N 64 entra sem guia**, fecha o quelato e os dois N permanecem coordenados até o fim. A entrada ocorre em **8636,75 fs pelos registros de distância**; o primeiro quadro XYZ que a mostra está em 8637 fs.

**Intervenção em 7083 fs:** a geometria de encontro é selecionada da primeira dinâmica. As posições são preservadas, mas as velocidades são reinicializadas a 300 K, com semente 93001, e o relógio da nova execução volta a zero. A partir daí, o aplicativo mostra **7083 fs + o tempo local**. Portanto, este é um percurso didático com uma reinicialização declarada, e não uma única dinâmica com velocidades contínuas. Compare cada etapa no intervalo indicado antes de interpretar o tempo acumulado como tempo de um evento.

## 2. Confirme que o fechamento é bidentado

Os índices começam em zero. Compare **Zn 0–N 61** e **Zn 0–N 64**, ambos da mesma en intacta. Uma associação com apenas um N é monodentada. A coordenação bidentada exige contato simultâneo pelos dois doadores.

Nos registros de distância a cada 0,25 fs, os dois N permanecem estritamente abaixo de 2,6 Å de **1553,75 a 3000 fs do relógio local**, por **1,44625 ps**. No eixo da sequência, esse intervalo é **8636,75–10083 fs**. Veja a [verificação numérica](resultados/chelation_continuous/verificacao.json).

Compare também **Zn 0–O 7** e **Zn 0–O 25**. Essas águas saem acima de 3,0 Å em **8415 fs** e **8906 fs da sequência**, respectivamente, conforme os XYZ gravados a cada 1 fs. Depois da hidratação, a sequência de contatos é **6O → 6O1N → 5O1N → 5O2N → 4O2N**. Ao final são seis átomos doadores, distribuídos em cinco moléculas ligantes.

Os cortes de distância são critérios geométricos de acompanhamento, não ordens de ligação. As três en e as águas permanecem intactas nos trechos utilizados.

## 3. Relacione movimento, energia e temperatura

Os gráficos junto à molécula mostram os valores medidos de **U, K, E e temperatura**. Observe primeiro a hidratação; depois a aproximação do primeiro N e o fechamento livre do segundo.

A restrição do primeiro N é uma mola de limite superior, com constante de **200 kJ mol⁻¹ Å⁻²**. Durante 1 ps, o limite diminui de **3,886868 para 2,2 Å**. A força é zero quando a distância fica abaixo desse limite. Após esse período, a restrição é removida.

Em **7083 fs**, a reinicialização muda a temperatura de **284,90 para 300 K**. K e E aumentam **0,006958 Eh**, enquanto U permanece igual na precisão impressa. Esse salto deve ser atribuído à intervenção, não à formação de uma ligação. A linha dos gráficos é interrompida nessa fronteira. No trecho assistido, a mola móvel também realiza trabalho; o termostato troca calor durante todo o percurso.

O protocolo usa **GFN2-xTB/ALPB(water)**, timestep de **0,25 fs**, **CSVR a 300 K** e parede esférica de **9 Å**. O acoplamento térmico é 20 fs nos primeiros 500 fs e 100 fs depois. A etapa sem viés de coordenação continua com termostato e parede. As curvas não fornecem, por si só, entalpia, energia livre ou velocidade experimental de associação.

A passagem do primeiro para o segundo N deve ser lida junto à remoção da restrição. Fechar o quelato depois dessa intervenção mostra a evolução deste sistema preparado; não mede a velocidade espontânea de associação em solução.

<details markdown="1"><summary>Arquivos, resolução e etapas do percurso</summary>

## 4. Arquivos e resolução

O [ZIP](resultado-chelation-continuous.zip) conserva XYZ, CSV, inputs, saídas e checkpoints de cada etapa. A [descrição do percurso](resultados/chelation_continuous/curso.json) identifica os intervalos usados, os relógios originais e a reinicialização. O aplicativo usa uma prévia de cerca de 6 mil quadros reais, preservando as fronteiras; nenhuma posição é interpolada. As energias não são reduzidas nem deslocadas verticalmente.

O terceiro arquivo de hidratação foi interrompido após 9864 fs. O percurso usa somente seu trecho registrado até **7083 fs**, anterior à interrupção; nenhum intervalo faltante foi preenchido. As duas etapas posteriores de coordenação terminaram normalmente.

[Trecho anterior de 3 ps, começando no encontro](../../visualizador/index.html?exemplo=chelation_previous&aba=trajetoria) · [Pacote anterior](resultado-chelation.zip) · [Manual ORCA: restrições e restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html)

</details>

**Entrega da dupla:** identifique a hidratação, o primeiro N assistido, o segundo N livre e as águas que saem. Explique quais variações de energia podem estar relacionadas às intervenções do protocolo.

## Inputs das variantes e preparações

- **m01a_N_sem_vies_agua:** [Baixar input ORCA](inputs/m01a_N_sem_vies_agua.inp) · [Baixar geometria inicial (.xyz)](estruturas/encontro_real_R1.xyz) (obrigatório; manter na mesma pasta do input).
- **m02_livre_apos_N1:** [Baixar input ORCA](inputs/m02_livre_apos_N1.inp) · [Baixar geometria inicial (.xyz)](estruturas/encontro_real_R1.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](inputs/m01a_N_sem_vies_agua.mdrestart) (fornece o estado de continuação; manter junto do input).

## Inputs da sequência de hidratação

- **Hidratação inicial (0–500 fs da sequência):** [Baixar input ORCA](resultados/chelation_continuous/etapas/r9_rep1_piloto_0500fs/r9_rep1_piloto_0500fs.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_20h2o_3en_r9.xyz) (obrigatório; manter na mesma pasta do input).
- **Continuação da hidratação (500–5000 fs):** [Baixar input ORCA](resultados/chelation_continuous/etapas/r9_rep1_00500_05000fs/r9_rep1_00500_05000fs.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_20h2o_3en_r9.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](resultados/chelation_continuous/etapas/r9_rep1_piloto_0500fs/r9_rep1_piloto_0500fs.mdrestart) (fornece o estado de continuação; manter junto do input).
- **Continuação; o percurso utiliza o trecho até 7083 fs:** [Baixar input ORCA](resultados/chelation_continuous/etapas/r9_rep1_05000_10000fs/r9_rep1_05000_10000fs.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_20h2o_3en_r9.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](resultados/chelation_continuous/etapas/r9_rep1_00500_05000fs/r9_rep1_00500_05000fs.mdrestart) (fornece o estado de continuação; manter junto do input).

A geometria acima é o início da sequência de hidratação. Nas continuações, o checkpoint fornece posições, velocidades e o estado dinâmico. Os inputs `m01a_N_sem_vies_agua` e `m02_livre_apos_N1` listados acima usam a geometria de encontro selecionada: o primeiro reinicializa velocidades; o segundo exige o checkpoint do primeiro.


## 5. Repetir a en com pares controlados

**Os novos controles abaixo estão preparados, mas ainda não foram executados.** Todos partem da mesma geometria de encontro retida, **`encontro_real_R1.xyz`**, com 97 átomos. Ela pertence à referência anterior; não deriva da montagem nova de 61 átomos. Os pacotes incluem essa geometria.

Compare separadamente o efeito da parede e o efeito da assistência ao primeiro N:

- **en livre, sem parede:** [input](inputs/en_livre_sem_parede.inp) · [pacote](aula-en_livre_sem_parede.zip).
- **en livre, com parede:** [input](inputs/en_livre_com_parede.inp) · [pacote](aula-en_livre_com_parede.zip).
- **primeiro N assistido, sem parede:** [input](inputs/en_assistida_sem_parede.inp) · [pacote](aula-en_assistida_sem_parede.zip).
- **primeiro N assistido, com parede:** [input](inputs/en_assistida_com_parede.inp) · [pacote](aula-en_assistida_com_parede.zip).

Os pares com/sem parede usam as mesmas posições e a mesma regra de inicialização das velocidades. A parede, quando presente, tem **raio 9 Å e Spring 50**. Nos inputs assistidos, o primeiro N (**N 61**) recebe a rampa durante **1 ps**; a restrição é removida e seguem **2 ps livres no mesmo input**, com continuidade de velocidades. **N 64 não recebe guia.** Nos inputs livres, nenhum N recebe restrição de coordenação.

Execute um por vez e carregue os arquivos no laboratório. Registre primeiro se N 61 já está próximo na geometria de encontro; compare Zn–N 61 e Zn–N 64 ao longo do tempo. A referência pronta mostra fechamento depois da assistência; isso não garante fechamento nos novos controles livres ou sem parede. Não atribua aos novos inputs os resultados medidos anteriormente.


**Próxima etapa do percurso:** [04d · en sem assistência sob 1, 1000 e 4000 bar](../14-zn-en-pressao/README.md). Os três controles partem do início do sistema de 97 átomos, com en afastada; não partem do quelato final nem da geometria de encontro selecionada acima.
