# Apoio · Zn²⁺ isolado e vinte águas

[← Voltar a 04a](README.md)

A contagem é 1 Zn + 20 O + 40 H = **61 átomos**. Carga +2 e multiplicidade 1 descrevem o estado eletrônico usado no input. Não há en nem N neste bloco.

`fixsolute true` fixa o íon durante a montagem de SOLVATOR. Na dinâmica posterior, os átomos são móveis conforme o input de MD; não transporte a ideia de soluto fixo da montagem para a interpretação das trajetórias.

O solvente explícito e ALPB cumprem papéis diferentes: as águas explícitas fornecem coordenadas e contatos locais; ALPB representa um ambiente contínuo. A parede em 04b aplica forças nas bordas e não é substituída pelo solvente contínuo.

## Para discutir

1. A saída contém exatamente vinte águas e nenhum N?
2. Quais distâncias Zn–O estão próximas já na montagem inicial?
3. O que seria necessário para falar de equilíbrio, além de construir uma geometria?

Os resultados antigos, tempos de execução e índices do complexo Zn–en pré-formado permanecem no [apoio histórico](historico-apoio.md), com seus arquivos originais. Eles não são resultados da nova montagem.
