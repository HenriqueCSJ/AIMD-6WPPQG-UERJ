# Ver a camada de águas se formar

[← Exercício 7](README.md) · [Abrir o filme curto](../../visualizador/index.html?exemplo=hydration&aba=trajetoria)

**Zn + 10 águas + etilenodiamina · 43 átomos · XTB2/ALPB(water)**

> **Pergunta:** as águas se coordenam antes de a en chegar ao metal?

## 1. Comece com as moléculas afastadas

No quadro inicial, todas as distâncias **Zn–O são 3,1 Å**. Os dois N da en estão a **6,50 e 6,60 Å** do Zn. Nenhuma água começa dentro do corte geométrico de coordenação de 2,6 Å do visualizador.

Essa é uma montagem deliberadamente fora do equilíbrio. As águas já interagem com o íon a essa distância, mas a primeira camada ainda não está formada. A en começa em uma conformação otimizada isoladamente; não há restrições Zn–N ou Zn–O que determinem quem deve se coordenar.

## 2. Veja as águas chegando · 250 fs

[Abrir a animação de hidratação](../../visualizador/index.html?exemplo=hydration&aba=trajetoria) · [Baixar o pacote para executar](aula-controle_dt025_31A.zip)

1. Ative **Coordenação**, com corte de **2,6 Å**, e volte ao primeiro quadro.
2. Escolha a velocidade **0,25×** e reproduza: as águas aproximam o O do Zn e reorganizam suas orientações.
3. Pause perto de **100 fs = 1 × 10⁻¹³ s**. A primeira camada tem seis O próximos; eles não foram colocados já nessa posição.
4. Em **Geometria → Distância**, compare **Zn 0–O 10**, **Zn 0–O 1** e **Zn 0–N 31**. O 10 entra na camada; O 1 permanece fora no final deste trecho; a en ainda está distante. Os índices começam em zero.

**O que se observa nesta referência:** o primeiro O cruza 2,6 Å em 36,5 fs. Aos 100 fs, os O 10, 13, 19, 22, 25 e 28 formam a primeira camada geométrica. A evolução dura **250 fs = 0,25 ps = 2,5 × 10⁻¹³ s**. Não use esses tempos como constantes cinéticas de hidratação em solução: a configuração inicial foi construída e o aglomerado é pequeno.

<details markdown="1"><summary>Input completo e comentado · executar em cerca de 40 s na máquina de referência</summary>

[Baixar input ORCA](inputs/controle_dt025_31A.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_aguas_en_31A.xyz) (obrigatório; manter na mesma pasta do input)

<!-- input-source: inputs/controle_dt025_31A.inp -->
```text
# Aguas inicialmente afastadas: observar a hidratacao do Zn.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  Walls Sphere 0, 0, 0, 12.0_A Spring 50.0
  Dump Position Stride 1 Filename "controle_dt025_31A-traj.xyz"
  Thermostat CSVR 300_K Timecon 20_fs
  # 1000 passos de 0.25 fs = 250 fs.
  Run 1000
end
* xyzfile 2 1 zn_aguas_en_31A.xyz
```

Entre na pasta extraída do pacote. Com a [instalação configurada](../../tutoriais/README.md), execute no **Ubuntu / WSL2**:

```bash
orca controle_dt025_31A.inp > controle_dt025_31A.out &
```

No **Windows nativo**, abra o Prompt de Comando (`cmd`) nessa pasta:

```bat
orca controle_dt025_31A.inp > controle_dt025_31A.out
```

Veja [como acompanhar o cálculo](../README.md#como-executar). Os resultados ficam na pasta do input.

Execute um cálculo por vez. PAL8 solicita oito threads ao xTB. Tempo medido aqui: **37 s**, incluindo a inicialização, em ORCA 6.1.1 / xTB 6.7.1, WSL2 e Core Ultra 9 185H; outras máquinas podem levar mais tempo.

</details>

## 3. Siga a en · 5 ps

[Abrir a trajetória de 5 ps](../../visualizador/index.html?exemplo=hydration_long&aba=trajetoria) · [Pacote para executar](aula-hidratacao_associacao_31A.zip)

O caso longo começa da mesma geometria e usa Δt = 0,25 fs. O banho permanece a 300 K: acoplamento de 20 fs nos primeiros 0,5 ps, depois 100 fs. A parede de raio 12 Å contém o aglomerado; ela não puxa a en para o metal, mas interfere quando um átomo atinge a borda.

**A en se aproxima, mas não se coordena neste intervalo.** Em **5 ps = 5 × 10⁻¹² s**, a menor distância Zn–N foi **3,69 Å**. Os dois N nunca entram no corte de 2,6 Å; a en conserva suas ligações C–C e C–N. As seis águas da primeira camada permanecem as mesmas pelo critério com histerese descrito abaixo. Portanto, este filme mostra hidratação e encontro na vizinhança, **ainda sem substituição de duas águas nem formação do quelato**.

Ative também **Ligações H**. Distinga aproximação à camada de águas, contatos com o solvente e coordenação direta ao metal. A ausência de quelação em uma trajetória curta não demonstra que o complexo seja desfavorável: encontro, orientação e substituição têm de ser amostrados.

<details markdown="1"><summary>Input de 5 ps · duas etapas no mesmo cálculo</summary>

[Baixar input ORCA](inputs/hidratacao_associacao_31A.inp) · [Baixar geometria inicial (.xyz)](estruturas/zn_aguas_en_31A.xyz) (obrigatório; manter na mesma pasta do input)

<!-- input-source: inputs/hidratacao_associacao_31A.inp -->
```text
# Montagem fora do equilibrio: aguas a 3.1 A; en a pelo menos 6.5 A.
! MD XTB2 ALPB(water) PAL8
%maxcore 256

%md
  Timestep 0.25_fs
  Randomize 42
  Initvel 300_K
  # Contencao distante; sem atracao imposta Zn-O ou Zn-N.
  Walls Sphere 0, 0, 0, 12.0_A Spring 50.0
  Dump Position Stride 2 Filename "hidratacao_associacao_31A-traj.xyz"
  # Dissipar o calor de formacao da primeira camada (0.5 ps).
  Thermostat CSVR 300_K Timecon 20_fs
  Run 2000
  # Observar os encontros com acoplamento mais fraco (4.5 ps).
  Thermostat CSVR 300_K Timecon 100_fs
  Run 18000
end

* xyzfile 2 1 zn_aguas_en_31A.xyz
```

Tempo medido: **8 min 54 s** com PAL8 na máquina de referência. Para a aula ao vivo, execute o caso curto e use o resultado longo já disponível para interpretação.

</details>

## Arquivos e interpretação

**250 fs:** [output](resultados/controle_dt025_31A/controle_dt025_31A.out) · [energias e temperatura](resultados/controle_dt025_31A/controle_dt025_31A-md-ener.csv) · [trajetória completa](resultados/controle_dt025_31A/controle_dt025_31A-traj.xyz).

**5 ps:** [output](resultados/hidratacao_associacao_31A/hidratacao_associacao_31A.out) · [energias e temperatura](resultados/hidratacao_associacao_31A/hidratacao_associacao_31A-md-ener.csv) · [trajetória completa](resultados/hidratacao_associacao_31A/hidratacao_associacao_31A-traj.xyz) · [estrutura inicial](estruturas/zn_aguas_en_31A.xyz).

Os traços do visualizador são contatos geométricos instantâneos, não ordens de ligação. Para acompanhar a identidade das águas na análise da referência, usamos entrada abaixo de 2,6 Å e saída acima de 3,0 Å, evitando contar vibrações no limite como trocas repetidas. A carga total +2 do input não fixa cargas formais em átomos ou fragmentos.

**Pergunta para discutir:** por que uma camada de águas pode se formar rapidamente, enquanto a entrada de um ligante quelante demora mais? Use distâncias e a integridade da molécula para responder; não basta ver um N passar perto do Zn.

[Manual ORCA — dinâmica molecular, termostatos, reinício e paredes](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html) · [Métodos xTB no ORCA](https://www.faccts.de/docs/orca/6.1/manual/contents/modelchemistries/semiempirical.html).
