# 7. Manter as águas perto do complexo

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html)

**35 min · Zn²⁺–etilenodiamina + águas · 43 átomos**

**Novo ponto de partida:** [veja as águas inicialmente afastadas se coordenarem ao Zn](hidratacao.html), com a en ainda distante. Há uma referência de 250 fs para a hidratação e outra de 5 ps para acompanhar o encontro; a segunda ainda não forma o quelato. A comparação com/sem parede abaixo continua usando o complexo já formado.

> **Pergunta:** como impedir que águas da camada externa se afastem da região simulada?

## 1. Compare a mesma condição inicial

As duas trajetórias partem do **mesmo arquivo de reinício**, com as mesmas posições e velocidades, após 100 fs de preparação. Ambas usam XTB2/ALPB(water), CSVR a 300 K, timestep de 0,5 fs e mais **2 ps = 2 × 10⁻¹² s**. Apenas a parede muda. O relógio vai de 100 a 2100 fs.

ALPB modifica o ambiente eletrostático; não impede uma água explícita de se afastar. A parede acrescenta uma força restauradora quando um átomo ultrapassa o raio escolhido.

## 2. Execute com parede

[Pacote para executar](aula-zn_parede_longo.zip) · [Input](inputs/zn_parede_longo.inp)

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

Extraia o pacote em uma pasta nova. Abra o Ubuntu nessa pasta, com `ORCA_DIR` configurado no tutorial, e copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp zn_parede_longo.inp zn_solvato.xyz preparacao_termica.mdrestart "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" zn_parede_longo.inp > zn_parede_longo.out 2>&1
  tail -n 12 zn_parede_longo.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` para localizar os resultados. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Com ORCA/MS-MPI instalados, extraia o pacote numa pasta nova, abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' zn_parede_longo.inp > zn_parede_longo.out 2>&1
Get-Content zn_parede_longo.out -Tail 12
```

</details>

O pacote inclui o reinício. **Raio 6 Å**, centro fixo na origem e `Spring 50.0` em kJ mol⁻¹ Å⁻². A parede é suave: os átomos podem ultrapassar um pouco o raio antes de serem repelidos. Ela modifica o modelo físico e não representa uma caixa periódica nem solvente infinito.

## 3. Veja a água que se afasta

[Abrir a comparação 3D](../../visualizador/index.html?exemplo=complex&aba=trajetoria) · [Carregar meus arquivos](../../visualizador/index.html)

1. Reproduza a referência **sem parede** até o fim. Uma água da camada externa se afasta.
2. Troque para **com parede**. O contorno mostra onde começa a repulsão.
3. Em **Geometria → Distância**, compare **Zn 0 — O 25**. Os índices começam em zero.
4. Confira também **Zn 0 — N 1** e **Zn 0 — N 4**: retenção espacial e coordenação são observações diferentes.

**Ative os dois tipos de contato no 3D.** Os traços de coordenação ligam geometricamente Zn a N/O próximos (corte inicial 2,6 Å); os tracejados de ligação H mostram contatos O/N–H···O/N que atendem aos cortes de distância e ângulo. Eles ajudam a distinguir **primeira esfera de coordenação** de **águas externas conectadas por ligações H**. São sugestões geométricas; o XYZ não contém ordens de ligação ou informação completa sobre caráter aceptor.

**Previsão para testar:** reter O 25 a cerca de 4 Å não o transforma em ligante diretamente coordenado ao Zn. Se a água fica perto, mas fora do corte de coordenação, a parede preservou a vizinhança de solvente, não criou uma ligação Zn–O. Confira isso no filme e na curva.

Nesta execução, a distância final Zn 0–O 25 foi **9.13 Å sem parede** e **4.19 Å com parede**. O maior raio atômico em relação à origem atingiu **9.28 Å sem parede** e **6.30 Å com parede**. Esses números descrevem estas trajetórias; não são limites universais de evaporação.


**O ganho:** conservar uma região finita de solvente explícito ao redor do sistema durante a demonstração. **O custo:** forças artificiais nas bordas alteram o movimento; raio pequeno ou parede muito rígida podem distorcer a estrutura e exigir timestep menor. Aqui a perda de uma água significa afastamento no modelo de aglomerado, não uma taxa de evaporação de solução macroscópica.

<details markdown="1"><summary>Executar também o controle sem parede</summary>

[Pacote para executar](aula-zn_sem_parede_longo.zip) · [Input](inputs/zn_sem_parede_longo.inp)

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

Extraia o pacote em uma pasta nova. Abra o Ubuntu nessa pasta, com `ORCA_DIR` configurado no tutorial, e copie:

```bash
(
  test -x "$ORCA_DIR/orca" || { echo "Configure ORCA_DIR antes de executar."; exit 1; }
  pasta=$(mktemp -d ./execucao-XXXXXX) || exit 1
  cp zn_sem_parede_longo.inp zn_solvato.xyz preparacao_termica.mdrestart "$pasta/" || exit 1
  cd "$pasta" || exit 1
  "$ORCA_DIR/orca" zn_sem_parede_longo.inp > zn_sem_parede_longo.out 2>&1
  tail -n 12 zn_sem_parede_longo.out
  echo "Resultados: $PWD"
)
```

Abra `explorer.exe .` para localizar os resultados. Execute um cálculo por vez.

</details>

<details markdown="1"><summary>Alternativa no Windows nativo</summary>

Com ORCA/MS-MPI instalados, extraia o pacote numa pasta nova, abra o PowerShell nela e ajuste o caminho:

```powershell
& 'C:\ORCA_6.1.1\orca.exe' zn_sem_parede_longo.inp > zn_sem_parede_longo.out 2>&1
Get-Content zn_sem_parede_longo.out -Tail 12
```

</details>

</details>

## Resultados reais

- **zn_parede_longo:** [input usado](resultados/zn_parede_longo/zn_parede_longo.inp) · [saída](resultados/zn_parede_longo/zn_parede_longo.out) · [energias](resultados/zn_parede_longo/zn_parede_longo-md-ener.csv) · [trajetória](resultados/zn_parede_longo/zn_parede_longo-traj.xyz).
- **zn_sem_parede_longo:** [input usado](resultados/zn_sem_parede_longo/zn_sem_parede_longo.inp) · [saída](resultados/zn_sem_parede_longo/zn_sem_parede_longo.out) · [energias](resultados/zn_sem_parede_longo/zn_sem_parede_longo-md-ener.csv) · [trajetória](resultados/zn_sem_parede_longo/zn_sem_parede_longo-traj.xyz).

As referências antigas de 0,5 ps permanecem em [apoio](apoio.md) e no [aplicativo](../../visualizador/index.html?exemplo=complex_short). **Manual:** [Paredes, seção Cell](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell) · [Restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#restart). O ORCA 6.1.1 usado aceita a grafia `Walls`.
