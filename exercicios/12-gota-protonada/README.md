# Opcional · Gota protonada: temperatura, retornos e amostragem

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Extensão opcional após a aula · dados prontos · 97 átomos**

> **Pergunta:** aumentar a temperatura garante que a protonação se propague por mais moléculas?

O modelo contém H₃O⁺ + 31 H₂O, com XTB2/ALPB(water), termostato CSVR e parede suave de raio 8,5 Å. Os quatro casos compartilham **o mesmo trecho de 0–500 fs e o mesmo checkpoint de partida**. Cada ramo acrescenta 2 ps; não são quatro preparações independentes. O ramo de 600 K não continua o de 500 K.

## 1. Escolha um exemplo

Cada link carrega somente a temperatura selecionada. Os ZIPs incluem o par completo XYZ/CSV, os inputs, o restart comum e as saídas das etapas necessárias.

- **300 K, controle:** [abrir](../../visualizador/index.html?exemplo=proton_droplet&aba=trajetoria) · [baixar ZIP](resultado-proton_droplet_300k.zip) · [XYZ](resultados/proton_droplet_300k/proton_droplet_300k-traj.xyz) · [energias](resultados/proton_droplet_300k/proton_droplet_300k-md-ener.csv).
- **400 K:** [abrir](../../visualizador/index.html?exemplo=proton_droplet_400k&aba=trajetoria) · [baixar ZIP](resultado-proton_droplet_400k.zip) · [XYZ](resultados/proton_droplet_400k/proton_droplet_400k-traj.xyz) · [energias](resultados/proton_droplet_400k/proton_droplet_400k-md-ener.csv).
- **500 K:** [abrir](../../visualizador/index.html?exemplo=proton_droplet_500k&aba=trajetoria) · [baixar ZIP](resultado-proton_droplet_500k.zip) · [XYZ](resultados/proton_droplet_500k/proton_droplet_500k-traj.xyz) · [energias](resultados/proton_droplet_500k/proton_droplet_500k-md-ener.csv).
- **600 K:** [abrir](../../visualizador/index.html?exemplo=proton_droplet_600k&aba=trajetoria) · [baixar ZIP](resultado-proton_droplet_600k.zip) · [XYZ](resultados/proton_droplet_600k/proton_droplet_600k-traj.xyz) · [energias](resultados/proton_droplet_600k/proton_droplet_600k-md-ener.csv).

De 0 a 500 fs, o alvo comum é 300 K. De 500 a 1000 fs, os ramos quentes elevam o alvo até 400, 500 ou 600 K; depois o mantêm até 2500 fs. O controle permanece a 300 K. A temperatura instantânea oscila em torno de um alvo que, durante a rampa, muda com o tempo.

## 2. Compare movimentos e permanência

Todos os índices abaixo começam em **zero**, como no aplicativo. A identificação do O hospedeiro usa a proximidade geométrica dos H; não é uma medida de carga eletrônica.

1. **300 K:** acompanhe o hidrogênio mais próximo a cada O. Nesta referência não houve troca do O hospedeiro em 2,5 ps.
2. **400 K:** acompanhe **H 3 entre O 0 e O 22** perto de 1727 fs; depois **H 23 entre O 22 e O 13** perto de 1909,5 fs. São H diferentes nas duas passagens sucessivas; não se trata de um único H atravessando toda a gota.
3. **500 K:** acompanhe **H 2 entre O 0 e O 25**. As excursões em 1205–1228,5 fs e 2218–2234,5 fs retornam ao O inicial.
4. **600 K:** acompanhe **H 1 entre O 0 e O 94** e **H 3 entre O 0 e O 31**. Há seis excursões com retorno; a visita final de H 1 a O 94 dura 127,5 fs antes de voltar.

**Mais quente não significou propagação mais sustentada nesta série.** O caso de 400 K mostra duas passagens sucessivas sem retorno observado; 500 e 600 K mostram excursões que retornam. Uma trajetória por temperatura, com prefixo comum, não estabelece uma lei de temperatura, taxas, difusão ou condutividade.

## 3. O que o modelo permite concluir

A gota se reorganiza e dispersa parcialmente; a parede suave permite penetração. Moléculas de água se afastando não significam necessariamente quebra covalente. Este agregado finito não deve ser apresentado como água líquida em equilíbrio.

Compare a temperatura realizada, a permanência no novo O e o estado do agregado. Definir uma região de compartilhamento, por exemplo diferença das duas menores distâncias O–H abaixo de 0,15 Å, altera o tempo atribuído a uma residência inequívoca. Cruzar o ponto médio e permanecer no novo lado são perguntas diferentes.

Cada trajetória completa tem **5001 quadros, espaçados de 0,5 fs**, e 10001 registros de energia. A prévia seleciona **um a cada cinco quadros**, mais o último: use o XYZ completo para investigar recrossamentos rápidos. Os comentários XYZ preservam o tempo físico; o CSV mantém os valores impressos e as referências da quantidade conservada de cada etapa. Não interprete offsets de restart/Run como saltos físicos.

## Inputs e consulta

- **Preparação dinâmica comum de 0,5 ps:** [Baixar input ORCA](inputs/p03_equilibrar.inp) · [Baixar geometria inicial (.xyz)](estruturas/gota_equilibrar.xyz) (obrigatório; manter na mesma pasta do input) · [Checkpoint produzido, usado pelos quatro ramos](inputs/p03_equilibrar.mdrestart).
- **Controle 300 K:** [Baixar input ORCA](inputs/p04_observar.inp) · [Baixar geometria inicial (.xyz)](estruturas/gota_equilibrar.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](inputs/p03_equilibrar.mdrestart) (fornece o estado de continuação; manter junto do input).
- **Ramo 400 K:** [Baixar input ORCA](inputs/h01_aquecer.inp) · [Baixar geometria inicial (.xyz)](estruturas/gota_equilibrar.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](inputs/p03_equilibrar.mdrestart) (fornece o estado de continuação; manter junto do input).
- **Ramo 500 K:** [Baixar input ORCA](inputs/t500_gota.inp) · [Baixar geometria inicial (.xyz)](estruturas/gota_equilibrar.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](inputs/p03_equilibrar.mdrestart) (fornece o estado de continuação; manter junto do input).
- **Ramo 600 K:** [Baixar input ORCA](inputs/t600_gota.inp) · [Baixar geometria inicial (.xyz)](estruturas/gota_equilibrar.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](inputs/p03_equilibrar.mdrestart) (fornece o estado de continuação; manter junto do input).
- [Saída do prefixo](resultados/etapas/p03_equilibrar.out) · [300 K](resultados/etapas/p04_observar.out) · [400 K](resultados/etapas/h01_aquecer.out) · [500 K](resultados/etapas/t500_gota.out) · [600 K](resultados/etapas/t600_gota.out).
- Os ramos de 400/500/600 K levaram, respectivamente, **556,566 / 598,407 / 601,037 s** para 2 ps adicionais na máquina de referência. Não é necessário executá-los durante a aula. Para uma reprodução posterior, use uma pasta separada por ramo, copie o mesmo restart comum para cada uma e execute um cálculo por vez.
- [Manual ORCA 6.1: termostatos, rampa e restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html) · [SOLVATOR: construção de solvatação explícita](https://www.faccts.de/docs/orca/6.1/manual/contents/structurereactivity/solvator.html).

**Atividade posterior:** escolha dois ramos e explique por que número de cruzamentos, permanência no novo hospedeiro e transporte sustentado não são equivalentes.
