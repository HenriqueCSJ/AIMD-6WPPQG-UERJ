# Laboratório de trajetórias

[Abrir o aplicativo](index.html) · [Trajetória 3D do complexo](index.html?exemplo=complex&aba=trajetoria) · [Exemplo de timestep](index.html?exemplo=timestep)

O aluno carrega os arquivos e passa diretamente à interpretação. Não precisa importar colunas em uma planilha, instalar Python ou escrever comandos para medir distâncias.

O **[guia de parâmetros `%md`](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/guia-md/)** fica fixo no topo do laboratório, inclusive com a trajetória ampliada. Abre em outra aba para consultar comandos e exemplos sem perder os arquivos carregados.

## Para usar na aula

1. Abra `visualizador/index.html` em um navegador moderno, mantendo as pastas do repositório juntas. Também funciona pelo site estático quando o repositório estiver publicado.
2. O laboratório abre diretamente na **Trajetória 3D**, com a água isolada da abertura. Para ver seu próprio movimento, selecione `nome-traj.xyz`: a aba **Trajetória 3D** abre automaticamente, mesmo sem outros arquivos. Junte `nome-md-ener.csv` para energias/temperatura e `nome.out` para as condições do cálculo. Pode carregar todos juntos ou aos poucos, inclusive com nomes diferentes. O laboratório reúne os arquivos pelo nome-base, pelo nome da trajetória declarado no `.out` ou pela correspondência registrada entre passos, tempos e energias potenciais. Dados incompatíveis ficam separados. Se houver mais de uma combinação possível, escolha a associação junto à trajetória. Recarregar os mesmos dados reaproveita a entrada existente; conteúdos diferentes são preservados separadamente. Uma estrutura estática não substitui a animação.
3. Escolha **Girar** ou **Mover** e arraste a molécula para girar ou reposicioná-la. Use **Ampliar área** para aumentar o espaço de visualização e a roda para aproximar e clique em **Reproduzir**. Em **Duração a 1×**, escolha quanto tempo deseja para observar um ciclo completo: 8, 15, 30, 60, 78 ou 120 segundos; o padrão é 78 segundos (+30%). **Velocidade** permite acelerar ou desacelerar esse ritmo. As setas avançam quadro a quadro; a barra e **Ir ao quadro** escolhem um ponto da trajetória. Esses controles alteram apenas a reprodução, preservando o tempo físico. Clique em um átomo para acompanhar suas coordenadas; **Centralizar** restaura a vista inicial.
4. Ao lado da trajetória, selecione **Cinética**, **Potencial** e **Total** independentemente. Logo abaixo, o gráfico de **Temperatura** mostra T em kelvin ou **ΔT** em relação ao primeiro valor registrado. Os marcadores nos dois gráficos acompanham o tempo físico do quadro; clicar em qualquer curva escolhe um quadro. Valores ausentes ficam sem dados, sem interpolação dos indicadores. Os links que pedem explicitamente uma aba continuam abrindo essa aba. Depois explore **Energia e temperatura** e **Geometria**. Para comparar, carregue outro cálculo e marque até quatro simulações. As caixas selecionam os cálculos nas três abas. Ao desmarcar o cálculo exibido, a trajetória passa ao próximo marcado; com vários marcados, use o campo **Simulação** para alternar entre eles. Clique em **Reproduzir** após a troca. Um XYZ de apenas um quadro pode ser girado e ampliado, mas não contém uma animação.

Na aba **Energia e temperatura**, arraste um retângulo no gráfico de energia para ampliar o intervalo de tempo e energia. Os campos **Tempo inicial/final** (sempre em fs) e **Energia mínima/máxima** permitem um recorte preciso; a unidade energética acompanha o seletor. Arrastar sobre o gráfico de temperatura seleciona apenas o tempo. Use **Restaurar visão completa** para remover os limites. O recorte preserva a referência original de ΔE e todos os dados exportados no CSV. A amplitude e a temperatura média usam somente os registros dentro do intervalo de tempo.

No WSL, use `explorer.exe .` na pasta do cálculo para encontrá-la pelo seletor de arquivos do Windows. O aplicativo não precisa executar dentro do WSL.

As Colvars também podem ser reunidas a arquivos com nomes diferentes quando as definições do `.out`, os tempos e as distâncias calculadas do XYZ confirmam a associação. Sem informação suficiente, use **Dados desta trajetória → Associar arquivos**. Nenhuma medida ou energia ausente é inventada.

O seletor mantém os **cinco blocos durante a aula** e os **opcionais e referências**. O bloco 01 começa pela água isolada DFT e inclui uma única entrada para a [comparação pronta XTB2 NVE × CSVR](index.html?exemplo=water_thermostat&aba=trajetoria), com 500 fs em cada condição. Os dois casos são carregados juntos; o campo **Simulação** permite alternar a trajetória. Os exemplos individuais e as variantes continuam acessíveis pelos links nas atividades, sem repetir o exercício no menu. As etapas de complexação incluem SOLVATOR, comparação da parede e formação assistida do quelato. **Abrir trajetória** abre a molécula do exemplo escolhido. A cópia local inclui os dados e a biblioteca molecular, funcionando sem internet; links para o manual do ORCA são externos.

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

O leitor foi conferido com saídas de MD do ORCA 5 e 6, incluindo os dois formatos de cabeçalho da tabela, e com os resultados locais dos exercícios. Um `.out` de MD pode ser suficiente para os gráficos, mas algumas configurações imprimem apenas parte dos passos: o CSV tem prioridade quando os dois são carregados e compatíveis. Uma saída de otimização ou SOLVATOR sem série MD aparece como resultado sem série de energia; carregue o XYZ para explorar sua estrutura.

**Parede no visualizador:** funciona também para arquivos próprios. Carregue a trajetória e o `.out` correspondente, juntos ou em qualquer ordem. A esfera fixa de `Cell Sphere`/`Walls Sphere` é lida do input em Å ou do bloco executado `Initial Wall Info`. O desenho usa três contornos circulares, com raio na legenda. Acrescentar o `.out` depois atualiza o desenho e o enquadramento, preservando o quadro atual. Um único `Run` com `Cell Sphere` e depois `Cell Fixed` é reconhecido quando o bloco inicial confirma a esfera fixa; `Cell None` não desenha uma parede.

Para uma **cela esférica elástica**, o ORCA registra `Cell Dens.` (g/cm³) e `Av.Press.` (bar) na tabela de MD e no CSV. O laboratório usa a esfera e a densidade impressas em `Initial Wall Info` para reconstruir cada raio por `R(t) = R_inicial × (ρ_inicial / ρ(t))^(1/3)`, assumindo massa constante. O volume derivado é `4πR³/3`. O raio é **aproximado**, com precisão limitada pelo arredondamento dos valores impressos; não é um dump direto da geometria da cela. A legenda e o indicador distinguem o raio reconstruído, o volume derivado, a densidade, a pressão média do ORCA e a pressão externa alvo. A pressão média não precisa coincidir com o alvo. Esse confinamento de um agregado finito não é classificado automaticamente como NVT ou NPT.

Os opcionais **C1–C3** comparam rigidez (`Spring 10 × 50`), pressão externa (`1 × 1000 bar`) e liberação da esfera comprimida (`Fixed × None`). A referência a 1 bar expande a esfera; a de 1000 bar a comprime, com oscilações do raio durante a trajetória. Os indicadores mostram os estados medidos de cada cálculo, em seu relógio original. Todos os quadros originais dos casos Cell e das comparações com/sem parede são carregados: 2000 em cada ramo de pressão, 1000 em cada ramo de rigidez/liberação e 4000 em cada referência longa do 04b. Não há redução da trajetória nem interpolação de posições nesses exemplos.

O raio só aparece quando a densidade corresponde ao tempo e ao passo do quadro, respeitando a identidade da fonte em sequências. Sem amostra correspondente, a parede é retirada e o indicador informa a lacuna. Nenhum raio é interpolado ou mantido de um quadro anterior. A câmera preserva a posição escolhida durante a contração ou expansão. O CSV tem prioridade sobre as linhas de energia do `.out`, depois de verificar a compatibilidade dos arquivos.

XYZ e CSV isolados não definem a esfera inicial, e `.inp` diretamente ainda não é um formato aceito. Cubos/cubóides, mudanças de parede entre vários `Run`, unidades/sintaxes não reconhecidas e estados sem calibração inicial suficiente não são desenhados. O laboratório informa a limitação e não conserva uma parede de outra etapa. Uma saída sem input reproduzido pode fornecer a esfera elástica inicial pelo bloco `Initial Wall Info`; a ligação aos quadros ainda exige os tempos e passos registrados.

O formato CSV esperado é o nativo do ORCA: ponto e vírgula, ponto decimal, `Sim. Time` em fs, energias em Hartree e `Temp` em K. A constante de conversão usada é 1 Eh = 2625,4996394799 kJ/mol. `Cons.Qty` permanece separada de `E_Tot`; `E.Drift` não é tratado como uma energia.

Valores ausentes permanecem ausentes. Linhas incompletas, mudanças na ordem dos átomos, tempos não monotônicos e discrepâncias entre `.out` e CSV são sinalizados. Trechos descontínuos não são unidos por linhas no gráfico. Um XYZ convencional sem relógio usa números de quadro, sem inventar fs. Coordenadas convencionais são interpretadas em Å; um comentário explícito em outra unidade é rejeitado. O limite é **1 GB por arquivo** (1.073.741.824 bytes, 1024 MiB), inclusive. Arquivos maiores são recusados antes da leitura.

Os uploads são lidos em partes de 4 MiB, com progresso, usando os mesmos leitores de coordenadas, energias, Colvars e metadados. O arquivo inteiro não precisa virar um único texto na memória. Os dados extraídos, incluindo todos os quadros completos da trajetória, continuam na RAM; o desempenho depende da quantidade de átomos/quadros e da memória disponível.

A atualização de 06/10/2026 passou nos **164 testes** do aplicativo, incluindo associações com nomes distintos, conflitos entre cálculos, geometrias estáticas junto a animações e recortes de gráficos. Dois conjuntos próprios, com 10.001 e 5.001 quadros, foram conferidos no navegador local; os arquivos permanecem privados. A verificação anterior de 04/10/2026 passou nos 121 testes então existentes, incluindo o limite inclusive, recusa antes da leitura, continuidade entre blocos e comparação com arquivos reais. No navegador, um XYZ sintético de exatamente 1 GiB, com dois quadros e preenchimento em branco, foi carregado até o último quadro. Esse teste verifica tamanho e leitura completa; não é um benchmark de uma trajetória densa de 1 GiB.

Os gráficos mostram os pontos lidos, sem suavização. A média indicada descreve os registros no intervalo de tempo selecionado, não uma estimativa independente de equilíbrio. O limite vertical apenas recorta o desenho; não filtra os registros das estatísticas. Uma região entre amostras pode conter um segmento do traço sem conter um valor registrado; o aplicativo informa essa situação. Amplitude é máximo menos mínimo, não uma medida de deriva monotônica. O aplicativo não estima energias livres, constantes de formação, taxas ou qualidade do método eletrônico.

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

As referências principais do dímero neutro e do etanol NVE têm **5 ps**; a do próton compartilhado tem **10 ps**. Cada uma conserva o trecho original e acrescenta uma continuação por restart, com todos os quadros disponíveis. As referências curtas continuam acessíveis pelos links dos exercícios e por estes links diretos: [dímero de água · 2 ps](index.html?exemplo=water_short&aba=trajetoria), [etanol NVE · 0,5 ps](index.html?exemplo=ethanol_short&aba=trajetoria) e [H₅O₂⁺ · 2 ps](index.html?exemplo=proton_shared_short&aba=trajetoria). As [versões individuais da água](../exercicios/1-agua-dft/index.html#agua-isolada) e o [SOLVATOR com duas águas adicionadas](index.html?exemplo=solvator_two&aba=trajetoria) também permanecem disponíveis. A comparação NVE × CSVR da água já contém ambos os resultados. As comparações de timestep e de termostato mantêm seus dados originais. O tempo físico e a duração da reprodução são controles diferentes.

Quando há etapas com tempos explícitos nos metadados, **Trecho para observar** permite observar cada etapa durante a duração escolhida, com duração automática baseada nos quadros originais; durações fixas também estão disponíveis. O padrão é **Trajetória completa**. Escolher uma etapa pausa a animação e leva ao primeiro quadro disponível nesse intervalo; iniciar a reprodução mostra apenas seus quadros; **Repetir** permite voltar automaticamente ao início do trecho. Setas, número do quadro, controle deslizante e gráficos continuam permitindo examinar a trajetória inteira. Nenhum tempo ou coordenada é interpolado ou alterado.

Nas trajetórias com um único relógio físico, o tempo usa campos estáveis em fs, ps e segundos, com precisão fixa durante cada trajetória. A reprodução acompanha o relógio do navegador e começa em **Automática · quadros originais**: 20 quadros/s a 1× nos trechos curtos e ciclos de 78 s nas trajetórias mais longas. As demonstrações de parede mantêm os 78 s escolhidos para observar o efeito. O etanol instável de 131 quadros passa de 78 s para 6,55 s; a referência de falha abrupta tem somente quatro quadros e é mostrada em 0,2 s. O player pausa no quadro final. Não existe interpolação de posições, suavização dos dados ou geração de quadros. Para observar uma geometria por mais tempo, pause ou use as setas; para reduzir a velocidade, escolha uma duração fixa ou um multiplicador menor, ciente de que isso aumenta a permanência de cada quadro. A nota sob os controles informa duração, número de quadros originais e cadência prevista. Para uma duração fixa, 78 s a 0,5× produzem um ciclo de 156 s; a 2×, de 39 s. Por padrão, a animação pausa no último quadro para permitir observar o resultado, sem salto para o início. Aperte Reproduzir novamente para recomeçar ou marque **Repetir** para ativar ciclos. Mudar a duração, a velocidade ou a repetição durante a reprodução preserva a posição atual. Isso não prolonga a simulação nem altera os tempos do XYZ. O navegador pode pular quadros de exibição quando o desenho demora; as setas permitem inspeção individual dos quadros carregados.

A referência **Zn–en: hidratação e quelação** reúne etapas documentadas do mesmo sistema de 97 átomos: hidratação, encontro, aproximação assistida do primeiro N e segundo N livre de força de coordenação. Aos **7083 fs**, as posições do encontro selecionado são preservadas e as velocidades são reinicializadas a 300 K. Por isso, os eixos mostram **Tempo da sequência**, com o relógio original e a fonte de cada quadro disponíveis. O salto de energia nessa fronteira vem da reinicialização, não representa calor de reação. As curvas ficam separadas por etapa, sem deslocamento vertical entre fontes; a opção ΔE subtrai apenas o primeiro valor de cada curva. O exemplo anterior continua no [link direto](index.html?exemplo=chelation_previous&aba=trajetoria), sem adicionar outra opção ao menu.

A sequência usa uma prévia de aproximadamente 6001 quadros, acrescida das fronteiras e do último quadro. O preparo lê os XYZ de cada etapa separadamente; não exige um XYZ combinado acima do limite de upload. Os arquivos de cada etapa preservam todos os dados e seus relógios originais. A exportação das energias inclui o tempo exibido, o tipo de relógio, a fonte, o tempo original e o passo original; não inventa um passo global.

Algumas referências de sistemas maiores, como Zn–en e gotas protonadas, usam uma prévia amostrada para reduzir a transferência, sempre identificada sob a animação. Nas prévias, **Trecho para observar** seleciona os quadros carregados dentro dos tempos da etapa. O dímero neutro de 5 ps, o etanol NVE de 5 ps e o H₅O₂⁺ de 10 ps mantêm todos os quadros no aplicativo. Cada coordenada e tempo mostrado vem de um quadro real; não há interpolação. Os links para os XYZ originais mantêm todos os quadros e os uploads são lidos integralmente. Energias não são reduzidas.

- Timestep: 2,5 fs causa uma falha progressiva, com registros até 325 fs, identificada como dados parciais; 0,5 fs demonstra a correção.
- Parede: comparação de 2 ps; a esfera indica uma parede fixa reconhecida no input do `.out`. XYZ sozinho não define uma parede.
- H₂O@C₆₀: carbonos em armação fina para permitir ver a água interna; nenhuma posição é alterada.

## Medidas químicas e protocolos

Em **Geometria**, escolha distância (2 átomos, Å), ângulo (3 átomos, graus) ou diedro (4 átomos, graus). O atalho do etanol usa C 0–C 1–O 2–H 8. O gráfico usa o intervalo fixo −180° a 180°, com marcas em −180°, −90°, 0°, 90° e 180°. Interrompe a linha ao cruzar +180°/−180°, que são a mesma orientação, para não desenhar uma rotação fictícia de 360°. Uma oscilação em torno desse limite aparece nas duas bordas; isso é periodicidade, não um salto físico de 360°. Os valores originais são preservados, sem unwrapping, suavização ou interpolação. Pontos isolados permanecem visíveis; os inícios de trechos com linhas não recebem pontos decorativos repetidos. O CSV conserva os valores assinados e os trechos da fonte. Não misture graus e Å no mesmo eixo.

O critério visual inicial de ligação H usa D/A = N ou O, H ligado geometricamente ao doador, H···A ≤ 2,5 Å, D···A ≤ 3,5 Å e D–H···A ≥ 150°. É um filtro de visualização para estes exercícios, não a definição universal de ligação H. Coordenação usa um corte geométrico editável, inicialmente 2,6 Å para Zn···N/O; sua adequação depende do metal e do ligante.

O painel adicional **Orientação circular**, abaixo do gráfico de diedros, coloca −180° e +180° no mesmo lugar. O ponto cheio e a linha radial mostram o ângulo do quadro selecionado; o ponto vazado indica o quadro imediatamente anterior, quando ele pertence ao mesmo trecho e não há lacuna. Assim, +179° e −179° aparecem lado a lado. Percorra os quadros pelo controle de tempo, pelas setas ou pelo número do quadro; passar o cursor ou usar o teclado no gráfico assinado também atualiza o círculo. **Próxima passagem por ±180°** leva à próxima ocorrência registrada em qualquer medida selecionada, voltando à primeira depois da última; o botão fica desativado quando não existe ocorrência. Mudanças de fonte, lacunas ou relógios não crescentes não contam como passagem. Uma linha tracejada no gráfico assinado marca o quadro selecionado. Cada medida tem seu próprio círculo, com o mesmo quadro para todas. O instante e o quadro originais ficam indicados, inclusive o relógio de origem de sequências. Isso é uma projeção do ângulo em um círculo, não uma vista espacial da molécula ou uma nova trajetória: nenhum valor é normalizado, suavizado ou interpolado. Os rótulos compactos mostram até três casas decimais; o valor completo fica acessível sobre o rótulo e no CSV original. A curva assinada e sua exportação permanecem inalteradas.

Quando o `.out` contém uma sequência simples de `Run`, o laboratório mostra as etapas programadas e os alvos/rampas de temperatura. O programa não comprova que a dinâmica chegou ao fim de todas as etapas: confira o tempo efetivo dos dados. Reinícios e programas regionais não recebem uma linha do tempo inferida sem suporte. O valor-alvo do termostato não é a temperatura instantânea medida.

O exemplo de timestep permite examinar os primeiros 75 fs antes do aquecimento extremo. O etanol em etapas mostra libração e mudanças de orientação da hidroxila em 5 ps. Nenhum dos dois estima uma barreira ou população de equilíbrio.

### Hidratação antes da associação

[Águas inicialmente afastadas](index.html?exemplo=hydration&aba=trajetoria) mostra a formação da primeira camada em 250 fs. [Encontro em 5 ps](index.html?exemplo=hydration_long&aba=trajetoria) acompanha a en, que permanece intacta e ainda não se coordena nesta referência. [Roteiro e inputs](../exercicios/7-dinamica-complexo/hidratacao.html).
