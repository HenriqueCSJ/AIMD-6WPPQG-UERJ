# Execute. Observe. Explique.

[← Início do minicurso](../index.html) · [Abrir o laboratório](../visualizador/index.html) · [Horários](roteiro-4h.md) · <a href="../guia-md/index.html" target="_blank" rel="noopener">Guia de parâmetros %md ↗</a>

**7 de outubro · 13h–16h e 17h–18h · remoto**
Henrique de Castro Silva Junior · Virginia Camila Rufino Ferreira

## Como seguir sem se perder

Use **Próximo** no topo ou no fim de cada atividade. O indicador **Etapa X de 8** e o mapa lateral mostram onde você está. A ordem é: água e dímero → etanol → timestep → aquecer/resfriar → SOLVATOR → parede → quelato → H compartilhado. Os complementos opcionais ficam em uma seção separada; entrar neles não é necessário para completar a aula.

**[Começar na etapa 1 de 8](1-agua-dft/README.md)** · [Roteiro com horários](roteiro-4h.md)

## Durante a aula

Cinco blocos conectam movimento, integração, controle térmico, coordenação e transferência de H. Comece pelas medidas da água isolada em uma trajetória DFT pronta. As execuções propostas usam **XTB2**, e os resultados fornecidos permitem continuar a interpretação enquanto um cálculo local termina.

**Mais tempo para observar:** o laboratório oferece referências de **5 ps** para o dímero neutro e o etanol NVE e de **10 ps** para H₅O₂⁺. As versões curtas e seus inputs continuam disponíveis para a execução durante a aula. A reprodução começa em **60 segundos por ciclo**, com duração e velocidade ajustáveis.

### 01 · Água: da molécula à ligação H

[01a · Água isolada](1-agua-dft/README.md#agua-isolada) → [01b · Dímero](1-agua-dft/README.md#dimero) · [Começar no laboratório](../visualizador/index.html?exemplo=water_single&aba=trajetoria) · **25 min de aula**

Uma água: meça O–H e H–O–H, acompanhe K/U/E e distinga velocidades iniciais de controle térmico. O [par XTB2 pronto compara NVE e CSVR por 500 fs](../visualizador/index.html?exemplo=water_thermostat&aba=trajetoria); a discussão de IV/Raman liga movimento molecular e propriedades vibracionais. Depois, duas águas: execute **2 ps = 2 × 10⁻¹² s** e investigue a troca de doador/aceptor da ligação H. Execução de referência do dímero: **56 s**.

### 02 · Etanol: perceber o erro e corrigir

[Começar pelo controle NVE](3-xtb2-etanol/README.md) → [Timestep inadequado e correção](4-timestep/README.md) · **35 min no total**

Observe o diedro, compare as energias e descubra por que o cálculo fica instável. Volte à estrutura íntegra e reduza o timestep. Controle, falha e correção levaram aproximadamente **16, 10 e 19 s**, respectivamente. A falha não representa uma reação química.

### 03 · Aquecer, explorar, resfriar

[Abrir atividade](5-termostato/README.md) · [Ver no laboratório](../visualizador/index.html?exemplo=thermostat&aba=trajetoria) · **25 min**

Cinco etapas contínuas no mesmo input. Acompanhe a temperatura e o diedro C–C–O–H por **5 ps = 5 × 10⁻¹² s**. Execução de referência: **2min30**. Alvo do termostato e temperatura instantânea são coisas diferentes.

### 04 · Zn–en: solvente, parede e quelato

[A · Construir com SOLVATOR](6-complexo-solvator/README.md) → [B · Comparar com/sem parede](7-dinamica-complexo/README.md) → [C · Identificar a formação do quelato](11-formacao-quelato/README.md)

**45 min antes do intervalo + 20 min no retorno.** SOLVATOR e dinâmica com parede são executados ao vivo; os controles e a associação Zn–en são interpretados a partir de resultados prontos. Veja a diferença entre reter água perto do complexo e coordená-la ao metal. Na associação, identifique dois N da mesma en e duas águas deslocadas. A aproximação inicial foi guiada e está identificada na atividade.

### 05 · Um próton entre duas águas

[Abrir atividade](10-proton-compartilhado/README.md) · [Ver no laboratório](../visualizador/index.html?exemplo=proton_shared&aba=trajetoria) · **20 min**

H₅O₂⁺, sete átomos: **10 ps prontos para observar**, com o input curto de **2 ps em cerca de 2 min de execução** disponível para a aula. Compare as duas distâncias O–H: onde está o próton e quando ele retorna? Compartilhamento e recrossamentos ficam visíveis; esta molécula isolada não representa transporte de prótons na água líquida.

## Opcionais e referências

**Novo módulo [C · Celas de simulação e pressão](13-cell-pressao/README.md):** siga C1 (rigidez) → C2 (pressão e parede móvel) → C3 (fixar ou remover), com referências prontas. Retorne ao 04b ou siga para 04c ao terminar. O [Dump complementar](1-agua-dft/README.md#alem-das-posicoes) fica apenas no exercício inicial da água.

Estes materiais ficam fora do percurso obrigatório. Abra as trajetórias prontas ou continue os cálculos depois da aula.

- **[DFT e solvente implícito](2-solvente-implicito/README.md):** compare o dímero no vácuo e com CPCM, usando o mesmo método. Nenhuma execução DFT é exigida durante a aula.
- **[Gota protonada, 300/400/500/600 K](12-gota-protonada/README.md):** investigue transferência, compartilhamento, retornos e dispersão. Aquecer não garante propagação sustentada; as condições partem do mesmo checkpoint.
- **[Água dentro de C₆₀](8-agua-no-fulereno/README.md):** confinamento por uma gaiola molecular, com trajetória pronta. Execução de referência: cerca de 4 min.
- **[Hidratação do Zn a partir de águas afastadas](7-dinamica-complexo/hidratacao.html):** observe a primeira camada se formar; a referência de 5 ps não forma o quelato.
- **[Al³⁺/água/amônia](9-aluminio-amonia/README.md):** arquivo de testes com XTB2 e ajuste de convergência. Não é parte da aula; a reprodução DFT foi interrompida.

Controles adicionais de timestep e termostato e dinâmicas curtas estão agrupados em **Opcionais e referências** na lista do laboratório. Não é necessário executar todas as variantes.

## Antes de começar

Conclua os [testes de instalação](../tutoriais/03-testar-instalacao.md) e de [XTB2/SOLVATOR](../tutoriais/05-xtb-solvator.md). Baixe e extraia o pacote da atividade em uma pasta nova. Os inputs usam **PAL8**; adapte a PAL2/PAL4 se necessário e rode **um cálculo por vez**.

Carregue juntos **`.out`**, **`-md-ener.csv`** e **`-traj.xyz`**. O laboratório lê seus arquivos localmente. Na trajetória, use **Mover** para reposicionar a molécula e acompanhe o marcador nas curvas de energia. Você também pode abrir o resultado pronto.

O [roteiro de quatro horas](roteiro-4h.md) preserva **15 min de descanso, 25 min de margem e o intervalo de 16h–17h**. Os tempos de execução das referências foram medidos na máquina de referência; variam entre computadores. O par XTB2 da água já tem resultados prontos: aproximadamente 18 s de execução para NVE e 15 s para CSVR. Ao terminar, registre uma observação, sua interpretação e algo que a trajetória ainda não permite concluir.

## Como executar

**Input e geometria:** os exemplos pequenos independentes usam `* xyz carga multiplicidade`, com as coordenadas dentro do próprio input; o XYZ separado é opcional para executar e serve para consultar ou editar a geometria. Os sistemas maiores e as etapas dependentes usam `* xyzfile carga multiplicidade arquivo.xyz`: nesse caso, o XYZ é obrigatório na mesma pasta do input. Cada atividade oferece os dois downloads lado a lado. Nos reinícios, mantenha também o checkpoint `.mdrestart` indicado: ele fornece o estado de continuação, que o XYZ isolado não substitui. O exemplo de Al exige ainda `scc.inp`.

A configuração do ORCA no PATH é feita **uma vez**, durante a [instalação](../tutoriais/README.md). Nos exercícios, basta entrar na pasta que contém o input e executar o comando mostrado na atividade. Mantenha os arquivos XYZ, de reinício ou outros auxiliares junto do input, conforme o pacote fornecido.

**Ubuntu / WSL2:** abra o Ubuntu e entre na pasta com `cd /caminho/da/pasta`. Depois:

```bash
orca arquivo.inp > arquivo.out &
```

Substitua `arquivo` pelo nome da atividade. `>` grava a saída e `&` deixa o cálculo em segundo plano. Mantenha o terminal aberto e rode **um cálculo por vez**. Para acompanhar:

```bash
tail -f arquivo.out
```

**Ctrl+C** encerra apenas esse acompanhamento. O cálculo lançado em segundo plano continua. `jobs` mostra os trabalhos desse terminal; só inicie o próximo quando o anterior terminar. Para voltar ao cálculo em primeiro plano, use `fg`; nesse caso, Ctrl+C interrompe o cálculo. Confira no final do output `ORCA TERMINATED NORMALLY` ou a mensagem de erro — o exercício de timestep inadequado pode terminar com erro, como previsto.

**Windows nativo:** no Explorador, abra a pasta do input, digite `cmd` na barra de endereço e pressione Enter. No Prompt de Comando:

```bat
orca arquivo.inp > arquivo.out
```

Espere o prompt voltar. No `cmd`, `&` separa comandos e **não** põe o cálculo em segundo plano. Para abrir o terminal em outra pasta por comando, use `cd /d "C:\caminho\da\pasta"`.

Use uma pasta separada para cada variante e mantenha uma cópia dos resultados que quiser conservar antes de repetir um nome: `>` substitui o output existente. Os downloads dos exercícios já reúnem os arquivos necessários, e nenhum comando cria subpastas automáticas.
