# Laboratório de trajetórias

[Abrir o aplicativo](index.html) · [Exemplo de timestep](index.html?exemplo=timestep) · [Exemplo do complexo](index.html?exemplo=complex)

O aluno carrega os arquivos e passa diretamente à interpretação. Não precisa importar colunas em uma planilha, instalar Python ou escrever comandos para medir distâncias.

## Para usar na aula

1. Abra `visualizador/index.html` em um navegador moderno, mantendo as pastas do repositório juntas. Também funciona pelo site estático quando o repositório estiver publicado.
2. Selecione `nome-md-ener.csv` e, se disponíveis, `nome.out` e `nome-traj.xyz`. Pode carregar todos juntos. Arquivos com o mesmo nome-base são associados. Recarregar uma série que já existe cria outra entrada, preservando a anterior.
3. Explore **Energia e temperatura**, **Trajetória** e **Distâncias**. Para comparar, carregue outro cálculo e marque até quatro simulações.

No WSL, use `explorer.exe .` na pasta do cálculo para encontrá-la pelo seletor de arquivos do Windows. O aplicativo não precisa executar dentro do WSL.

O botão de exemplos oferece os sete momentos da aula, usando dez cálculos reais já preservados neste repositório. Os exemplos são identificados como referências dos ministrantes. A cópia local inclui os dados e a biblioteca molecular: a leitura e os exemplos não precisam de internet. Links para o manual do ORCA são externos.

## O que pode ser observado

- **Energias cinética, potencial e total**, em Hartree ou kJ/mol; valores absolutos ou variações desde o primeiro valor disponível de cada curva.
- **Temperatura em K**, em um gráfico separado. Condições NVE/NVT são lidas do input reproduzido no `.out`, quando reconhecíveis, ou informadas pelo aluno; não são inferidas da aparência dos números.
- **Tempo em fs, ps ou s**, com duração física explícita, preservando o relógio de um reinício.
- **Animação XYZ**, controle de quadro, rotação, ampliação, índices dos átomos e energias/temperatura do ponto correspondente. A sincronização exige tempo e, quando presente, passo compatíveis; não é feita pela posição da linha.
- **Distância entre quaisquer dois átomos**, calculada diretamente de cada quadro XYZ, sem `Manage_Colvar` no input. Índices começam em zero. Também lê Colvars de distância em Angstrom; forças e ângulos não viram distâncias.
- **Exportação CSV** das séries de energia originais e das distâncias selecionadas. A exportação energética mantém Hartree/fs/K, independentemente da transformação usada no gráfico.

Os traços moleculares são apenas uma ajuda visual por proximidade, entre átomos não metálicos; podem ser desligados. Não codificam ordem de ligação nem comprovam coordenação. O XYZ contém posições, não uma topologia química. Para examinar o Zn, use as distâncias.

## Leitura e limites

O leitor foi conferido com ORCA 6.1.1 e os resultados locais dos exercícios. Um `.out` de MD pode ser suficiente para os gráficos, mas algumas configurações imprimem apenas parte dos passos: o CSV tem prioridade quando os dois são carregados e compatíveis. Uma saída de otimização ou SOLVATOR sem série MD aparece como resultado sem série de energia; carregue o XYZ para explorar sua estrutura.

O formato CSV esperado é o nativo do ORCA: ponto e vírgula, ponto decimal, `Sim. Time` em fs, energias em Hartree e `Temp` em K. A constante de conversão usada é 1 Eh = 2625,4996394799 kJ/mol. `Cons.Qty` permanece separada de `E_Tot`; `E.Drift` não é tratado como uma energia.

Valores ausentes permanecem ausentes. Linhas incompletas, mudanças na ordem dos átomos, tempos não monotônicos e discrepâncias entre `.out` e CSV são sinalizados. Trechos descontínuos não são unidos por linhas no gráfico. Um XYZ convencional sem relógio usa números de quadro, sem inventar fs. Coordenadas convencionais são interpretadas em Å; um comentário explícito em outra unidade é rejeitado. O limite inicial é 80 MB por arquivo, voltado às trajetórias curtas da aula.

Os gráficos mostram os pontos lidos, sem suavização. A média indicada descreve os pontos exibidos, não uma estimativa independente de equilíbrio. Amplitude é máximo menos mínimo, não uma medida de deriva monotônica. O aplicativo não estima energias livres, constantes de formação, taxas ou qualidade do método eletrônico.

Os arquivos são lidos em memória neste navegador. Não há servidor de cálculos, armazenamento remoto, análise por IA, cookies ou envio de arquivos. Recarregar a página limpa a sessão. O código do aplicativo não possui chamadas de rede para processar uploads.

## Manutenção

### Usar pelo GitHub Pages

Depois de enviar os arquivos e ativar o Pages, os alunos acessarão [o aplicativo online](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/) diretamente, sem instalar programas ou fazer login. A configuração necessária está em [PUBLICACAO.md](../PUBLICACAO.md). O site serve HTML/CSS/JavaScript; o ORCA continua sendo executado no computador do participante. Selecionar outputs no aplicativo não os envia ao GitHub.

### Arquivos e verificações

O aplicativo usa HTML/CSS/JavaScript locais, gráficos SVG e [3Dmol.js](https://3dmol.org/) 2.5.5, distribuído com sua [licença BSD](vendor/3Dmol-LICENSE.txt). A referência de formatos é o [manual de MD do ORCA 6.1](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

Para repetir as verificações do leitor, na raiz do repositório:

```text
node --test visualizador/tests/parser.test.cjs
```

Para reconstruir os exemplos a partir dos arquivos originais preservados:

```text
node scripts/build_viewer_examples.cjs
```

Nenhum desses comandos executa ORCA. O aluno não precisa de Node; ele apenas abre o aplicativo. A implementação é uma versão de trabalho para o curso, com verificação funcional e visual local; o ensaio integral com a turma e a publicação ainda são etapas separadas.

Verificação desta versão: 11 testes automatizados aprovados; leitura comparada com nove séries MD reais; doze distâncias do complexo conferidas contra os Colvars originais. Upload, exemplos, animação, seleção de distâncias, conversões de unidades e exportação foram exercitados no navegador, incluindo uma tela de 390 px. A abertura foi verificada por HTTP local. A abertura direta de `index.html` pelo sistema de arquivos não foi verificada, pois esse protocolo é bloqueado no navegador integrado usado para os testes.
