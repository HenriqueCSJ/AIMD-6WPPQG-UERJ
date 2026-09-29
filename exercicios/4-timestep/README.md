# 4. Fazer a dinâmica falhar — e corrigir

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**25 min · etanol · XTB2 · sem termostato**

> **Pergunta:** o que acontece quando tentamos avançar rápido demais no tempo?

## 1. Provoque o erro

Use a mesma estrutura do exercício 3, mas aumente o timestep para **5 fs**. O alvo seria 100 passos = 500 fs = 5 × 10⁻¹³ s. Nesta referência, a execução **falhou após o registro de 15 fs**: ela não completou os 500 fs.

[Pacote para executar](aula-etanol_dt500.zip) · [Input](inputs/etanol_dt500.inp)

```text
# Passo grande de proposito: observe o erro de integracao.
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 5.0_fs
  Randomize 42
  # Velocidades iniciais; nao mantem a temperatura fixa.
  Initvel 300_K
  Thermostat None
  Dump Position Stride 1 Filename "etanol_dt500-traj.xyz"
  # 100 x 5 fs = 500 fs (5e-13 s).
  Run 100
end

# Carga 0, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 0 1 etanol.xyz
```
<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Extraia o pacote em uma pasta nova. Abra o Ubuntu nessa pasta, com `ORCA_DIR` configurado no tutorial, e copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_dt500.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_dt500.inp > etanol_dt500.out 2>&1
  tail -n 12 etanol_dt500.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` para localizar os resultados. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Com ORCA/MS-MPI instalados, extraia o pacote numa pasta nova, abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' etanol_dt500.inp > etanol_dt500.out 2>&1
Get-Content etanol_dt500.out -Tail 12
```

</details>

Aqui o término com erro é esperado. Abra o `.out`, o `-md-ener.csv` e o `-traj.xyz`; mesmo um cálculo interrompido deixa dados úteis para o diagnóstico.

## 2. Observe antes de corrigir

[Abrir falha e correção no aplicativo](../../visualizador/index.html?exemplo=timestep) · [Ver a trajetória que falhou](../../visualizador/index.html?exemplo=timestep&aba=trajetoria)

1. Veja a temperatura: **300 K → 3.409,97 K em 5 fs → cerca de 1,37 milhão K em 15 fs**.
2. Em **Total · E**, selecione **Variação desde o início**. A energia cresce violentamente.
3. Avance quadro a quadro na trajetória. As distorções acompanham a perda de estabilidade.
4. No `.out`, procure `unreasonably large`, `Could not compute the energy` e `orca_md aborted by error`.

**Isto é uma falha numérica, não uma reação química confiável.** Os movimentos mais rápidos, especialmente os estiramentos envolvendo H, exigem passos pequenos. Com 5 fs, o integrador avança demais antes de atualizar a força: o erro altera as posições, gera forças exageradas e se amplifica. A avaliação da energia acaba falhando depois da explosão de energia e temperatura.

O [registro eletrônico da falha](resultados/etanol_dt500/etanol_dt500.scf.log) confirma que a autoconsistência de cargas do xTB deixou de convergir. Isso aconteceu depois da perda de estabilidade mostrada nos dados.

## 3. Corrija e repita do começo

Volte à **estrutura inicial intacta** e à mesma inicialização de velocidades. Não reinicie da geometria que explodiu. Reduza `Timestep` para **0.5_fs** e aumente `Run` para **1000**: o alvo continua sendo **500 fs**.

[Pacote para executar](aula-etanol_corrigido.zip) · [Input](inputs/etanol_corrigido.inp)

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

Extraia o pacote em uma pasta nova. Abra o Ubuntu nessa pasta, com `ORCA_DIR` configurado no tutorial, e copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_corrigido.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_corrigido.inp > etanol_corrigido.out 2>&1
  tail -n 12 etanol_corrigido.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` para localizar os resultados. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Com ORCA/MS-MPI instalados, extraia o pacote numa pasta nova, abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' etanol_corrigido.inp > etanol_corrigido.out 2>&1
Get-Content etanol_corrigido.out -Tail 12
```

</details>

Agora procure `ORCA TERMINATED NORMALLY`. No aplicativo, desmarque temporariamente a curva de 5 fs para enxergar a escala pequena das oscilações do caso corrigido. Confirme que a trajetória chegou a 500 fs e que as ligações se mantêm razoáveis.

**Não acrescente um termostato para esconder o aquecimento.** Primeiro corrija a integração. Aumentar apenas o número máximo de ciclos eletrônicos também não resolve a causa demonstrada aqui. O próprio ORCA recomenda até 0,5 fs para sistemas com H sem restrições; esse é um ponto de partida, que ainda deve ser verificado.

<details markdown="1"><summary>Depois da falha: comparar precisão e custo</summary>

[Comparar 0,25, 0,5 e 2 fs](../../visualizador/index.html?exemplo=timestep_accuracy).
Os três casos anteriores completam 500 fs. O caso de 2 fs termina normalmente, mas sua amplitude de energia é maior; ele mostra por que término normal não basta. A referência de 0,25 fs continua em [input](inputs/etanol_dt025.inp) e [pacote](aula-etanol_dt025.zip); a de 2 fs em [input](inputs/etanol_dt200.inp) e [pacote](aula-etanol_dt200.zip).

</details>

## Resultados reais

- **etanol_dt500:** [input usado](resultados/etanol_dt500/etanol_dt500.inp) · [saída](resultados/etanol_dt500/etanol_dt500.out) · [energias](resultados/etanol_dt500/etanol_dt500-md-ener.csv) · [trajetória](resultados/etanol_dt500/etanol_dt500-traj.xyz).
- **etanol_corrigido:** [input usado](resultados/etanol_corrigido/etanol_corrigido.inp) · [saída](resultados/etanol_corrigido/etanol_corrigido.out) · [energias](resultados/etanol_corrigido/etanol_corrigido-md-ener.csv) · [trajetória](resultados/etanol_corrigido/etanol_corrigido-traj.xyz).

**Manual:** [Timestep](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#timestep) · [Integração temporal](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#time-integration).
