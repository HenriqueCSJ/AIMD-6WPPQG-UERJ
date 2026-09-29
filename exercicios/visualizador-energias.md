# Laboratório de trajetórias — visualizar e interpretar

[Abrir o aplicativo](../visualizador/index.html) · [Guia completo](../visualizador/README.md) · [Voltar ao percurso](README.md)

O aplicativo está implementado no repositório. Abra `visualizador/index.html`, carregue os arquivos do cálculo e use as três abas:

1. **Energia e temperatura:** K, U, E e T; comparação entre cálculos, valores absolutos e variações; unidades e escala de tempo explícitas.
2. **Trajetória:** animação XYZ, seleção de quadro, índices de átomos e leitura do ponto correspondente de energia/temperatura.
3. **Distâncias:** escolha dois átomos e acompanhe sua separação. O aplicativo calcula a distância diretamente do XYZ; não é necessário adicionar Colvars ao input.

Comece pelo arquivo `nome-md-ener.csv`. Junte `nome.out` para identificar as condições e `nome-traj.xyz` para visualizar o movimento. Arquivos do mesmo cálculo devem manter o mesmo nome-base. O `.out` também pode conter a série energética; o CSV tem prioridade quando ambos são compatíveis.

**Tudo é lido no navegador, sem enviar os arquivos.** A cópia local inclui os exemplos reais dos exercícios e funciona sem internet. Ainda não houve publicação do aplicativo em um endereço público.

Para experimentar: [timestep](../visualizador/index.html?exemplo=timestep), [termostato](../visualizador/index.html?exemplo=thermostat) ou [complexo de Zn](../visualizador/index.html?exemplo=complex).

Uma trajetória curta não demonstra equilíbrio ou estabilidade termodinâmica. Os gráficos preservam lacunas e reinícios; médias descrevem os pontos carregados. Os traços na molécula são uma ajuda visual por proximidade, não uma análise de ligação. Use as distâncias e a trajetória em conjunto para interpretar o resultado.
