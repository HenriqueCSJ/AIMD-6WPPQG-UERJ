# Execute. Observe. Explique.

[← Início do minicurso](../index.html) · [Abrir o laboratório](../visualizador/index.html)

**7 de outubro · 13h–16h e 17h–18h · remoto**<br>
Henrique de Castro Silva Junior · Virginia Camila Rufino Ferreira

## Antes de começar

Conclua os [testes de instalação](../tutoriais/03-testar-instalacao.md) e de [XTB2/SOLVATOR](../tutoriais/05-xtb-solvator.md). Baixe o pacote de cada exercício, extraia e execute em uma pasta nova. Os inputs usam **PAL8**; adapte a PAL2/PAL4 se necessário e rode **um cálculo por vez**.

Para analisar, carregue juntos o **`.out`**, o **`-md-ener.csv`** e o **`-traj.xyz`**. Também é possível abrir a referência fornecida em cada página. O laboratório lê seus arquivos localmente, no navegador.

## Percurso da aula

### 01 · Uma ligação de hidrogênio em movimento

[Abrir atividade](1-agua-dft/README.md) · **20 min**<br>
Duas águas com DFT. Meça O–H, H···O e o ângulo do contato. Distinga vibração covalente de movimento intermolecular.

### 02 · O que o solvente contínuo representa?

[Abrir atividade](2-solvente-implicito/README.md) · **10 min**<br>
O mesmo dímero com CPCM. As forças mudam; o número de moléculas não. Relacione o modelo com o que aparece no filme.

### 03 · O H do etanol vibra ou gira?

[Abrir atividade](3-xtb2-etanol/README.md) · **25 min**<br>
Passe para XTB2 e meça o diedro C–C–O–H. O controle curto mostra libração; compare com a trajetória mais longa do exercício 5.

### 04 · Perceber o erro antes da explosão

[Abrir atividade](4-timestep/README.md) · **25 min**<br>
Com 2,5 fs, a energia se desvia antes do aquecimento extremo. Diagnostique, volte ao início e corrija para 0,5 fs.

### 05 · Aquecer, explorar, resfriar

[Abrir atividade](5-termostato/README.md) · **25 min**<br>
Cinco etapas dentro de um só `%md`. Veja os alvos do termostato, o tempo real dos dados e a mudança de orientação da hidroxila.

### 06 · Construir a vizinhança do complexo

[Abrir atividade](6-complexo-solvator/README.md) · **30 min**<br>
Use SOLVATOR no complexo Zn²⁺–etilenodiamina. Diferencie os vizinhos do metal das águas da camada externa.

### 07 · Reter solvente não é criar coordenação

[Abrir atividade](7-dinamica-complexo/README.md) · **35 min**<br>
Compare a mesma condição inicial com e sem parede. Acompanhe uma água que se afasta e os contatos Zn–N/Zn–O.

### 08 · Água dentro de C₆₀ · opcional

[Abrir extensão](8-agua-no-fulereno/README.md) · **10–15 min, somente se houver folga**<br>
A molécula se reorienta dentro de uma gaiola real. Compare esse confinamento com o potencial artificial da atividade 7.

## Para usar bem o tempo

O [roteiro de 4 horas](roteiro-4h.md) preserva **15 min de descanso, 25 min de margem e o intervalo oficial de 16h–17h**. Otimizações e controles já estão fornecidos. Se um cálculo atrasar, abra a referência e prossiga com a interpretação; não é necessário concluir todas as variantes ao vivo.

**Ao terminar cada atividade:** registre uma observação medida, sua interpretação química e algo que a trajetória ainda não permite concluir. Os tempos de execução nas páginas são medições desta máquina, não promessas para outros computadores. O ensaio integral da aula permanece pendente.

[Manual de MD do ORCA](https://www.faccts.de/docs/orca/6.1/manual/contents/moleculardynamics/moldyn.html) · [Modelo químico do complexo](complexacao-solvator.md)
