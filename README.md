<!-- A arte é a original publicada pela organização; créditos em assets/README.md. -->
<p align="center">
  <a href="https://www.ppgq-iq.uerj.br/6o-workshop-do-programa-de-pos-graduacao-em-quimica-uerj">
    <img src="assets/workshop-ppgq-uerj-2026.jpeg" width="821" alt="6º Workshop do Programa de Pós-Graduação em Química da UERJ">
  </a>
</p>

<h1 align="center">Dinâmica Molecular <em>Ab Initio</em> com ORCA</h1>
<p align="center"><strong>Fundamentos, simulação e análise de trajetórias</strong></p>
<p align="center">Minicurso 4 · 6º Workshop do PPGQ-UERJ · Edição 2026</p>

<p align="center">
  <strong>07 de outubro</strong> &nbsp;·&nbsp; <strong>13h–16h e 17h–18h</strong><br>
  Quarta-feira · Horário de Brasília (UTC−3) · Remoto · 4 horas
</p>

<p align="center">
  <a href="#comece-por-aqui">Comece por aqui</a> &nbsp;·&nbsp;
  <a href="tutoriais/README.md">Instalação</a> &nbsp;·&nbsp;
  <a href="#materiais-do-minicurso">Materiais</a> &nbsp;·&nbsp;
  <a href="https://www.ppgq-iq.uerj.br/6o-workshop-do-programa-de-pos-graduacao-em-quimica-uerj">Site do workshop</a>
</p>

---

## Do input à trajetória

Como transformar uma estrutura molecular em uma simulação e interpretar o movimento dos átomos? Neste minicurso, vamos construir esse caminho com o **ORCA 6.1.1**, combinando fundamentos de dinâmica molecular *ab initio* (AIMD), preparação de inputs, termostatos, modelos de solvatação e análise de trajetórias.

O encontro se destina a estudantes de iniciação científica, mestrado e doutorado. Este repositório reúne as instruções de preparação e os materiais das atividades práticas.

### Ministrantes

**Prof. Henrique de Castro Silva Junior**<br>
Departamento de Química Fundamental · Universidade Federal Rural do Rio de Janeiro (UFRRJ)

**Profa. Virginia Camila Rufino Ferreira**<br>
Ministração e acompanhamento das atividades práticas

**Moderação:** Prof. Haroldo Candal · Departamento de Físico-Química · PPGQ-UERJ

### Nosso encontro

| Quando | Atividade |
| :--- | :--- |
| **07/10 · 13h–16h** | Primeira parte do minicurso |
| **16h–17h** | Intervalo na programação |
| **07/10 · 17h–18h** | Segunda parte do minicurso |

O workshop acontece de **5 a 8 de outubro de 2026**, no âmbito do Programa de Pós-Graduação em Química da UERJ. A participação neste minicurso é **remota**. O acesso à sala é encaminhado pela organização aos participantes; entre alguns minutos antes. Consulte a [programação oficial](https://www.ppgq-iq.uerj.br/6o-workshop-do-programa-de-pos-graduacao-em-quimica-uerj) para as demais atividades.

## Comece por aqui

> **Recomendamos o uso de WSL2 com Ubuntu 24.04 LTS para acompanhar o minicurso no Windows 11 ou 10.** A instalação nativa no Windows está disponível como alternativa.

1. **Siga o guia recomendado:** [WSL2 + Ubuntu + ORCA](tutoriais/01-wsl2-ubuntu-orca.md).
2. **Cadastre-se no fórum do ORCA** e obtenha o pacote **6.1.1** indicado no guia escolhido.
3. **Faça os testes serial e paralelo** antes do encontro. Eles verificam a instalação com um cálculo pequeno.
4. **Confira XTB2 e SOLVATOR** com o [teste curto](tutoriais/05-xtb-solvator.md). Se já funcionam, não reinstale nada.
5. **Confira a preparação** e mantenha uma cópia deste repositório no seu computador.

| Rota recomendada | Alternativa |
| :--- | :--- |
| **[WSL2 + Ubuntu + ORCA](tutoriais/01-wsl2-ubuntu-orca.md)** | **[Windows + ORCA + MS-MPI](tutoriais/02-windows-orca-msmpi.md)** |
| Windows 11 ou 10 · Ubuntu 24.04 LTS · Open MPI **4.1.6 via apt** | Windows 64 bits · MS-MPI **10.1.12498.52** |
| Instalação do Open MPI pelos pacotes oficiais do Ubuntu. | Inclui download do runtime e conferência da versão. |

- **[Preparação para o minicurso →](tutoriais/00-preparacao.md)**
- **[Teste sua instalação →](tutoriais/03-testar-instalacao.md)**
- **[Downloads e documentação oficial →](tutoriais/04-links-e-referencias.md)**

> **Preparação simplificada:** usamos o Open MPI **4.1.6 do Ubuntu via apt**, testado localmente com ORCA **6.1.1**. O download Linux informa compilação com MPI **4.1.8**; o [tutorial Linux](tutoriais/01-wsl2-ubuntu-orca.md) explica a escolha e os testes para conferir seu ambiente.

## Sequência das atividades

O [roteiro de 4 horas](exercicios/roteiro-4h.md) parte de água com DFT e solvatação implícita e passa cedo para **GFN2-xTB**, com exercícios de timestep, termostato, ALPB, complexação Zn²⁺–etilenodiamina, SOLVATOR e confinamento. A proposta revisada reserva **200 min de conteúdo/prática e 25 min de margem**, com descanso de 14h20–14h35 e intervalo oficial de 16h–17h. Reutilizamos trajetórias para reduzir repetições e preservar tempo de interpretação. Os [sete exercícios completos](exercicios/README.md) já incluem páginas HTML, inputs comentados, estruturas e 15 execuções reais com PAL8. O ensaio completo da aula e o teste em computador mais modesto ainda precisam ser feitos.

O [Laboratório de trajetórias](visualizador/README.md) lê os outputs e mostra energias, temperatura, animação e distâncias entre átomos. Carregue os arquivos ou abra um dos exemplos reais. Os arquivos escolhidos são processados no navegador, sem envio a um servidor de análise.

**[Experimente a trajetória 3D do complexo de Zn²⁺](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/?exemplo=complex&aba=trajetoria):** gire, amplie, reproduza e escolha qualquer quadro. Para ver sua própria dinâmica, carregue o arquivo `-traj.xyz`.

**Acesse pelo navegador:** [Laboratório de trajetórias online](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/) e [Exercícios online](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/exercicios/). Os alunos não precisam instalar o visualizador nem ter conta no GitHub. [Configuração da hospedagem](PUBLICACAO.md). Abrir um arquivo HTML na interface de código do GitHub mostra o arquivo; para usar o aplicativo, use o endereço do Pages.

## Materiais do minicurso

| Pasta | O que você encontra |
| :--- | :--- |
| Slides | Serão disponibilizados em uma etapa posterior. |
| [`estruturas/`](estruturas/README.md) | Geometrias em XYZ; inclui uma molécula de água para o teste de instalação. |
| [`inputs/`](inputs/README.md) | Inputs ORCA organizados por etapa; testes serial e paralelo já disponíveis. |
| [`exercicios/`](exercicios/README.md) | Sete páginas com inputs comentados, XYZ, trajetórias, resultados e questões. |
| [`trajetorias/`](trajetorias/README.md) | Orientações e links para as trajetórias nos exercícios. |
| [`resultados/`](resultados/README.md) | Acesso às 15 execuções de referência dos exercícios e aos pilotos anteriores. |
| [`notebooks/`](notebooks/README.md) | Cadernos de análise, a adicionar. |
| [`scripts/`](scripts/README.md) | Diagnóstico do ambiente Linux e Windows. |
| [`tutoriais/`](tutoriais/README.md) | Guias de instalação, preparação e primeiro teste. |
| [`assets/`](assets/README.md) | Identidade visual e créditos do workshop. |

**Disponível nesta etapa:** [sete exercícios numerados](exercicios/README.md), organizados em preparar, executar e interpretar. Os inputs principais têm 13–20 linhas, com comentários essenciais; os pacotes incluem os arquivos necessários, e as referências preservam os inputs completos originais. Também estão disponíveis guias de instalação e roteiro. Os slides ainda não fazem parte desta entrega. Para ler como site local, abra `exercicios/index.html`. O aplicativo está em `visualizador/index.html`, com leitura de outputs e exemplos dos sete exercícios. O site está publicado no GitHub Pages; o ensaio integral do curso permanece pendente.

### Baixar os materiais

Use **Code → Download ZIP** nesta página ou, se já usa Git:

```bash
git clone https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ.git
```

No WSL, prefira uma pasta dentro do Linux, como `~/cursos/`. Para os cálculos, crie uma pasta de execução separada dos arquivos originais. O [teste de instalação](tutoriais/03-testar-instalacao.md) mostra como fazer isso.

## Precisa de ajuda?

Confira as seções de solução de problemas nos guias. Para relatar uma dificuldade, informe o sistema operacional, a versão do ORCA, a versão do MPI e as últimas linhas relevantes da saída. Remova dados pessoais antes de publicar uma [issue](https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ/issues).

Dúvidas sobre inscrição ou acesso à sala devem ser encaminhadas à organização pelos canais da [página do evento](https://www.ppgq-iq.uerj.br/6o-workshop-do-programa-de-pos-graduacao-em-quimica-uerj).

---

Os arquivos autorais deste repositório seguem a [licença MIT](LICENSE). O **ORCA é obtido separadamente**, sob seus próprios termos, e não é redistribuído aqui. A arte do workshop pertence aos respectivos titulares; veja os [créditos de imagem](assets/README.md).

<p align="center"><sub>PPGQ-UERJ · Minicurso de AIMD · Outubro de 2026</sub></p>
