# Apoio · Hidratação sem en e comparação controlada

[← Voltar a 04b](README.md)

Os quatro controles atuais usam **61 átomos e nenhum N**. Mantenha o mesmo arquivo XYZ, estado eletrônico, método, timestep, semente, inicialização de velocidades, termostato, duração e cadência de gravação. Nos controles com parede, mantenha também centro e raio; varie somente `Spring`. No controle sem parede, retire a força de parede.

## Rigidez não é dureza infinita

Uma parede esférica finita pode ser ultrapassada pelos átomos. `Spring 10`, `50` e `200` controlam a força de retorno, não uma barreira impenetrável. Se a trajetória nunca alcança a fronteira, não atribua uma diferença observada à retenção pela parede sem evidência.

## Compare observações diferentes

Retenção perto do centro e primeira esfera de coordenação não são a mesma medida. Use distâncias Zn–O para a primeira esfera, distâncias ao centro para verificar a borda, e as trajetórias e energias para interpretar cada caso. Tracejados no 3D são critérios geométricos, não ordens de ligação.

As posições e velocidades iniciais das quatro referências foram conferidas como idênticas; as trajetórias divergem conforme as forças aplicadas. Não compare um reinício antigo do complexo de 43 átomos com uma inicialização nova de 61 átomos como se apenas a parede mudasse.

## Resultados conferidos e sua leitura

Todos os ramos têm 2001 quadros de 0–1000 fs e 4001 registros de energia. Os XYZ usam cadência de 0,5 fs; o timestep da integração é 0,25 fs. Os tempos impressos no CSV têm uma casa decimal, portanto não reconstrua o relógio original a partir do número da linha ou de uma malha ideal.

A preparação começa com **zero contatos Zn–O abaixo de 2,6 Å**. Nos quatro ramos, o primeiro aparece em 51 fs e seis aparecem em 77,5 fs. No quadro final, a contagem é 6, 6, **5** e 6, na ordem sem parede, Spring 10, 50 e 200. Não afirme que todos terminam com seis O dentro do corte.

O maior raio atômico **no quadro final**, em relação à origem fixa, é **17,639 Å sem parede**, **7,181 Å com Spring 10**, **6,686 Å com Spring 50** e **6,542 Å com Spring 200**. Esses valores diferem dos máximos ao longo de todo o filme apresentados na atividade. Ambos mostram que a parede suave pode ser ultrapassada.

As distâncias O–H verificadas em todos os quadros ficam entre aproximadamente **0,914 e 1,046 Å**. Não foi observada ruptura dessas águas nos trechos utilizados. A parede limita o afastamento do agregado sem garantir uma primeira esfera invariável ou um estado de equilíbrio.

## Limites e arquivos anteriores

A montagem SOLVATOR bruta e a preparação com afastamento radial de 0,8 Å são geometrias diferentes. A segunda conserva cada água internamente e fornece o estado comum dos quatro controles. Confira os dados medidos de cada controle antes de concluir como a parede atuou. Os resultados novos estão disponíveis na [atividade principal](README.md#resultados-desta-comparacao) e na [verificação numérica](resultados/verificacao-hidratacao.json).

O [apoio histórico](historico-apoio.md) conserva os dados medidos, inputs, reinícios e índices do complexo pré-formado de 43 átomos. A [referência anterior de hidratação com en presente](hidratacao.md) também permanece separada. Esses arquivos não compõem a nova comparação sem en.
