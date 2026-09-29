# Inputs dos pilotos operacionais

[← Evidência e limites dos testes](../../../resultados/pilotos-progressao/README.md)

Estes cinco inputs foram executados sequencialmente com ORCA 6.1.1. Têm a geometria de água embutida e geram `trajetoria.xyz` e o CSV de energias. Copie **cada input para uma pasta de execução diferente**, pois o nome de trajetória é o mesmo. Execute o ORCA pelo caminho completo, conforme o [tutorial](../../../tutoriais/03-testar-instalacao.md).

São testes curtos de funcionamento em geometria não otimizada, não os exercícios definitivos. Consulte o [roteiro progressivo](../../../exercicios/roteiro-4h.md) para a preparação dos casos da aula. Não há otimização, estatística de equilíbrio ou ensaio de timestep validado nestes arquivos.

`agua_xtb2_external.inp` verifica a interface externa xTB 6.7.1, necessária para a rota com SOLVATOR. Os inputs com `Native-XTB2` são preservados como pilotos da implementação nativa.
