# 04c · Zn–en: reconhecer a formação de um quelato

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Núcleo da aula · 20 min após o intervalo · interpretar resultado pronto · 97 átomos**

> **Pergunta:** os dois N que se aproximam do Zn pertencem à mesma molécula intacta, e o contato persiste?

Este sistema contém Zn²⁺, **20 águas e três etilenodiaminas (en)**. É diferente do complexo menor usado no par com/sem parede. A geometria inicial contém um encontro selecionado entre Zn hidratado e en; a primeira aproximação de um N foi assistida. A trajetória completa não representa associação inteiramente espontânea.

## 1. Abra a trajetória pronta

[Abrir formação do quelato](../../visualizador/index.html?exemplo=chelation&aba=trajetoria) · [Baixar resultado e inputs](resultado-chelation.zip)

São **3 ps = 3000 fs**, reunidos a partir de duas etapas reais e contínuas:

- **0–1000 fs:** uma restrição de distância aproxima **N 61** de **Zn 0**. N 64 e as águas não recebem esse viés de coordenação.
- **1000–3000 fs:** a restrição de coordenação foi retirada. O termostato CSVR a 300 K, ALPB(water) e a parede esférica de raio 9 Å continuam ativos.

A continuação de 2 ps levou **544,584 s** nesta máquina, com PAL8 solicitado. Preparação e execução ficam fora da atividade obrigatória. O objetivo da dupla é interpretar os arquivos fornecidos.

## 2. Acompanhe quatro distâncias

Os índices começam em **zero**, como no aplicativo e nos inputs do ORCA:

1. Adicione **Zn 0–N 61** e **Zn 0–N 64**. Ambos os N pertencem à mesma en. Identifique quando o segundo N entra em contato e por quanto tempo os dois permanecem próximos.
2. Adicione **Zn 0–O 7** e **Zn 0–O 25**. Estas são as duas águas que deixam a primeira esfera inicial.
3. Compare o começo e o fim. O produto final tem **seis átomos doadores**, mas **cinco moléculas ligantes**: quatro águas e uma en bidentada.
4. Registre qual parte da trajetória foi assistida. Explique por que observar um quelato aqui não fornece uma constante de velocidade experimental.

No XYZ completo, Zn–N 61 fica abaixo de 2,6 Å em 540 fs; Zn–N 64, em 1554 fs. Os dois N permanecem abaixo de 2,6 Å de **1554 a 3000 fs**, um intervalo de **1446 fs = 1,446 ps**. O 7 permanece além de 3,0 Å a partir de 1332 fs e O 25, a partir de 1823 fs.

Com entrada de contato abaixo de 2,6 Å e saída acima de 3,0 Å, a sequência é **6O → 6O1N → 5O1N → 5O2N → 4O2N**. Esses limites são critérios geométricos; não são uma definição universal de ligação química. A en permanece intacta nesta referência.

## 3. Limites e resolução dos arquivos

A prévia do aplicativo usa **um a cada três quadros** da trajetória de 1 fs, preservando também o último. Para localizar eventos com a resolução de 1 fs, carregue o [XYZ completo](resultados/chelation/chelation-traj.xyz) junto do [CSV completo](resultados/chelation/chelation-md-ener.csv). Nenhuma coordenada ou tempo foi interpolado.

O CSV reúne as etapas e preserva os valores impressos. A referência da quantidade conservada pode mudar no restart: um offset não é um salto físico. O timestep é 0,25 fs, enquanto a saída XYZ foi gravada a cada quatro passos.

A parede e o termostato permanecem na fase sem viés de coordenação. Não atribua causalmente a formação do quelato à parede com base neste caso; a comparação controlada de parede está na etapa 04b. Ausência de evento em outro trecho curto também não prova que a associação seja impossível.

## Inputs e consulta

- [Aproximação assistida](inputs/m01a_N_sem_vies_agua.inp) · [Continuação sem viés de coordenação](inputs/m02_livre_apos_N1.inp) · [Geometria inicial](estruturas/encontro_real_R1.xyz).
- [Saída da primeira etapa](resultados/etapas/m01a_N_sem_vies_agua.out) · [Saída da continuação](resultados/etapas/m02_livre_apos_N1.out).
- O ZIP inclui o pequeno restart necessário à continuação. Para uma reprodução posterior, copie geometria e inputs para uma pasta nova e execute uma etapa por vez. O nome `m01a_N_sem_vies_agua` significa ausência de viés **nas águas**; a aproximação de N 61 é assistida.
- [Manual ORCA 6.1: restrições, variáveis coletivas e restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Entrega da dupla:** identifique os dois N, as duas águas que saem e uma medida de persistência que sustente a interpretação de quelação.
