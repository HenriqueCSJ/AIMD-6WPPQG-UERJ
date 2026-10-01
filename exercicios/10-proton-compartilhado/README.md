# 05 · H₅O₂⁺: onde está o próton?

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**Núcleo da aula · 20 min · executar ou abrir o resultado pronto · 7 átomos**

> **Pergunta:** quando um H muda de proximidade entre dois O, ele permaneceu no novo lado ou voltou logo depois?

No dímero neutro da abertura, as águas mudam a orientação da ligação de hidrogênio e preservam suas ligações O–H covalentes. Aqui, o dímero protonado H₅O₂⁺ permite acompanhar o H da ponte. Usamos GFN2-xTB, um método semiempírico de estrutura eletrônica, com núcleos clássicos. Não há solvente implícito, parede ou força aplicada para transferir o H.

## 1. Prepare

[Pacote para executar](aula-proton_shared.zip) · [Input comentado](inputs/proton_shared.inp) · [Geometria otimizada](estruturas/h5o2_otimizado.xyz)

Extraia o pacote numa pasta nova. Os índices do aplicativo começam em **zero**: **O 0, O 1 e H 2** formam a ponte; H 3–6 são os demais hidrogênios. A carga total é +1 e a multiplicidade é 1.

```text
! MD XTB2 PAL8
%maxcore 256
%md
  # 8000 passos x 0.25 fs = 2000 fs = 2 ps.
  Timestep 0.25_fs
  Thermostat CSVR 300_K Timecon 100_fs
  Dump Position Stride 1 Filename "proton_shared-traj.xyz"
  Randomize 93201
  Initvel 300_K
  Run 8000
end
* xyzfile 1 1 h5o2_otimizado.xyz
```

## 2. Execute ou use a referência

No Ubuntu/WSL2, com `ORCA_DIR` configurado no tutorial, abra o terminal na pasta extraída:

```bash
"$ORCA_DIR/orca" proton_shared.inp > proton_shared.out 2>&1
tail -n 12 proton_shared.out
```

No PowerShell, ajuste o caminho da sua instalação:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' proton_shared.inp > proton_shared.out 2>&1
Get-Content proton_shared.out -Tail 12
```

Execute um cálculo por vez. A referência completou **2 ps em 123,847 s**; a otimização anterior levou 2,375 s. São tempos observados em ORCA 6.1.1/xTB 6.7.1, WSL2, Intel Core Ultra 9 185H, PAL8 solicitado, e podem mudar em outro computador. Se a espera comprometer o bloco, passe aos dados prontos.

[Abrir H₅O₂⁺ no aplicativo](../../visualizador/index.html?exemplo=proton_shared&aba=trajetoria) · [Baixar resultado pronto](resultado-proton_shared.zip)

## 3. Meça e interprete

1. Em **Trajetória**, selecione O 0, H 2 e O 1. Observe a ponte sem usar a velocidade da animação como escala de tempo físico.
2. Em **Geometria**, acompanhe **O 0–H 2** e **O 1–H 2**. Defina δ = r(O 0–H 2) − r(O 1–H 2). δ negativo indica H 2 mais perto de O 0; positivo, mais perto de O 1.
3. Examine 850–1050 fs. Toda mudança de sinal parece uma passagem duradoura? Verifique o que acontece algumas dezenas de fs depois.
4. Compare a temperatura instantânea com o alvo de 300 K. A média desta trajetória foi 242,81 K; o alvo não garante temperatura instantânea constante nem equilíbrio térmico em 2 ps.

Nos dados completos ocorreram **79 cruzamentos de δ = 0**. Exigir afastamento de pelo menos 0,10 Å da região central e permanência muda a contagem: nove mudanças para 20 fs, uma para 50 fs e nenhuma para 100 fs. **Um cruzamento não é uma taxa de reação.** O exemplo mostra compartilhamento e recrossamentos; dois oxigênios não constituem uma rede extensa de transporte de prótons.

A referência do aplicativo contém todos os **8001 quadros**, espaçados de 0,25 fs. O CSV conserva o tempo impresso pelo ORCA, arredondado a uma casa decimal; para instantes entre quartos de fs, use o comentário do XYZ ou o passo multiplicado por 0,25 fs.

## Arquivos e consulta

- [Saída ORCA](resultados/proton_shared/proton_shared.out) · [Energias](resultados/proton_shared/proton_shared-md-ener.csv) · [Trajetória completa](resultados/proton_shared/proton_shared-traj.xyz).
- [Input original da referência](resultados/proton_shared/proton_shared.inp) · [Registro de execução](resultados/proton_shared/execucao.json). Os resultados foram copiados com um nome comum para facilitar o carregamento; as séries não foram interpoladas.
- [Input da otimização](inputs/z00_otimizar.inp) · [Geometria inicial](estruturas/h5o2_inicial.xyz) · [Saída da otimização](resultados/otimizacao/z00_otimizar.out).
- [Manual ORCA 6.1: dinâmica molecular, timestep e termostatos](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Entrega da dupla:** anote um cruzamento com retorno e explique como a conclusão muda ao exigir persistência.
