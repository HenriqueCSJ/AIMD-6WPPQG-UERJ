# Opcional · Água dentro de C₆₀

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Extensão opcional · 10–15 min com referência pronta · 63 átomos**

> **Pergunta:** como uma gaiola molecular confina uma molécula de água?

Retome as medidas O–H e H–O–H da água isolada. Agora, dentro de C₆₀, também acompanhe a posição e a orientação da água em relação à gaiola para reconhecer o efeito do confinamento. **H₂O@C₆₀ é um sistema sintetizado experimentalmente**, não apenas uma montagem gráfica. Aqui estudamos um modelo isolado com GFN2-xTB: a água começa dentro da gaiola, e todos os 63 átomos podem se mover.

## 1. Prepare

[Baixar a geometria relaxada](estruturas/agua_c60.xyz). Os índices **0, 1 e 2** são O, H e H; os **3–62** são os carbonos. A gaiola foi obtida da base de moléculas do ASE e o conjunto foi relaxado com XTB2 antes da dinâmica. Não se trata de coordenadas experimentais refinadas.

## 2. Execute ou abra a referência

[Pacote para executar](aula-agua_c60.zip) · [Baixar input ORCA](inputs/agua_c60.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua_c60.xyz) (obrigatório; manter na mesma pasta do input)

<!-- input-source: inputs/agua_c60.inp -->
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

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca agua_c60.inp > agua_c60.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca agua_c60.inp > agua_c60.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

São **2000 passos × 0,5 fs = 1000 fs = 1 ps = 10⁻¹² s**. A referência PAL8 levou **230.9 s** nesta máquina. Em computadores mais lentos, use a referência e preserve o tempo de discussão.

## 3. Interprete em 3D

[Abrir H₂O@C₆₀ no aplicativo](../../visualizador/index.html?exemplo=fullerene&aba=trajetoria)

1. Gire a gaiola e acompanhe a água no interior. Os carbonos aparecem como uma armação fina para facilitar a visão.
2. Avance no tempo: a água muda de orientação? A gaiola também vibra?
3. Em **Geometria**, acompanhe **O 0 — H 1** e **O 0 — H 2**. Compare reorientação da molécula com ruptura de ligação.
4. Diferencie os dois confinamentos da aula: no exercício 7 aplicamos um potencial artificial; aqui as interações com os átomos de carbono fazem parte da energia calculada. **Não há `Walls` neste input.**

Esta trajetória curta não descreve a entrada da água através de uma gaiola intacta, o processo de síntese ou a estabilidade de longo prazo. Os núcleos seguem dinâmica clássica; o teste não reproduz os níveis de um rotor quântico, efeitos de ponto zero ou conversão de isômeros de spin da água.

## Arquivos e preparação

- **agua_c60:** [input usado](resultados/agua_c60/agua_c60.inp) · [saída](resultados/agua_c60/agua_c60.out) · [energias](resultados/agua_c60/agua_c60-md-ener.csv) · [trajetória](resultados/agua_c60/agua_c60-traj.xyz).

- [Baixar input ORCA](inputs/preparar_agua_c60.inp) · [Baixar geometria inicial (.xyz)](estruturas/agua_c60_inicial.xyz) (obrigatório; manter na mesma pasta do input) · [saída da otimização](resultados/preparar_agua_c60/preparar_agua_c60.out).
- [ASE: código e coordenadas do C₆₀](https://docs.ase-lib.org/_modules/ase/build/molecule.html).
- [Kurotobi e Murata, Science 2011: síntese de H₂O@C₆₀](https://doi.org/10.1126/science.1206376).
- [Manual ORCA: dinâmica molecular](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Para continuar:** escolha uma medida interna da água e uma distância à gaiola. Explique qual descreve vibração e qual ajuda a acompanhar o confinamento.
