# Guia interativo dos parâmetros de `%md`

**[Abrir o guia no navegador →](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/guia-md/)**

Consulte os 17 comandos e as 151 opções do bloco `%md`: clique em um termo para ver sua explicação e um exemplo copiável. A busca aceita palavras em português, com ou sem acentos. O modo **Bloco comentado** reúne os comandos em um input de consulta.

O guia também fica no topo do [laboratório](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/) e no menu dos [exercícios](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/exercicios/). Esses atalhos abrem outra aba para manter seus cálculos e sua atividade disponíveis.

## Usar sem internet

Baixe [`index.html`](index.html) e abra-o no navegador: o conteúdo, o estilo e as funções estão incorporados no arquivo. Também é possível baixar diretamente o [bloco comentado `.inp`](MD_COMENTADO.inp).

Os exemplos mostram o bloco `%md`. Método eletrônico, geometria, carga e multiplicidade devem ser definidos no restante do input. As alternativas avançadas do bloco comentado permanecem comentadas; adapte os parâmetros ao seu sistema.

## Atualizar o guia

- `dados-opcoes-md.json`: explicações, exemplos, palavras de busca e agrupamentos.
- `guia-md.template.html`: interface.
- `MD_COMENTADO.inp`: bloco integral comentado.
- `montar_guia.py`: gera `index.html` com Python, sem dependências externas.

Depois de editar as fontes, execute `python guia-md/montar_guia.py` na raiz do repositório e confira o HTML no navegador. O arquivo publicado preserva a versão local de 4 de outubro de 2026, incluindo as explicações atualizadas de Timecon, CSVR, NHC e Berendsen.

Referência: [manual oficial do ORCA 6.1 — dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html). O guia oferece explicações didáticas; não reproduz o capítulo integral do manual.
