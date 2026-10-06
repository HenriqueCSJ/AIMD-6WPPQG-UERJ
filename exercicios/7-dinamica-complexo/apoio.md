# Apoio · Hidratação a partir da saída do SOLVATOR

[← Voltar a 04b](README.md)

Os quatro controles usam diretamente a mesma saída de SOLVATOR: 61 átomos, sem N e sem deslocamento intermediário das águas. Mantenha também carga, multiplicidade, método, timestep, semente, inicialização de velocidades, termostato, duração e cadência de gravação. Varie apenas a parede.

## Rigidez e coordenação são observações diferentes

Uma parede esférica finita pode ser ultrapassada. Spring 10, 50 e 200 alteram a força de retorno; nenhum deles é uma barreira impenetrável. Nos três casos, mantenha centro e raio iguais. No controle sem parede, retire a força da parede.

Meça Zn–O para acompanhar contatos de coordenação e a distância à origem para acompanhar a fronteira. Se a trajetória não alcança a parede, não atribua diferenças à retenção sem evidência. Os traços no laboratório representam critérios geométricos, não ordens de ligação.

## A montagem já contém contatos

Na saída de SOLVATOR fornecida, três O estão a menos de 2,6 Å do Zn. Registre esse estado inicial antes de interpretar contatos surgidos na dinâmica. Não use os tempos de formação observados em outra geometria inicial.

## Referências anteriores

As trajetórias que usaram afastamento radial de 0,8 Å estão no [histórico separado](historico-radial.md), com seus [dados de apoio](historico-radial-apoio.md). Elas não são resultados da sequência atual SOLVATOR → MD. O [histórico do complexo pré-formado de 43 átomos](historico-apoio.md) também conserva seu contexto original.
