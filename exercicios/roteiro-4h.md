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
- **15h05–15h50 · 04a–b:** SOLVATOR e efeito da parede no complexo Zn–en.
- **15h50–16h00:** margem e organização dos arquivos para o retorno.

## Intervalo

**16h–17h:** pausa prevista na programação do evento.

## Segundo bloco

- **17h00–17h05:** retomada.
- **17h05–17h25 · 04c:** formação do quelato Zn–en, com trajetória pronta e aproximação inicial guiada.
- **17h25–17h45 · 05:** executar H₅O₂⁺ e acompanhar o próton compartilhado.
- **17h45–17h50:** margem.
- **17h50–18h00:** síntese, perguntas e opções para continuar depois.

## O que será executado

Água isolada XTB2, NVE e CSVR, conforme o tempo disponível; dímero XTB2; etanol NVE; etanol instável e corrigido; etanol em cinco etapas; SOLVATOR; dinâmica do complexo com parede; H₅O₂⁺. Usamos resultados prontos para os controles e para a formação do quelato. O ramo sem parede pode ser executado depois da aula.

A água DFT da abertura é observada nos resultados fornecidos. O novo par XTB2 ainda não tem resultados nem custo medido: sua execução não é condição para avançar. Se a espera ocupar o bloco, use a comparação pronta NVE × CSVR do etanol.

As execuções principais anteriormente medidas somaram cerca de 14 minutos na máquina de referência, usando SOLVATOR com seis águas e incluindo a repetição do etanol corrigido, distribuídos ao longo das atividades. Esse valor não inclui os novos inputs da água, o trabalho dos alunos com arquivos, inputs, medidas e interpretação e não prevê o desempenho de outros computadores. Se uma execução atrasar, carregue o resultado fornecido e continue a atividade.

As comparações adicionais DFT/CPCM, gotas protonadas em diferentes temperaturas, H₂O@C₆₀, hidratação adicional e Al³⁺/amônia ficam em [Opcionais e referências](README.md#opcionais-e-referencias). Não são tarefas a concluir durante a aula. A instalação do ambiente é preparação anterior ao encontro.
