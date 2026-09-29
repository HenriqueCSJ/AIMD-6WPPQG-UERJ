# 5. Aquecer, explorar, resfriar — no mesmo input

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**25 min · etanol · XTB2 · 5 ps = 5 × 10⁻¹² s**

> **Pergunta:** Como mudar as condições e acompanhar a resposta conformacional?

## 1. Programe uma história contínua

O ORCA executa o `%md` **linha por linha**. Um `Run` avança a trajetória com as condições correntes; o próximo continua das posições e velocidades deixadas pelo anterior. Aqui **não repetimos `Initvel`**: não sorteamos uma nova trajetória a cada etapa.

- **0–0,5 ps:** alvo de 300 K, início da termalização.
- **0,5–1,5 ps:** rampa do alvo de 300 para 600 K.
- **1,5–3,5 ps:** manutenção do alvo final, 600 K.
- **3,5–4,5 ps:** rampa de 600 para 300 K.
- **4,5–5 ps:** continuação a 300 K.

**São alvos do termostato.** A temperatura instantânea flutua e não acompanha uma linha perfeita, sobretudo em nove átomos. Durante as rampas, não há um único estado NVT estacionário.

## 2. Execute e acompanhe as etapas

[Baixar pacote](aula-etanol_etapas.zip) · [Input](inputs/etanol_etapas.inp) · [Estrutura](estruturas/etanol.xyz)

```text
# Exemplo didatico; oito processos solicitados.
! MD XTB2 PAL8
%maxcore 256

%md
  Randomize 42
  Initvel 300_K
  Dump Position Stride 1 Filename "etanol_etapas-traj.xyz"
  Timestep 0.5_fs
  # 0-0.5 ps: inicio a 300 K.
  Thermostat CSVR 300_K Timecon 100_fs
  Run 1000
  # 0.5-1.5 ps: aquecer gradualmente ate 600 K.
  Thermostat CSVR 300_K Timecon 100_fs Ramp 600_K
  Run 2000
  # 1.5-3.5 ps: manter o alvo final da rampa.
  Run 4000
  # 3.5-4.5 ps: resfriar gradualmente.
  Thermostat CSVR 600_K Timecon 100_fs Ramp 300_K
  Run 2000
  # 4.5-5 ps: continuar a 300 K, sem reiniciar velocidades.
  Run 1000
end
* xyzfile 0 1 etanol.xyz
```

<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Extraia o pacote e abra o Ubuntu nessa pasta. Com `ORCA_DIR` configurado no guia, copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR primeiro."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp etanol_etapas.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_etapas.inp > etanol_etapas.out 2>&1
  tail -n 12 etanol_etapas.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` e localize a pasta `execucao-…`. Carregue **`etanol_etapas.out`**, **`etanol_etapas-md-ener.csv`** e **`etanol_etapas-traj.xyz`** no laboratório. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Extraia o pacote em uma pasta nova. Abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' etanol_etapas.inp > etanol_etapas.out 2>&1
Get-Content etanol_etapas.out -Tail 12
```

</details>

## 3. Relacione temperatura e orientação

[Abrir a trajetória em etapas](../../visualizador/index.html?exemplo=thermostat&aba=trajetoria)

1. Veja a faixa de etapas no laboratório e acompanhe a marca ativa durante a animação. A programação vem do input; o tempo efetivamente simulado vem dos dados.
2. Em **Geometria → Diedro**, meça **0–1–2–8**. Compare o controle do exercício 3, que só librava, com esta trajetória: **−55,7° em 0 ps, +52,3° em 1,5 ps e +62,6° em 5 ps**.
3. Confirme que O 2–H 8 permanece entre **0,917 e 1,022 Å**. O H muda de orientação em torno de C–O; ele não foi transferido para outro átomo.
4. Na energia, o banho pode fornecer e retirar energia. Agora uma mudança de E não tem o mesmo significado que no teste NVE do timestep.

**O que vimos:** acesso a orientações gauche de sinais opostos e excursões por outras regiões durante um protocolo de aquecimento/resfriamento. Uma passagem de +180° para −180° é a convenção periódica do diedro, não um salto físico de 360°.

**O que não medimos:** barreira de rotação, populações de equilíbrio ou cinética a 300 K. O aquecimento é uma intervenção deliberada para ampliar o movimento na aula; esta única trajetória não demonstra que ele foi necessário ou suficiente para cada transição.

O cálculo levou **150,1 s** com PAL8 nesta máquina. Se atrasar, use a referência e mantenha a discussão. O [controle anterior NVE × CSVR a 300 K](../../visualizador/index.html?exemplo=thermostat_compare) continua disponível para isolar o efeito de ligar um banho com a mesma duração.

## Resultados e manual

- **etanol_etapas:** [saída](resultados/etanol_etapas/etanol_etapas.out) · [input usado](resultados/etanol_etapas/etanol_etapas.inp) · [energias](resultados/etanol_etapas/etanol_etapas-md-ener.csv) · [trajetória](resultados/etanol_etapas/etanol_etapas-traj.xyz) · [tempo de execução](resultados/etanol_etapas/execucao.json).

[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

[Execução sequencial dos comandos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#input-format) · [Thermostat e Ramp](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#thermostat).
