# 04d · en sem assistência: 1, 1000 e 4000 bar

[← Percurso](../README.md) · [04c · Quelato assistido](../11-formacao-quelato/README.md) · [Abrir a comparação no laboratório](../../visualizador/index.html?exemplo=zn_pressure&aba=trajetoria)

**Zn²⁺ + 20 águas + três en · 97 átomos · carga +2 · singlete · 5 ps por caso**

> **Pergunta:** mudar a pressão da parede móvel faz a en coordenar sem assistência?

## 1. Compare o mesmo início, sem guiar os N

Os três casos começam na **mesma geometria inicial de 97 átomos** usada no começo da referência de 04c, com as águas e os ligantes afastados. Eles não começam no quelato final nem na geometria de encontro selecionada para assistir o primeiro N. A preparação de 61 átomos de 04a–b também é outro sistema.

**Nenhum caso contém restrição Zn–N.** Todos usam GFN2-xTB/ALPB(water), timestep de **0,25 fs**, CSVR a **300 K**, esfera inicial de **9 Å**, `Spring 50` e **5 ps**. Compare os alvos externos de **1, 1000 e 4000 bar** mantendo as demais escolhas do protocolo.

Os inputs têm dois trechos contínuos: **500 fs com acoplamento térmico de 20 fs**, seguidos de **4500 fs com acoplamento de 100 fs**. Não há reinicialização das velocidades na transição. A mudança de acoplamento é igual nos três casos; nenhum N recebe força de aproximação em qualquer trecho.

## 2. Observe parede, águas e en

[**Abrir os três casos juntos**](../../visualizador/index.html?exemplo=zn_pressure&aba=trajetoria)

As três referências conservam **todos os 10001 quadros reais**, de 0 a 5000 fs, com gravação a cada **0,5 fs**. Marque os casos e alterne o campo **Simulação** para comparar o mesmo tempo físico. Ative **Coordenação** e acompanhe a esfera e seus indicadores.

Na aba **Geometria**, as seis distâncias Zn–N já ficam selecionadas. Os índices começam em zero: **Zn 0; en 1: N 61 e N 64; en 2: N 73 e N 76; en 3: N 85 e N 88**. Confira os dois N de cada par para reconhecer uma mesma en bidentada; observar somente a primeira en não permite concluir sobre as três.

1. Observe primeiro a hidratação do Zn. Meça Zn–O e compare com Zn–N; retenção espacial e coordenação são medidas distintas.
2. Observe o raio da esfera em cada pressão. A referência de **1 bar expande**; as pressões maiores confinam o agregado mais fortemente.
3. Meça as distâncias Zn–N ao longo dos 5 ps. Algum N cruza o corte geométrico de 2,6 Å? Existe contato simultâneo pelos dois N da mesma en?
4. Compare **pressão externa alvo** e **pressão média medida pelo ORCA**. A medida flutua e não precisa coincidir com o alvo.

A `Cell` esférica é uma **parede repulsiva finita, não periódica**, cujo tamanho responde à pressão. Não representa uma caixa periódica de solução macroscópica. `Spring 50` não é uma barreira impenetrável; aumentar o alvo de pressão também não impõe uma ligação Zn–N. Os indicadores do laboratório distinguem alvo, pressão medida e raio reconstruído a partir dos registros da cela.

## 3. O que foi observado nas referências

Ao final de **5 ps**, os três casos têm **seis O e nenhum N** abaixo do corte Zn–O/N de **2,6 Å**. Não se formou o quelato nesta janela, inclusive no alvo de 4000 bar.

A menor distância Zn–N ao longo de cada trajetória foi **3,261 Å a 1 bar**, **3,572 Å a 1000 bar** e **3,370 Å a 4000 bar**. Esses valores permanecem acima do corte usado na atividade. Os raios finais são aproximadamente **47,639 Å**, **7,705 Å** e **5,770 Å**, respectivamente; interprete a expansão a 1 bar junto ao movimento do solvente explícito.

A ausência de coordenação em três trajetórias de 5 ps não demonstra impossibilidade de associação, inércia cinética ou equilíbrio. A comparação mostra a evolução destes estados iniciais e deste modelo, sem fornecer constante de formação ou velocidade experimental. O fechamento assistido de 04c e a ausência de fechamento nestes controles respondem a protocolos diferentes.

[Conferir o resumo numérico dos três casos](resultados/resumo.json).

## 4. Arquivos para reproduzir e conferir

[Baixar os três inputs e a geometria comum](aula-zn-en-pressao.zip) · [Geometria inicial](zn_20h2o_3en_r9.xyz)

- **1 bar:** [input](zn_en_1bar_5ps.inp) · [resultados completos](resultado-zn-en-1bar.zip) · [saída](resultados/zn_en_1bar_5ps/zn_en_1bar_5ps.out) · [energia](resultados/zn_en_1bar_5ps/zn_en_1bar_5ps-md-ener.csv) · [trajetória](resultados/zn_en_1bar_5ps/zn_en_1bar_5ps-traj.xyz).
- **1000 bar:** [input](zn_en_1000bar_5ps.inp) · [resultados completos](resultado-zn-en-1000bar.zip) · [saída](resultados/zn_en_1000bar_5ps/zn_en_1000bar_5ps.out) · [energia](resultados/zn_en_1000bar_5ps/zn_en_1000bar_5ps-md-ener.csv) · [trajetória](resultados/zn_en_1000bar_5ps/zn_en_1000bar_5ps-traj.xyz).
- **4000 bar:** [input](zn_en_4000bar_5ps.inp) · [resultados completos](resultado-zn-en-4000bar.zip) · [saída](resultados/zn_en_4000bar_5ps/zn_en_4000bar_5ps.out) · [energia](resultados/zn_en_4000bar_5ps/zn_en_4000bar_5ps-md-ener.csv) · [trajetória](resultados/zn_en_4000bar_5ps/zn_en_4000bar_5ps-traj.xyz).

Na aula, interprete os resultados prontos. Para reproduzir depois, coloque input e geometria comum na mesma pasta e execute **um cálculo por vez**, conforme a [orientação de execução](../README.md#como-executar). Carregue `.out`, `-md-ener.csv` e `-traj.xyz` juntos no laboratório. Os arquivos originais mantêm seus relógios e valores.

**Entrega da dupla:** explique como o confinamento mudou sem produzir coordenação Zn–N nesses 5 ps. Cite uma observação da trajetória, uma medida e uma limitação.

Siga para **[05 · Um próton entre duas águas](../10-proton-compartilhado/README.md)**. O [complemento Cell de 43 átomos](../13-cell-pressao/README.md) conserva suas referências históricas e permanece separado desta comparação de 97 átomos.

**Manual:** [Cell e pressão no ORCA](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell).
