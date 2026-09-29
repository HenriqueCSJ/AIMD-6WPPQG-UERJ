# 8. Água dentro de um fulereno

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Extensão opcional · 10–15 min com referência pronta · 63 átomos**

> **Pergunta:** como uma gaiola molecular confina uma molécula de água?

Voltamos à água do começo da aula, agora dentro de C₆₀. **H₂O@C₆₀ é um sistema sintetizado experimentalmente**, não apenas uma montagem gráfica. Aqui estudamos um modelo isolado com GFN2-xTB: a água começa dentro da gaiola, e todos os 63 átomos podem se mover.

## 1. Prepare

[Baixar a geometria relaxada](estruturas/agua_c60.xyz). Os índices **0, 1 e 2** são O, H e H; os **3–62** são os carbonos. A gaiola foi obtida da base de moléculas do ASE e o conjunto foi relaxado com XTB2 antes da dinâmica. Não se trata de coordenadas experimentais refinadas.

## 2. Execute ou abra a referência

[Pacote para executar](aula-agua_c60.zip) · [Input](inputs/agua_c60.inp)

```text
# Agua encapsulada: todos os atomos da gaiola se movem.
! MD XTB2 PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  Initvel 300_K
  # Banho termico; o confinamento vem do proprio C60.
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "agua_c60-traj.xyz"
  # 2000 x 0.5 fs = 1 ps (1e-12 s).
  Run 2000
end

# Neutro, singlete; geometria previamente relaxada.
* xyzfile 0 1 agua_c60.xyz
```
<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Extraia o pacote em uma pasta nova. Abra o Ubuntu nessa pasta, com `ORCA_DIR` configurado no tutorial, e copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp agua_c60.inp agua_c60.xyz "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" agua_c60.inp > agua_c60.out 2>&1
  tail -n 12 agua_c60.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` para localizar os resultados. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Com ORCA/MS-MPI instalados, extraia o pacote numa pasta nova, abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' agua_c60.inp > agua_c60.out 2>&1
Get-Content agua_c60.out -Tail 12
```

</details>

São **2000 passos × 0,5 fs = 1000 fs = 1 ps = 10⁻¹² s**. A referência PAL8 levou **230.9 s** nesta máquina. Em computadores mais lentos, use a referência e preserve o tempo de discussão.

## 3. Interprete em 3D

[Abrir H₂O@C₆₀ no aplicativo](../../visualizador/index.html?exemplo=fullerene&aba=trajetoria)

1. Gire a gaiola e acompanhe a água no interior. Os carbonos aparecem como uma armação fina para facilitar a visão.
2. Avance no tempo: a água muda de orientação? A gaiola também vibra?
3. Em **Distâncias**, acompanhe **O 0 — H 1** e **O 0 — H 2**. Compare reorientação da molécula com ruptura de ligação.
4. Diferencie os dois confinamentos da aula: no exercício 7 aplicamos um potencial artificial; aqui as interações com os átomos de carbono fazem parte da energia calculada. **Não há `Walls` neste input.**

Esta trajetória curta não descreve a entrada da água através de uma gaiola intacta, o processo de síntese ou a estabilidade de longo prazo. Os núcleos seguem dinâmica clássica; o teste não reproduz os níveis de um rotor quântico, efeitos de ponto zero ou conversão de isômeros de spin da água.

## Arquivos e preparação

- **agua_c60:** [input usado](resultados/agua_c60/agua_c60.inp) · [saída](resultados/agua_c60/agua_c60.out) · [energias](resultados/agua_c60/agua_c60-md-ener.csv) · [trajetória](resultados/agua_c60/agua_c60-traj.xyz).

- [Input de otimização](inputs/preparar_agua_c60.inp) · [estrutura inicial](estruturas/agua_c60_inicial.xyz) · [saída da otimização](resultados/preparar_agua_c60/preparar_agua_c60.out).
- [ASE: código e coordenadas do C₆₀](https://docs.ase-lib.org/_modules/ase/build/molecule.html).
- [Kurotobi e Murata, Science 2011: síntese de H₂O@C₆₀](https://doi.org/10.1126/science.1206376).
- [Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Na aula:** este é um fechamento visual opcional; não substitui a interpretação do complexo nem elimina as pausas. Se a turma estiver atrasada, fica como atividade posterior com arquivos completos.
