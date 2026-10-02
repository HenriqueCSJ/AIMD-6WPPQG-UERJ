# Laboratório de trajetórias

[Abrir o aplicativo](index.html) · [Trajetória 3D do complexo](index.html?exemplo=complex&aba=trajetoria) · [Exemplo de timestep](index.html?exemplo=timestep)

O aluno carrega os arquivos e passa diretamente à interpretação. Não precisa importar colunas em uma planilha, instalar Python ou escrever comandos para medir distâncias.

## Para usar na aula

1. Abra `visualizador/index.html` em um navegador moderno, mantendo as pastas do repositório juntas. Também funciona pelo site estático quando o repositório estiver publicado.
2. O laboratório abre diretamente na **Trajetória 3D**, com o dímero de água da aula. Para ver seu próprio movimento, selecione `nome-traj.xyz`: a aba **Trajetória 3D** abre automaticamente, mesmo sem outros arquivos. Junte `nome-md-ener.csv` para energias/temperatura e `nome.out` para as condições do cálculo. Pode carregar todos juntos. Arquivos com o mesmo nome-base são associados. Recarregar uma série que já existe cria outra entrada, preservando a anterior.
3. Escolha **Girar** ou **Mover** e arraste a molécula para girar ou reposicioná-la. Use **Ampliar área** para aumentar o espaço de visualização e a roda para aproximar e clique em **Reproduzir**. Em **Duração a 1×**, escolha quanto tempo deseja para observar um ciclo completo: 8, 15, 30, 60 ou 120 segundos; o padrão é 60 segundos. **Velocidade** permite acelerar ou desacelerar esse ritmo. As setas avançam quadro a quadro; a barra e **Ir ao quadro** escolhem um ponto da trajetória. Esses controles alteram apenas a reprodução, preservando o tempo físico. Clique em um átomo para acompanhar suas coordenadas; **Centralizar** restaura a vista inicial.
4. Ao lado da trajetória, selecione **Cinética**, **Potencial** e **Total** independentemente. Logo abaixo, o gráfico de **Temperatura** mostra T em kelvin ou **ΔT** em relação ao primeiro valor registrado. Os marcadores nos dois gráficos acompanham o tempo físico do quadro; clicar em qualquer curva escolhe um quadro. Valores ausentes ficam sem dados, sem interpolação dos indicadores. Os links que pedem explicitamente uma aba continuam abrindo essa aba. Depois explore **Energia e temperatura** e **Geometria**. Para comparar, carregue outro cálculo e marque até quatro simulações. As caixas selecionam os cálculos nas três abas. Ao desmarcar o cálculo exibido, a trajetória passa ao próximo marcado; com vários marcados, use o campo **Simulação** para alternar entre eles. Clique em **Reproduzir** após a troca. Um XYZ de apenas um quadro pode ser girado e ampliado, mas não contém uma animação.

No WSL, use `explorer.exe .` na pasta do cálculo para encontrá-la pelo seletor de arquivos do Windows. O aplicativo não precisa executar dentro do WSL.

O seletor separa os **cinco blocos durante a aula** dos **opcionais e referências**. As etapas do bloco de complexação incluem SOLVATOR, comparação da parede e a formação assistida do quelato. H₅O₂⁺ encerra o percurso com um caso reativo rápido. **Ver trajetória 3D** abre diretamente a molécula do exemplo escolhido. Os exemplos são identificados como referências dos ministrantes. A cópia local inclui os dados e a biblioteca molecular: a leitura e os exemplos não precisam de internet. Links para o manual do ORCA são externos.

Os arquivos são carregados **por exemplo**, com indicação de leitura e botão **Tentar novamente** em caso de falha. Uma comparação só substitui a vista anterior quando todas as suas simulações estiverem disponíveis. Na cópia local, mantenha a pasta `visualizador/examples` junto dos demais arquivos. **Complexo e SOLVATOR** apresenta duas estruturas estáticas; a dinâmica do complexo está em **Parede: retenção das águas**.

## O que pode ser observado

- **Energias cinética, potencial e total**, em Hartree ou kJ/mol; valores absolutos ou variações desde o primeiro valor disponível de cada curva.
- **Temperatura em K**, em um gráfico separado. Condições NVE/NVT são lidas do input reproduzido no `.out`, quando reconhecíveis, ou informadas pelo aluno; não são inferidas da aparência dos números.
- **Tempo em fs, ps ou s**, com duração física explícita, preservando o relógio de um reinício.
- **Animação XYZ**, reprodução/pausa, velocidade de 0,25× a 4×, avanço/retorno de um quadro, escolha direta pelo número, rotação, deslocamento da câmera, área ampliada, índices dos átomos e energias/temperatura do ponto correspondente. A câmera permanece na orientação escolhida durante a animação. As coordenadas do átomo selecionado acompanham o quadro atual. A sincronização exige tempo e, quando presente, passo compatíveis; não é feita pela posição da linha. Para o arredondamento do CSV do ORCA a uma casa decimal, aceita-se uma diferença de até 0,05 fs somente com o mesmo passo registrado; o aplicativo informa esse arredondamento e preserva os tempos originais.
- **Distâncias, ângulos e diedros**, calculados diretamente de cada quadro XYZ, sem `Manage_Colvar` no input. Índices começam em zero. Também lê Colvars de distância em Angstrom; forças e ângulos não viram distâncias.
- **Exportação CSV** das séries de energia originais e das medidas geométricas selecionadas. A exportação energética mantém Hartree/fs/K, independentemente da transformação usada no gráfico.

Os traços covalentes são estimados por proximidade. As ligações H aparecem tracejadas e os contatos de coordenação podem ser ligados/desligados separadamente. São sugestões geométricas, não ordens de ligação obtidas de uma análise eletrônica. O XYZ não define protonação ou caráter aceptor completo: examine o contexto químico antes de interpretar um traço.

## Leitura e limites

O leitor foi conferido com ORCA 6.1.1 e os resultados locais dos exercícios. Um `.out` de MD pode ser suficiente para os gráficos, mas algumas configurações imprimem apenas parte dos passos: o CSV tem prioridade quando os dois são carregados e compatíveis. Uma saída de otimização ou SOLVATOR sem série MD aparece como resultado sem série de energia; carregue o XYZ para explorar sua estrutura.

O formato CSV esperado é o nativo do ORCA: ponto e vírgula, ponto decimal, `Sim. Time` em fs, energias em Hartree e `Temp` em K. A constante de conversão usada é 1 Eh = 2625,4996394799 kJ/mol. `Cons.Qty` permanece separada de `E_Tot`; `E.Drift` não é tratado como uma energia.

Valores ausentes permanecem ausentes. Linhas incompletas, mudanças na ordem dos átomos, tempos não monotônicos e discrepâncias entre `.out` e CSV são sinalizados. Trechos descontínuos não são unidos por linhas no gráfico. Um XYZ convencional sem relógio usa números de quadro, sem inventar fs. Coordenadas convencionais são interpretadas em Å; um comentário explícito em outra unidade é rejeitado. O limite inicial é 80 MB por arquivo, voltado às trajetórias curtas da aula.

Os gráficos mostram os pontos lidos, sem suavização. A média indicada descreve os pontos exibidos, não uma estimativa independente de equilíbrio. Amplitude é máximo menos mínimo, não uma medida de deriva monotônica. O aplicativo não estima energias livres, constantes de formação, taxas ou qualidade do método eletrônico.

Os arquivos são lidos em memória neste navegador. Não há servidor de cálculos, armazenamento remoto, análise por IA, cookies ou envio de arquivos. Recarregar a página limpa a sessão. O código do aplicativo não possui chamadas de rede para processar uploads.

## Manutenção

### Usar pelo GitHub Pages

Os alunos acessam [o aplicativo online](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/) diretamente, sem instalar programas ou fazer login. A configuração utilizada está em [PUBLICACAO.md](../PUBLICACAO.md). O site serve HTML/CSS/JavaScript; o ORCA continua sendo executado no computador do participante. Selecionar outputs no aplicativo não os envia ao GitHub.

### Arquivos e verificações

O aplicativo usa HTML/CSS/JavaScript locais, gráficos SVG e [3Dmol.js](https://3dmol.org/) 2.5.5, distribuído com sua [licença BSD](vendor/3Dmol-LICENSE.txt). A referência de formatos é o [manual de MD do ORCA 6.1](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

Para repetir as verificações do leitor, na raiz do repositório:

```text
node --test visualizador/tests/*.test.cjs
```

Para reconstruir os exemplos a partir dos arquivos originais preservados:

```text
node scripts/build_viewer_examples.cjs
```

Nenhum desses comandos executa ORCA. O aluno não precisa de Node; ele apenas abre o aplicativo. A implementação é uma versão de trabalho para o curso, com verificação funcional e visual local. O site está publicado no GitHub Pages, com abertura, carregamento do exemplo de timestep e reprodução da trajetória conferidos no endereço público. O ensaio integral com a turma permanece pendente.

Os testes automatizados conferem parsing, unidades, falhas, reinícios, programas de temperatura e geometria. Os doze pares de distâncias do complexo são comparados aos Colvars originais. A abertura direta por file:// não foi verificada, pois esse protocolo é bloqueado no navegador integrado; a verificação usa HTTP local e GitHub Pages.


## Reprodução e novos exemplos

Os índices são desenhados em lote e seus rótulos acompanham os átomos sem recriar texturas a cada quadro. Desligar os índices ou limpar a sessão libera esses recursos. O modelo molecular mantém os mesmos objetos de átomos, atualizando posições e a conectividade geométrica de cada quadro. As buscas de contatos usam vizinhanças espaciais; os cortes, resultados e ordem das medidas permanecem iguais aos da busca completa.

Os traços de contatos são agrupados por tipo, com limites calculados uma vez por lote. O bundle local de 3Dmol 2.5.5 contém correções de descarte e esse método de lote, documentados em [vendor/PATCHES.md](vendor/PATCHES.md). Ao atualizar a biblioteca, preserve ou revalide essas correções. Os testes de ciclo de vida conferem o descarte real dos buffers; os de geometria comparam os resultados com a implementação de referência. Para medir as buscas separadamente: `node visualizador/tests/geometry-benchmark.cjs 1000`, a partir da raiz do repositório.

As referências principais do dímero neutro e do etanol NVE têm **5 ps**; a do próton compartilhado tem **10 ps**. Cada uma conserva o trecho original e acrescenta uma continuação por restart, com todos os quadros disponíveis. As referências curtas continuam acessíveis por links diretos: [dímero de água · 2 ps](index.html?exemplo=water_short&aba=trajetoria), [etanol NVE · 0,5 ps](index.html?exemplo=ethanol_short&aba=trajetoria) e [H₅O₂⁺ · 2 ps](index.html?exemplo=proton_shared_short&aba=trajetoria). Elas não ocupam opções adicionais no seletor; as comparações de timestep e de termostato continuam usando seus dados originais. O maior tempo de simulação e a duração da reprodução são controles diferentes.

Quando há etapas com tempos explícitos nos metadados, **Trecho para repetir** permite observar cada etapa durante a duração escolhida, começando em 60 s por ciclo. O padrão é **Trajetória completa**. Escolher uma etapa pausa a animação e leva ao primeiro quadro disponível nesse intervalo; iniciar a reprodução repete apenas seus quadros. Setas, número do quadro, controle deslizante e gráficos continuam permitindo examinar a trajetória inteira. Nenhum tempo ou coordenada é interpolado ou alterado.

Nas trajetórias com um único relógio físico, o tempo usa campos estáveis em fs, ps e segundos, com precisão fixa durante cada trajetória. A reprodução acompanha o relógio do navegador e começa com um ciclo de **60 s a 1×**, independentemente do número de quadros. A nota sob os controles informa a duração efetiva: 60 s a 0,5× produzem um ciclo de 120 s; a 2×, de 30 s. Mudar a duração ou a velocidade durante a reprodução preserva a posição atual. Isso não prolonga a simulação nem altera os tempos do XYZ. O navegador pode pular quadros de exibição quando o desenho demora; as setas permitem inspeção individual dos quadros carregados.

A referência **Zn–en: hidratação e quelação** reúne etapas documentadas do mesmo sistema de 97 átomos: hidratação, encontro, aproximação assistida do primeiro N e segundo N livre de força de coordenação. Aos **7083 fs**, as posições do encontro selecionado são preservadas e as velocidades são reinicializadas a 300 K. Por isso, os eixos mostram **Tempo da sequência**, com o relógio original e a fonte de cada quadro disponíveis. O salto de energia nessa fronteira vem da reinicialização, não representa calor de reação. As curvas ficam separadas por etapa, sem deslocamento vertical entre fontes; a opção ΔE subtrai apenas o primeiro valor de cada curva. O exemplo anterior continua no [link direto](index.html?exemplo=chelation_previous&aba=trajetoria), sem adicionar outra opção ao menu.

A sequência usa uma prévia de aproximadamente 6001 quadros, acrescida das fronteiras e do último quadro. O preparo lê os XYZ de cada etapa separadamente; não exige um XYZ combinado acima do limite de upload. Os arquivos de cada etapa preservam todos os dados e seus relógios originais. A exportação das energias inclui o tempo exibido, o tipo de relógio, a fonte, o tempo original e o passo original; não inventa um passo global.

Algumas referências de sistemas maiores, como Zn–en e gotas protonadas, usam uma prévia amostrada para reduzir a transferência, sempre identificada sob a animação. Nas prévias, **Trecho para repetir** seleciona os quadros carregados dentro dos tempos da etapa. O dímero neutro de 5 ps, o etanol NVE de 5 ps e o H₅O₂⁺ de 10 ps mantêm todos os quadros no aplicativo. Cada coordenada e tempo mostrado vem de um quadro real; não há interpolação. Os links para os XYZ originais mantêm todos os quadros e os uploads são lidos integralmente. Energias não são reduzidas.

- Timestep: 2,5 fs causa uma falha progressiva, com registros até 325 fs, identificada como dados parciais; 0,5 fs demonstra a correção.
- Parede: comparação de 2 ps; a esfera indica uma parede fixa reconhecida no input do `.out`. XYZ sozinho não define uma parede.
- H₂O@C₆₀: carbonos em armação fina para permitir ver a água interna; nenhuma posição é alterada.

## Medidas químicas e protocolos

Em **Geometria**, escolha distância (2 átomos, Å), ângulo (3 átomos, graus) ou diedro (4 átomos, graus). O atalho do etanol usa C 0–C 1–O 2–H 8. O gráfico interrompe a linha ao cruzar a convenção +180°/−180° para não desenhar uma rotação fictícia de 360°. Não misture graus e Å no mesmo eixo.

O critério visual inicial de ligação H usa D/A = N ou O, H ligado geometricamente ao doador, H···A ≤ 2,5 Å, D···A ≤ 3,5 Å e D–H···A ≥ 150°. É um filtro de visualização para estes exercícios, não a definição universal de ligação H. Coordenação usa um corte geométrico editável, inicialmente 2,6 Å para Zn···N/O; sua adequação depende do metal e do ligante.

Quando o `.out` contém uma sequência simples de `Run`, o laboratório mostra as etapas programadas e os alvos/rampas de temperatura. O programa não comprova que a dinâmica chegou ao fim de todas as etapas: confira o tempo efetivo dos dados. Reinícios e programas regionais não recebem uma linha do tempo inferida sem suporte. O valor-alvo do termostato não é a temperatura instantânea medida.

O exemplo de timestep permite examinar os primeiros 75 fs antes do aquecimento extremo. O etanol em etapas mostra libração e mudanças de orientação da hidroxila em 5 ps. Nenhum dos dois estima uma barreira ou população de equilíbrio.

### Hidratação antes da associação

[Águas inicialmente afastadas](index.html?exemplo=hydration&aba=trajetoria) mostra a formação da primeira camada em 250 fs. [Encontro em 5 ps](index.html?exemplo=hydration_long&aba=trajetoria) acompanha a en, que permanece intacta e ainda não se coordena nesta referência. [Roteiro e inputs](../exercicios/7-dinamica-complexo/hidratacao.html).
