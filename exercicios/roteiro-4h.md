# Roteiro do minicurso — 7 de outubro de 2026

[Percurso](README.md) · [Laboratório](../visualizador/index.html)

**13h–16h e 17h–18h, horário de Brasília.** São 200 minutos de atividades, 15 de descanso e 25 de margem. O intervalo de 16h–17h fica fora das quatro horas de aula.

## Primeiro bloco

- **13h00–13h15:** abertura, forças e movimento; abrir a água isolada e aprender as medidas no laboratório.
- **13h15–13h27 · 01a:** água isolada, K/U/E e temperatura; comparar os inputs NVE/CSVR e discutir a conexão com IV/Raman.
- **13h27–13h40 · 01b:** dímero neutro com XTB2; usar distâncias e ângulos para investigar a ligação H.
- **13h40–14h15 · 02:** etanol NVE, timestep inadequado e correção.
- **14h15–14h30:** descanso.
- **14h30–14h55 · 03:** etanol com aquecimento e resfriamento em etapas.
- **14h55–15h05:** margem para dúvidas e execuções mais lentas.
- **15h05–15h50 · 04a–b:** Zn²⁺ isolado + 20 águas com SOLVATOR; hidratação sem en, sem parede e com três rigidezes de parede.
- **15h50–16h00:** margem e organização dos arquivos para o retorno.

## Intervalo

**16h–17h:** pausa prevista na programação do evento.

## Segundo bloco

- **17h00–17h05:** retomada.
- **17h05–17h25 · 04c–d:** primeiro N assistido e segundo N livre; depois compare a en sem assistência sob alvos de 1, 1000 e 4000 bar, usando resultados prontos de 5 ps.
- **17h25–17h45 · 05:** executar H₅O₂⁺ e acompanhar o próton compartilhado.
- **17h45–17h50:** margem.
- **17h50–18h00:** síntese, perguntas e opções para continuar depois.

## O que será executado

Água isolada XTB2, NVE e CSVR, conforme o tempo disponível; dímero XTB2; etanol NVE; etanol instável e corrigido; etanol em cinco etapas; SOLVATOR; dinâmica de hidratação do Zn²⁺ com 20 águas e parede; H₅O₂⁺. Os quatro controles de hidratação sem en já têm resultados prontos de 1 ps; usamos também a referência independente de formação do quelato e os três controles prontos de pressão de 04d, sem assistência Zn–N. Os novos pares livre/assistido com/sem parede da en são inputs para reprodução posterior, ainda sem resultados novos. O ramo sem parede pode ser executado depois da aula.

A água DFT da abertura é observada nos resultados fornecidos. O par XTB2 também tem [comparação pronta NVE × CSVR da própria água](../visualizador/index.html?exemplo=water_thermostat&aba=trajetoria): 500 fs por condição, com cerca de 18 s e 15 s de execução na máquina de referência. A reprodução local não é condição para avançar.

As quatro referências de hidratação sem en, partindo diretamente do SOLVATOR, levaram cerca de 2min30 a 2min47 por ramo na máquina de referência. O tempo antigo de cerca de 14 minutos incluía SOLVATOR com seis águas sobre o complexo pré-formado. Ele não prevê a montagem atual de 20 águas nem os novos controles de hidratação. O trabalho dos alunos com arquivos, inputs, medidas e interpretação e o desempenho de cada computador também variam. Se uma execução atrasar, carregue o resultado fornecido e continue a atividade.

As comparações adicionais DFT/CPCM, gotas protonadas em diferentes temperaturas, H₂O@C₆₀, hidratação adicional e Al³⁺/amônia ficam em [Opcionais e referências](README.md#opcionais-e-referencias). Não são tarefas a concluir durante a aula. A instalação do ambiente é preparação anterior ao encontro.
