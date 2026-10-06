# 04c · en: primeiro N assistido, segundo N livre

[← Percurso](../README.md) · [Aplicativo de análise](../../visualizador/index.html?exemplo=chelation&aba=trajetoria)

**Núcleo da aula · 20 min compartilhados entre 04c e 04d · interpretar resultados prontos · 97 átomos**

## 1. O que fizemos e por quê

**Ajudamos o primeiro N de uma etilenodiamina (en) a chegar perto do Zn durante 1 ps. Depois retiramos essa ajuda e observamos se o segundo N da mesma en fecha o quelato.** Essa preparação torna o primeiro contato acessível na janela curta da aula.

**Começamos com o Zn²⁺ e seis águas já coordenadas.** Aproximamos uma en por seu N 61 e observamos o outro N da mesma molécula, N 64.

[**Abrir o percurso de 3 ps no laboratório**](../../visualizador/index.html?exemplo=chelation&aba=trajetoria) · [Baixar o percurso e os inputs](resultado-en-sequencia-simples.zip) · [Baixar XYZ reunido das duas etapas · 0–3000 fs](resultados/chelation_simple/chelation_simple-traj.xyz)

**Como a aproximação foi forçada?** Acrescentamos uma força à **distância entre Zn 0 e N 61**, por meio de uma mola de limite superior. A força atua nos dois átomos do par, inclusive no Zn. Durante 1 ps, o limite diminui de **3,886868 para 2,2 Å**. Se a distância está acima do limite, a mola favorece a aproximação; abaixo dele, sua força adicional é zero. A constante é **200 kJ mol⁻¹ Å⁻²**. A distância responde às forças da dinâmica: não é fixada exatamente no valor da rampa e as coordenadas do filme não foram editadas manualmente.

**Só a distância Zn–N 61 é definida para a mola. N 64 e as águas são observados pelo XYZ e não recebem essa restrição de coordenação.** A constante 200 é a intensidade escolhida para esta intervenção didática, não uma constante física da ligação Zn–N. A parede atua na borda da gota; esta restrição atua na distância Zn–N 61. As interações normais e o termostato continuam atuando.

## 2. Assista a três momentos, com um relógio

1. **Encontro preparado · 0 fs.** O Zn tem seis águas próximas; os dois N da en estão a cerca de 3,89 Å.
2. **Primeiro N assistido · 0–1000 fs.** A mola aproxima o par Zn–N 61. N 61 entra abaixo do corte de 2,6 Å aos **540 fs**.
3. **Segundo N livre da restrição · 1000–3000 fs.** Retiramos a mola e continuamos do checkpoint. N 64 entra abaixo de 2,6 Å aos **1554 fs nos XYZ novos**, gravados a cada 1 fs. Os dois N permanecem no corte de 1554 até 3000 fs.

No laboratório, use **Trecho para observar** para escolher **0–1000 fs** e **1000–3000 fs**; marque **Repetir** para voltar ao início do trecho. Em **Geometria**, acompanhe as duas distâncias já selecionadas: **Zn 0–N 61** e **Zn 0–N 64**. Os índices começam em zero. Bidentado significa que **os dois N da mesma en** estão próximos do Zn ao mesmo tempo; contar dois N sem conferir suas identidades não basta. O corte é um critério geométrico, não uma ordem de ligação.

**Entrega da dupla:**

- Qual par recebeu a força extra, por quanto tempo e com qual finalidade?
- Quando N 64 entra no corte, a mola de Zn–N 61 ainda está ativa? Que observação identifica o fechamento do quelato?

## 3. Os dois inputs mínimos executados

Os dois inputs abaixo foram executados nesta versão simplificada. Os [originais anteriores](historico.md#coordenacao-original) ficam no histórico. O método é **GFN2-xTB/ALPB(water)**, com passo de **0,25 fs**, **CSVR a 300 K** e parede esférica de **9 Å**. “Livre” abaixo significa livre da restrição de coordenação; o banho e a parede permanecem.

<a id="primeiro-n"></a>
### Primeiro N: aplicar a mola durante 1 ps

Use a [geometria de encontro](estruturas/encontro_real_R1.xyz) junto do input; ela também está [inteira e copiável no apoio](apoio.md#geometria-de-encontro). `Initvel` prepara as velocidades a 300 K. `Manage_Colvar Define 1` identifica a distância Zn–N 61; `Restraint Add Colvar 1` aplica a mola a essa distância. `Run 4000` corresponde a 4000 × 0,25 fs = 1000 fs.

**Input completo · `en_aproximar_N1.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/en_aproximar_N1.inp -->
```text
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 93001
  Initvel 300_K
  Thermostat CSVR 300_K Timecon 100_fs
  Walls Sphere 0, 0, 0, 9.0_A Spring 50.0
  Dump Position Stride 4 Filename "en_aproximar_N1-traj.xyz"
  Manage_Colvar Define 1 Distance Atom 0 Atom 61
  Restraint Add Colvar 1 Harmonic Spring 200.0 Upper Ramp 3.886868 2.2
  Run 4000
end
* xyzfile 2 1 encontro_real_R1.xyz
```

<a id="segundo-n"></a>
### Segundo N: retirar a mola e continuar por 2 ps

O **checkpoint do primeiro input é obrigatório**: [baixar `en_aproximar_N1.mdrestart`](inputs/en_aproximar_N1.mdrestart). `Restart` retoma posições, velocidades e relógio aos 1000 fs. Este input não tem `Initvel`; seus 8000 passos levam a continuação até 3000 fs. O segundo input continua sem reaplicar a mola; `Restraint Reset Colvar 1` explicita essa condição. `Randomize` define uma semente, não reinicializa sozinho as velocidades.

**Input completo · `en_continuar_sem_mola.inp` — copie e salve com esse nome.**

<!-- input-source: inputs/en_continuar_sem_mola.inp -->
```text
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 93002
  Thermostat CSVR 300_K Timecon 100_fs
  Walls Sphere 0, 0, 0, 9.0_A Spring 50.0
  Dump Position Stride 4 Filename "en_continuar_sem_mola-traj.xyz"
  Manage_Colvar Define 1 Distance Atom 0 Atom 61
  Restraint Reset Colvar 1
  Restart "en_aproximar_N1.mdrestart"
  Run 8000
end
* xyzfile 2 1 encontro_real_R1.xyz
```

## 4. Para aprofundar depois

O sistema já começa em uma **geometria de encontro**: Zn²⁺ hidratado por seis águas, com uma en por perto. No agregado inteiro há **Zn²⁺, 20 águas e três en, totalizando 97 átomos**. A geometria foi selecionada de uma referência anterior; não é uma amostra aleatória nem uma continuação dos exercícios 04a–b com 61 átomos. A origem está no [histórico separado](historico.md).

O encontro preparado não demonstra que a ajuda seja fisicamente necessária nem mede uma velocidade espontânea de reação.

Ao final deste percurso há quatro águas e uma en bidentada na primeira esfera. As duas águas que saem continuam no agregado. Para acompanhar essa troca, acrescente Zn 0–O 7 e Zn 0–O 25 no laboratório. Energia e temperatura também estão disponíveis: a mola móvel realiza trabalho, o termostato troca calor e o restart tem sua própria referência da quantidade conservada. Uma variação da curva não determina sozinha o calor de reação.

- [Histórico: como a geometria de encontro foi obtida, com três inputs de preparação, os dois originais de coordenação e a sequência anterior](historico.md).
- [Apoio: quatro controles preparados, seus inputs e a geometria copiável](apoio.md). Esses controles ainda não foram executados.
- [Todos os recursos deste exercício](resultados-completos.zip), incluindo originais, checkpoints e apoios.
- [Manual ORCA: restrições e restart](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html).

**Próxima etapa:** [04d · en sem assistência sob 1, 1000 e 4000 bar](../14-zn-en-pressao/README.md). Os controles de 04d começam dos fragmentos afastados da referência anterior, antes do encontro selecionado usado aqui.
