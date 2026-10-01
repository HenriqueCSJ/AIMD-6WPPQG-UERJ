# 02a · Etanol: o controle antes da correção

[← Percurso](../README.md) · [Laboratório de trajetórias](../../visualizador/index.html)

**Parte do bloco 02 (35 min com timestep e correção) · etanol · XTB2 · 0,5 ps = 5 × 10⁻¹³ s**

> **Pergunta:** Uma trajetória sem troca de conformação ensina alguma coisa?

## 1. Escolha a medida certa

Uma animação pode esconder a diferença entre a molécula inteira girar e uma rotação **interna**. Para o H da hidroxila, acompanhe o diedro **C 0–C 1–O 2–H 8**, em graus. Ele não muda se girarmos apenas a câmera ou a molécula como um corpo rígido.

Vamos começar com uma trajetória curta, sem termostato: ela será o controle para o timestep e para as etapas de temperatura. `Initvel 300_K` inicializa velocidades; não mantém o sistema a 300 K.

## 2. Execute

[Baixar pacote](aula-etanol_nve.zip) · [Input](inputs/etanol_nve.inp) · [Estrutura](estruturas/etanol.xyz)

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
  Dump Position Stride 1 Filename "etanol_nve-traj.xyz"
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
  cp etanol_nve.inp etanol.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" etanol_nve.inp > etanol_nve.out 2>&1
  tail -n 12 etanol_nve.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` e localize a pasta `execucao-…`. Carregue **`etanol_nve.out`**, **`etanol_nve-md-ener.csv`** e **`etanol_nve-traj.xyz`** no laboratório. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa: Windows nativo</summary>

Extraia o pacote em uma pasta nova. Abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' etanol_nve.inp > etanol_nve.out 2>&1
Get-Content etanol_nve.out -Tail 12
```

</details>

## 3. Distinga os dois movimentos

[Abrir o controle curto](../../visualizador/index.html?exemplo=ethanol&aba=distancias) · [Comparar com o etanol em etapas](../../visualizador/index.html?exemplo=thermostat&aba=distancias)

1. Em **Geometria**, use o atalho para a torsão do etanol ou selecione **Diedro**, com índices **0, 1, 2, 8**.
2. No controle NVE, o diedro vai de **−73,9° a −33,7°** em 0,5 ps: oscila em torno de uma orientação gauche. Isso é **libração**, sem troca de região conformacional observada.
3. Selecione **Distância**, O 2–H 8. A ligação vibra entre **0,939 e 0,992 Å**. Esse movimento não é rotação da hidroxila nem transferência de próton.
4. Abra a referência **em etapas**: a 1,5 ps o diedro é **+52,3°**, enquanto no início era **−55,7°**. Há acesso a outra orientação; o O–H continua ligado. No bloco 03 vamos executar e explicar o programa que produziu isso.

**Interpretação:** uma molécula pode vibrar e permanecer na mesma região conformacional durante toda uma trajetória curta. Ausência de troca em 0,5 ps não mede a barreira nem prova que outra conformação seja inacessível. A faixa angular, o tempo passado em cada região e a integridade das ligações respondem a perguntas diferentes.

**Por que XTB2 aqui?** O custo baixo permite repetir e prolongar o cálculo durante a aula. É GFN2-xTB, um modelo semiempírico de estrutura eletrônica; não devemos interpretar sua energia como uma energia DFT.

## Resultados e manual

- **etanol_nve:** [saída](resultados/etanol_nve/etanol_nve.out) · [input usado](resultados/etanol_nve/etanol_nve.inp) · [energias](resultados/etanol_nve/etanol_nve-md-ener.csv) · [trajetória](resultados/etanol_nve/etanol_nve-traj.xyz) · [tempo de execução](resultados/etanol_nve/execucao.json).

[Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).
