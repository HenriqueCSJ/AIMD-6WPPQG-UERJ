> **Referência histórica: complexo Zn–en pré-formado.** Este material conserva os sistemas de 25/43 átomos e os resultados antigos. O percurso principal agora começa pelo Zn²⁺ isolado e 20 águas, sem en. [Voltar à atividade atual](README.md).

# 04b · Manter as águas perto do complexo

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html?exemplo=complex&aba=trajetoria)

**Parte do bloco Zn–en (45 min com SOLVATOR) · Zn²⁺–etilenodiamina + águas · 43 átomos**

> **Pergunta:** manter uma água perto do complexo significa coordená-la ao Zn?

## 1. Compare a mesma condição inicial

O SOLVATOR construiu uma camada externa de águas. Agora acompanhe sua permanência ao redor do complexo e compare retenção espacial com coordenação direta. As duas trajetórias partem do **mesmo arquivo de reinício**, com as mesmas posições e velocidades, após 100 fs de preparação. Ambas usam XTB2/ALPB(water), CSVR a 300 K, timestep de 0,5 fs e mais **2 ps = 2 × 10⁻¹² s**. Apenas a parede muda. O relógio vai de 100 a 2100 fs.

ALPB modifica o ambiente eletrostático; não impede uma água explícita de se afastar. A parede acrescenta uma força restauradora quando um átomo ultrapassa o raio escolhido.

## 2. Execute com parede

[Pacote para executar](aula-zn_parede_longo.zip) · [Baixar input ORCA](inputs/zn_parede_longo.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvato.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](estruturas/preparacao_termica.mdrestart) (fornece o estado de continuação; manter junto do input)

<!-- input-source: inputs/zn_parede_longo.inp -->
```text
# Complexo com XTB2/ALPB; PAL8 = 8 threads do xTB.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  # Parede suave: centro (0,0,0), raio 6 A.
  Walls Sphere 0, 0, 0, 6.0_A Spring 50.0
  # Retoma posicoes, velocidades e relogio fornecidos.
  Restart "preparacao_termica.mdrestart"
  Dump Position Stride 1 Filename "zn_parede_longo-traj.xyz"
  # Novo trecho: 4000 x 0.5 fs = 2000 fs (2e-12 s).
  Run 4000
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvato.xyz
```
<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca zn_parede_longo.inp > zn_parede_longo.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_parede_longo.inp > zn_parede_longo.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

O pacote inclui o reinício. **Raio 6 Å**, centro fixo na origem e `Spring 50.0` em kJ mol⁻¹ Å⁻². A parede é suave: os átomos podem ultrapassar um pouco o raio antes de serem repelidos. Ela modifica o modelo físico e não representa uma caixa periódica nem solvente infinito.

## 3. Veja a água que se afasta

[Abrir a comparação 3D](../../visualizador/index.html?exemplo=complex&aba=trajetoria) · [Carregar meus arquivos](../../visualizador/index.html?exemplo=complex&aba=trajetoria)

1. Reproduza a referência **sem parede** até o fim. Uma água da camada externa se afasta.
2. Troque para **com parede**. O contorno mostra onde começa a repulsão.
3. Em **Geometria → Distância**, compare **Zn 0 — O 25**. Os índices começam em zero.
4. Confira também **Zn 0 — N 1** e **Zn 0 — N 4**: retenção espacial e coordenação são observações diferentes.

**Ative os dois tipos de contato no 3D.** Os traços de coordenação ligam geometricamente Zn a N/O próximos (corte inicial 2,6 Å); os tracejados de ligação H mostram contatos O/N–H···O/N que atendem aos cortes de distância e ângulo. Eles ajudam a distinguir **primeira esfera de coordenação** de **águas externas conectadas por ligações H**. São sugestões geométricas; o XYZ não contém ordens de ligação ou informação completa sobre caráter aceptor.

**Previsão para testar:** reter O 25 a cerca de 4 Å não o transforma em ligante diretamente coordenado ao Zn. Se a água fica perto, mas fora do corte de coordenação, a parede preservou a vizinhança de solvente, não criou uma ligação Zn–O. Confira isso no filme e na curva.

Nesta execução, a distância final Zn 0–O 25 foi **9.13 Å sem parede** e **4.19 Å com parede**. O maior raio atômico em relação à origem atingiu **9.28 Å sem parede** e **6.30 Å com parede**. Esses números descrevem estas trajetórias; não são limites universais de evaporação.


**O ganho:** conservar uma região finita de solvente explícito ao redor do sistema durante a demonstração. **O custo:** forças artificiais nas bordas alteram o movimento; raio pequeno ou parede muito rígida podem distorcer a estrutura e exigir timestep menor. Aqui a perda de uma água significa afastamento no modelo de aglomerado, não uma taxa de evaporação de solução macroscópica.

<details markdown="1" open><summary>Executar também o controle sem parede</summary>

[Pacote para executar](aula-zn_sem_parede_longo.zip) · [Baixar input ORCA](inputs/zn_sem_parede_longo.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvato.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](estruturas/preparacao_termica.mdrestart) (fornece o estado de continuação; manter junto do input)

<!-- input-source: inputs/zn_sem_parede_longo.inp -->
```text
# Controle: mesmo estado inicial, agora sem parede.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  # Retoma posicoes, velocidades e relogio fornecidos.
  Restart "preparacao_termica.mdrestart"
  Dump Position Stride 1 Filename "zn_sem_parede_longo-traj.xyz"
  # Novo trecho: 4000 x 0.5 fs = 2000 fs (2e-12 s).
  Run 4000
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvato.xyz
```
<details markdown="1"><summary>Executar no Ubuntu / WSL2</summary>

Entre na **pasta extraída do exercício**, onde estão o input e seus arquivos auxiliares. Com a [instalação concluída](../../tutoriais/01-wsl2-ubuntu-orca.md), execute:

```bash
orca zn_sem_parede_longo.inp > zn_sem_parede_longo.out &
```

Espere o cálculo encerrar antes de iniciar outro. Os resultados ficam nessa mesma pasta; veja [como acompanhar a execução](../README.md#como-executar).

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Abra o **Prompt de Comando (`cmd`) na pasta extraída**, com ORCA e MS-MPI já [configurados no Path](../../tutoriais/02-windows-orca-msmpi.md):

```bat
orca zn_sem_parede_longo.inp > zn_sem_parede_longo.out
```

Espere o prompt voltar antes de iniciar outro cálculo. Os arquivos de resultado ficam nessa mesma pasta.

</details>

</details>

## Resultados para comparar

- **zn_parede_longo:** [input usado](resultados/zn_parede_longo/zn_parede_longo.inp) · [saída](resultados/zn_parede_longo/zn_parede_longo.out) · [energias](resultados/zn_parede_longo/zn_parede_longo-md-ener.csv) · [trajetória](resultados/zn_parede_longo/zn_parede_longo-traj.xyz).
- **zn_sem_parede_longo:** [input usado](resultados/zn_sem_parede_longo/zn_sem_parede_longo.inp) · [saída](resultados/zn_sem_parede_longo/zn_sem_parede_longo.out) · [energias](resultados/zn_sem_parede_longo/zn_sem_parede_longo-md-ener.csv) · [trajetória](resultados/zn_sem_parede_longo/zn_sem_parede_longo-traj.xyz).

Para uma janela mais curta, compare os controles de 0,5 ps no [apoio](historico-apoio.md) e no [aplicativo](../../visualizador/index.html?exemplo=complex_short). **Manual:** [Paredes, seção Cell](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell) · [Restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#restart). O ORCA 6.1.1 usado aceita a grafia `Walls`.


**Extensão opcional:** [veja as águas inicialmente afastadas se coordenarem ao Zn](hidratacao.html), com a en ainda distante. Há uma referência de 250 fs para a hidratação e outra de 5 ps para acompanhar o encontro; a segunda ainda não forma o quelato. A comparação com/sem parede desta atividade usa o complexo já formado.

## No retorno do intervalo

[04c · Identificar a formação do quelato](../11-formacao-quelato/README.md): use a trajetória pronta de outro sistema, com aproximação inicial guiada, para acompanhar os dois N da mesma en e a saída de duas águas.

## Inputs das variantes e preparações

- **controle_dt025_31A:** [Baixar input ORCA](inputs/controle_dt025_31A.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_aguas_en_31A.xyz) (obrigatório; manter na mesma pasta do input).
- **hidratacao_associacao_31A:** [Baixar input ORCA](inputs/hidratacao_associacao_31A.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_aguas_en_31A.xyz) (obrigatório; manter na mesma pasta do input).
- **preparacao_termica:** [Baixar input ORCA](inputs/preparacao_termica.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvato.xyz) (obrigatório; manter na mesma pasta do input).
- **zn_parede:** [Baixar input ORCA](inputs/zn_parede.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvato.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](estruturas/preparacao_termica.mdrestart) (fornece o estado de continuação; manter junto do input).
- **zn_sem_parede:** [Baixar input ORCA](inputs/zn_sem_parede.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_solvato.xyz) (obrigatório; manter na mesma pasta do input) · [Baixar checkpoint obrigatório](estruturas/preparacao_termica.mdrestart) (fornece o estado de continuação; manter junto do input).


## Aprofundar Cell sem perder o percurso

**[Complemento C1 → C2 → C3](../13-cell-pressao/README.md):** rigidez da parede, resposta à pressão e continuação com parede fixa ou removida. **Para seguir a aula, avance diretamente para [04c · formação do quelato](../11-formacao-quelato/README.md).**

## Histórico: com parede Spring 10, mais 0,5 ps

<!-- input-source: inputs/zn_parede.inp -->
```text
# Complexo com XTB2/ALPB; PAL8 = 8 threads do xTB.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  # Parede suave: centro (0,0,0), raio 6 A.
  Walls Sphere 0, 0, 0, 6.0_A Spring 10.0
  # Retoma posicoes, velocidades e relogio fornecidos.
  Restart "preparacao_termica.mdrestart"
  Dump Position Stride 1 Filename "zn_parede-traj.xyz"
  # Novo trecho: 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvato.xyz
```

## Histórico: sem parede, mais 0,5 ps

<!-- input-source: inputs/zn_sem_parede.inp -->
```text
# Controle: mesmo estado inicial, agora sem parede.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.5_fs
  Randomize 42
  # Banho a 300 K; acoplamento em 100 fs.
  Thermostat CSVR 300_K Timecon 100_fs
  # Retoma posicoes, velocidades e relogio fornecidos.
  Restart "preparacao_termica.mdrestart"
  Dump Position Stride 1 Filename "zn_sem_parede-traj.xyz"
  # Novo trecho: 1000 x 0.5 fs = 500 fs (5e-13 s).
  Run 1000
end

# Carga 2, multiplicidade 1; XYZ na mesma pasta.
* xyzfile 2 1 zn_solvato.xyz
```
