# C · Celas de simulação e pressão

[← Percurso da aula](../README.md) · [Retomar 04b](../7-dinamica-complexo/README.md) · [Guia %md](../../guia-md/index.html)

**Complemento opcional · siga C1 → C2 → C3.** O percurso principal continua do 04b para o 04c. Este módulo aprofunda o confinamento usando o mesmo complexo Zn–en hidratado, com 43 átomos. As referências estão prontas; não é necessário executar todas para acompanhar.

O comando `Cell` define uma parede repulsiva suave, **sem periodicidade**. Ela pode ter tamanho fixo ou responder à pressão. `Spring` controla a rigidez, em kJ mol⁻¹ Å⁻²; `Pressure` define o alvo em bar. A versão 6.1.1 testada aceita `Cell` e avisa que o nome foi atualizado para `Walls`; esse aviso isolado não indica falha. [Manual oficial, Cell](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell).

## Preparar e executar

Baixe e extraia **um pacote por pasta**. Execute um cálculo por vez, com ORCA/XTB2 já configurados. O XYZ e o `.mdrestart` do pacote são obrigatórios; o reinício conserva posições e velocidades. Não acrescente `Initvel` aos ramos.

No **Windows**, abra `cmd` na pasta extraída. No **Ubuntu/WSL**, entre na pasta pelo terminal. Nos dois casos, para o exemplo de 1000 bar:

```text
orca zn_cell_1000bar.inp > zn_cell_1000bar.out
```

Espere terminar antes de iniciar o próximo. Troque o nome para executar outra variante. Os tempos abaixo foram medidos na máquina de referência e variam entre computadores. No laboratório, carregue juntos `.out`, `-md-ener.csv` e `-traj.xyz`, ou abra as referências pelos botões de cada etapa.

<a id="parede-e-rigidez"></a>

## C1 · Parede e rigidez

**Pergunta:** a parede retém as águas sem alterar o movimento? Comece pela [comparação com/sem parede do 04b](../7-dinamica-complexo/README.md). Reter uma água perto do complexo e coordená-la ao Zn são observações distintas.

Agora compare duas paredes com **raio fixo de 6 Å**, `Spring 10` e `Spring 50`, por 500 fs adicionais. Ambas partem do mesmo checkpoint de 100 fs e terminam em 600 fs, com XTB2/ALPB(water), CSVR a 300 K e timestep de 0,5 fs.

**[Abrir C1 no laboratório](../../visualizador/index.html?exemplo=cell_rigidity&aba=trajetoria)**

**Spring 10:** [Pacote para executar](aula-zn_cell_spring10.zip) · [Input](inputs/zn_cell_spring10.inp) · [Resultados completos](resultado-zn_cell_spring10.zip). Execução de referência: 35,3 s

**Spring 50:** [Pacote para executar](aula-zn_cell_spring50.zip) · [Input](inputs/zn_cell_spring50.inp) · [Resultados completos](resultado-zn_cell_spring50.zip). Execução de referência: 29,4 s

<details markdown="1"><summary>Input comentado da parede mais rígida</summary>

<!-- input-source: inputs/zn_cell_spring50.inp -->
```text
# Mesmo estado inicial do exercicio 04b; alvo de pressao em bar.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
 Randomize 42
 Timestep 0.5_fs
 Thermostat CSVR 300_K Timecon 100_fs
 Cell Sphere 0, 0, 0, 6.0_A Spring 50
 Restart "preparacao_termica.mdrestart"
 Dump Position Stride 1 Filename "zn_cell_spring50-traj.xyz"
 Run 1000
end
* xyzfile 2 1 zn_solvato.xyz
```

Na outra variante, somente Spring passa a 10 e o nome do arquivo de saída muda.

</details>

1. Compare as duas trajetórias na mesma marca de tempo.
2. Observe a penetração de átomos além da parede suave e meça Zn–O para uma mesma água.
3. Examine energia e temperatura. Como há termostato, não exija conservação de K+U.
4. Registre uma diferença e uma semelhança. Evite atribuir à coordenação um efeito que seja apenas retenção espacial.

<a id="pressao-e-volume"></a>

## C2 · Pressão e volume

**Pergunta:** uma cela sob pressão sempre encolhe? Compare alvos de **1 e 1000 bar**, a partir do mesmo estado de 100 fs e raio inicial de 6 Å, por mais 1 ps. A janela de média da pressão é de 100 fs e o parâmetro de resposta é 0,001. São parâmetros do exemplo, não garantia de equilíbrio.

A parede tende a contrair quando a pressão média que o sistema exerce sobre ela fica abaixo do alvo externo; tende a expandir quando fica acima. Há atraso e oscilações. **O alvo não é a pressão medida a cada instante.** [Manual oficial, cela elástica](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html#cell).

**[Abrir C2 e observar a parede móvel](../../visualizador/index.html?exemplo=cell_pressure&aba=trajetoria)**

**1 bar:** [Pacote para executar](aula-zn_cell_1bar.zip) · [Input](inputs/zn_cell_1bar.inp) · [Resultados completos](resultado-zn_cell_1bar.zip). Execução de referência: 59,3 s

**1000 bar:** [Pacote para executar](aula-zn_cell_1000bar.zip) · [Input](inputs/zn_cell_1000bar.inp) · [Resultados completos](resultado-zn_cell_1000bar.zip). Execução de referência: 56,9 s

<details markdown="1"><summary>Input comentado da cela elástica a 1000 bar</summary>

<!-- input-source: inputs/zn_cell_1000bar.inp -->
```text
# Mesmo estado inicial do exercicio 04b; alvo de pressao em bar.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
 Randomize 42
 Timestep 0.5_fs
 Thermostat CSVR 300_K Timecon 100_fs
 Cell Sphere 0, 0, 0, 6.0_A Spring 50 Elastic 100_fs, 0.001 Pressure 1000
 Restart "preparacao_termica.mdrestart"
 Dump Position Stride 1 Filename "zn_cell_1000bar-traj.xyz"
 Run 2000
end
* xyzfile 2 1 zn_solvato.xyz
```

Na outra variante, somente Pressure passa a 1 e o nome da saída muda.

</details>

### Como o laboratório reconstrói a parede

O ORCA testado escreve `Av.Press.` (pressão média, bar) e `Cell Dens.` (densidade geométrica da cela, g/cm³) no CSV. A saída `.out` informa o centro, raio e densidade iniciais. Com massa constante, o app obtém **R(t) = R₀ [ρ₀/ρ(t)]¹ᐟ³**. O raio e o volume são aproximados porque a saída arredonda a densidade. O tamanho acompanha o tempo registrado; o app não inventa uma contração linear.

Sem a densidade correspondente ao quadro ou sem a configuração inicial, o tamanho da cela elástica fica indisponível. O suporte atual é para uma esfera e um único trecho `Run`; outras formas e mudanças de parede entre vários trechos não recebem uma animação presumida.

1. Pause no mesmo tempo nas duas condições e compare a parede, a pressão média e o alvo.
2. Encontre uma expansão ou mudança de sentido. Explique-a usando a diferença entre pressão média e alvo.
3. Compare distâncias Zn–O. Compressão espacial não demonstra, por si só, uma reação.
4. Confira o final em 1100 fs: a saída reporta raios de **7,137 Å a 1 bar** e **4,985 Å a 1000 bar**. As pressões médias finais são **0,00 e 478,50 bar**, respectivamente. Esses pontos não demonstram equilíbrio.

Esta é uma amostra finita com parede artificial e solvente implícito ALPB. A densidade m/V da cela não deve ser apresentada como densidade de equilíbrio da água líquida. O protocolo também não será rotulado automaticamente como amostragem rigorosa de NPT.

<a id="fixar-ou-remover"></a>

## C3 · Fixar ou remover a cela

**Pergunta:** congelar o tamanho da parede é o mesmo que retirá-la? Os dois ramos partem do **mesmo checkpoint comprimido em 1100 fs**, obtido no exemplo de 1000 bar, e avançam por 500 fs até 1600 fs. Posições e velocidades iniciais são iguais.

No ramo fixo, a esfera é redeclarada com **4,985 Å**, o raio final arredondado reportado pelo ORCA, e `Cell Fixed` mantém esse tamanho. Esse é o raio escolhido para o novo ramo, não um reinício exato da geometria interna da cela elástica. No outro ramo, `Cell None` remove a parede. O checkpoint molecular não substitui a declaração da cela.

**[Abrir C3 no laboratório](../../visualizador/index.html?exemplo=cell_release&aba=trajetoria)**

**Parede fixa:** [Pacote para executar](aula-zn_cell_fixed.zip) · [Input](inputs/zn_cell_fixed.inp) · [Resultados completos](resultado-zn_cell_fixed.zip). Execução de referência: 30,5 s

**Sem parede:** [Pacote para executar](aula-zn_cell_none.zip) · [Input](inputs/zn_cell_none.inp) · [Resultados completos](resultado-zn_cell_none.zip). Execução de referência: 29,9 s

<details markdown="1"><summary>Input da continuação com parede fixa</summary>

<!-- input-source: inputs/zn_cell_fixed.inp -->
```text
# Continuacao do mesmo estado comprimido em 1100 fs; sem reinicializar velocidades.
! MD XTB2 ALPB(water) PAL8
%maxcore 256
%md
 Randomize 42
 Timestep 0.5_fs
 Thermostat CSVR 300_K Timecon 100_fs
 Cell Sphere 0, 0, 0, 4.985_A Spring 50
 Cell Fixed
 Restart "comprimido.mdrestart"
 Dump Position Stride 1 Filename "zn_cell_fixed-traj.xyz"
 Run 1000
end
* xyzfile 2 1 zn_comprimido.xyz
```

No ramo sem parede, as duas linhas Cell são substituídas por `Cell None`, mantendo o mesmo checkpoint e geometria.

</details>

1. Compare as duas condições em 1200, 1400 e 1600 fs.
2. Meça as distâncias de uma mesma água ao Zn e observe se ela se afasta.
3. Diferencie ausência de parede de uma parede que conserva o raio.
4. Não interprete a mudança do potencial ao retirar a parede como calor de reação.

## Para continuar

Esfera versus cubo com o mesmo volume, celas retangulares/elipsoidais e pressão anisotrópica são extensões conceituais. Não estão representadas pela animação esférica atual. Para gravar mais dados, veja o único [exemplo complementar de Dump na água](../1-agua-dft/README.md#alem-das-posicoes).

**Módulo concluído:** [voltar ao 04b](../7-dinamica-complexo/README.md) · [seguir para 04c, formação do quelato](../11-formacao-quelato/README.md) · [mapa da aula](../README.md).
