# 02b · A instabilidade aparece antes da explosão

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**Parte do bloco 02 (35 min com o controle NVE) · etanol · XTB2 · NVE**

> **Pergunta:** A temperatura parecer razoável significa que a integração está boa?

## 1. Aumente o passo — de propósito

Use **2,5 fs**, mantendo a geometria inicial, a semente e o alvo de **500 fs = 5 × 10⁻¹³ s**. A referência registra **131 quadros, até 325 fs**, e termina com erro. Não chegamos ao alvo.

[Baixar pacote](aula-etanol_instavel.zip) · [Input](inputs/etanol_instavel.inp) · [Estrutura](estruturas/etanol.xyz)

```text
# Exemplo didatico; oito processos solicitados.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "etanol_instavel-traj.xyz"
  # Passo propositadamente excessivo; nao usar em producao.
  Timestep 2.5_fs
  Thermostat None
  Run 200
end
* xyzfile 0 1 etanol.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Extraia o pacote e abra o Ubuntu nessa pasta. Com `ORCA_DIR` configurado no guia, copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR primeiro."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_instavel.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_instavel.inp > etanol_instavel.out 2>&1
  tail -n 12 etanol_instavel.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` e localize a pasta `execucao-…`. Carregue **`etanol_instavel.out`**, **`etanol_instavel-md-ener.csv`** e **`etanol_instavel-traj.xyz`** no laboratório. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Extraia o pacote em uma pasta nova. Abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' etanol_instavel.inp > etanol_instavel.out 2>&1
Get-Content etanol_instavel.out -Tail 12
```

</details>

## 2. Leia os avisos da própria trajetória

No filme, use **0,25×** ou avance quadro a quadro para examinar a degradação; o quadro 31 corresponde a 75 fs. A velocidade de reprodução não altera a simulação.

[Abrir falha e correção](../../visualizador/index.html?exemplo=timestep)

1. Selecione **Total · E**, em ΔE, e examine **os primeiros 75 fs**. A energia não precisa esperar o cálculo abortar para revelar o erro.
2. A 25 fs, T é **127 K**, mas ΔE já é **+23,2 kJ/mol**. A 75 fs, T é **269 K** e ΔE chega a **+43,6 kJ/mol**. Temperatura aparentemente plausível não garante boa integração.
3. Volte à trajetória completa. A 100 fs, T já é aproximadamente **69 mil K**. Em Geometria, O 2–H 8 está a **19,8 Å**: o modelo numérico perdeu o sentido químico muito antes da última linha do output.
4. O último registro é de **325 fs**, seguido de erro de avaliação eletrônica. O `.scf.log` preservado permite conferir o diagnóstico. O instante exato da falha pode mudar entre ambientes.

**Por que ocorre?** As forças mudam rapidamente quando ligações envolvendo H esticam. Um passo grande atualiza as posições usando informação que já não descreve bem a força no novo ponto. O erro de integração aumenta as distorções e pode alimentar ainda mais energia. A ruptura neste cálculo não é evidência de uma reação física.

## 3. Corrija a causa e repita

Volte à **estrutura inicial intacta**, sem usar o restart defeituoso. Reduza para **0,5 fs** e use **1000 passos** para conservar o alvo de 500 fs. O resultado corrigido abaixo já está calculado e pode ser reutilizado do controle 02a.

[Baixar pacote](aula-etanol_corrigido.zip) · [Input](inputs/etanol_corrigido.inp) · [Estrutura](estruturas/etanol.xyz)

```text
# Etanol com GFN2-xTB, sem banho termico (NVE).
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "etanol_corrigido-traj.xyz"
  # 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 etanol.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Extraia o pacote e abra o Ubuntu nessa pasta. Com `ORCA_DIR` configurado no guia, copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR primeiro."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_corrigido.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_corrigido.inp > etanol_corrigido.out 2>&1
  tail -n 12 etanol_corrigido.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` e localize a pasta `execucao-…`. Carregue **`etanol_corrigido.out`**, **`etanol_corrigido-md-ener.csv`** e **`etanol_corrigido-traj.xyz`** no laboratório. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Extraia o pacote em uma pasta nova. Abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' etanol_corrigido.inp > etanol_corrigido.out 2>&1
Get-Content etanol_corrigido.out -Tail 12
```

</details>

Na correção, o ORCA termina normalmente e a amplitude máximo–mínimo de E é cerca de **0,30 kJ/mol**, em vez do crescimento da execução instável. Desmarque a falha para enxergar essa escala pequena. Verifique também a duração e as distâncias; término normal sozinho não basta.

**Não use um termostato para esconder o erro de integração.** Reduzir o timestep e repetir de um estado íntegro é a correção demonstrada. Aumentar somente o limite de ciclos SCF não resolve a causa deste caso.

<details markdown="1"><summary>Controles adicionais: precisão e falha abrupta</summary>

[Comparar 0,25 / 0,5 / 2 fs](../../visualizador/index.html?exemplo=timestep_accuracy). Todos completaram 500 fs, mas o passo de 2 fs tem amplitude de energia de aproximadamente 6,63 kJ/mol. Há erro relevante mesmo sem abortar.

O [exemplo anterior de 5 fs](../../visualizador/index.html?exemplo=timestep_abrupt) fica como apoio: ele falha em apenas 15 fs. A nova atividade usa 2,5 fs para permitir observar a degradação durante mais tempo.

</details>

## Resultados e manual

- **etanol_instavel:** [saída](resultados/etanol_instavel/etanol_instavel.out) · [input usado](resultados/etanol_instavel/etanol_instavel.inp) · [energias](resultados/etanol_instavel/etanol_instavel-md-ener.csv) · [trajetória](resultados/etanol_instavel/etanol_instavel-traj.xyz) · [tempo de execução](resultados/etanol_instavel/execucao.json).
- **etanol_corrigido:** [saída](resultados/etanol_corrigido/etanol_corrigido.out) · [input usado](resultados/etanol_corrigido/etanol_corrigido.inp) · [energias](resultados/etanol_corrigido/etanol_corrigido-md-ener.csv) · [trajetória](resultados/etanol_corrigido/etanol_corrigido-traj.xyz) · [tempo de execução](resultados/etanol_corrigido/execucao.json).

[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

[Registro eletrônico da falha](resultados/etanol_instavel/etanol_instavel.scf.log).
