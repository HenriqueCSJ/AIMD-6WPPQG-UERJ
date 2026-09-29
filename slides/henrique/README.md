# Slides — AIMD com ORCA

[← Slides](../README.md)

**Ministrantes:** Henrique de Castro Silva Junior e Virginia Camila Rufino Ferreira.

- [PDF da apresentação — introdução didática atualizada](aimd-workshop-ebo.pdf)
- [Fonte editável em LaTeX/Beamer](aimd-workshop.tex)
- [Notas para a explicação oral e passagem à prática](notas-de-apresentacao.md)

**Estado:** versão de trabalho (`working candidate`), com cinco slides em formato 16:9 e introdução orientada à atividade prática:

1. Capa, com nomes, arte do evento e marcas UERJ/UFRRJ.
2. Dinâmica molecular clássica: decomposição de `U_FF`, significado das interações e passagem da energia às forças e ao movimento.
3. AIMD de Born–Oppenheimer: composição `E_BO = E_el + V_NN`, forças e ciclo de atualização das posições e velocidades.
4. MD clássica — escala e custo: números de átomos, benchmark identificado, vantagens e limitações do campo de força.
5. AIMD — química, custo e amostragem: escala com DFT, exemplo de trajetória e tempo de execução, vantagens e limitações, incluindo a espera por eventos raros.

As equações e os textos são nativos no LaTeX. As páginas 2 e 3 usam a mesma equação de Newton para tornar clara a diferença na obtenção das forças. A energia de Born–Oppenheimer inclui a repulsão nuclear, e o método eletrônico aproxima a energia e seu gradiente. Os núcleos permanecem clássicos neste tratamento.

A decomposição de `U_FF` é ilustrativa de campos de força convencionais; não especifica o modelo Universal Force Field (UFF). O exemplo harmônico de uma ligação está nas notas para uso oral opcional. A introdução evita uma derivação extensa da equação de Schrödinger e conduz às escolhas do input e à observação da trajetória.

Os slides 4 e 5 mostram as equivalências de ns, ps e fs em segundos; o exemplo de 10 ps aparece também como 10⁻¹¹ s. As notas distinguem a duração de uma transformação do tempo de espera por ela. Também esclarecem que 30–50 ps não é um limite universal de validade da AIMD; a discussão avançada sobre energia de ponto zero fica como apoio oral opcional.

## Compilar

Mantenha a estrutura do repositório: o fonte usa as imagens de `../../assets/`. Com Tectonic disponível, a partir da raiz do repositório:

```bash
cd slides/henrique
tectonic aimd-workshop.tex
```

Alternativamente, em uma instalação TeX com Beamer, execute XeLaTeX duas vezes nessa pasta:

```bash
xelatex -interaction=nonstopmode -halt-on-error aimd-workshop.tex
xelatex -interaction=nonstopmode -halt-on-error aimd-workshop.tex
```

O tema, as cores, os tamanhos e os componentes recorrentes ficam no preâmbulo do mesmo arquivo. Novos slides devem ser acrescentados antes de `\end{document}`. Os cinco identificadores iniciais são `capa`, `md-classica`, `aimd`, `capacidades-md` e `capacidades-aimd`.

## Referências e marcas

- [ORCA 6.1 — Molecular Mechanics](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/mm.html)
- [ORCA 6.1 — Ab initio Molecular Dynamics](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html)
- [GROMACS — escala dos sistemas e recursos computacionais](https://www.gromacs.org/about.html)
- [LAMMPS — campo de força reativo ReaxFF](https://docs.lammps.org/pair_reaxff.html)
- [CSCS — benchmark GROMACS/GH200](https://docs.cscs.ch/software/sciapps/gromacs/#scaling)
- [Lu et al. — contexto de escala da AIMD convencional, introdução](https://doi.org/10.1016/j.cpc.2020.107624)
- [Piccini et al. — eventos raros e amostragem aprimorada](https://doi.org/10.1039/D1CY01329G)
- [Créditos e origem das marcas](../../assets/README.md)
