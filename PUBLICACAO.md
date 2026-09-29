# Acesso dos alunos pelo GitHub Pages

O repositório já contém o aplicativo estático completo: HTML, CSS, JavaScript, biblioteca molecular e exemplos. O aluno abre o endereço do site, escolhe seus arquivos e vê os resultados. Não precisa de Python, Node, conta no GitHub ou instalação do visualizador. O ORCA é executado separadamente no computador do aluno; o Pages não executa cálculos químicos.

**Publicado no GitHub Pages.** O aplicativo, o percurso dos exercícios e o carregamento de um exemplo foram conferidos no endereço público em 28/09/2026.

## Configuração utilizada

1. Envie os commits para a branch `main` do repositório.
2. Abra [Settings → Pages](https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ/settings/pages).
3. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
4. Selecione **main** e **/(root)**; salve.
5. Aguarde o término da implantação indicada pelo GitHub e confira os endereços abaixo.

O arquivo `.nojekyll` dispensa processamento Jekyll. A página inicial encaminha para os exercícios. Os links e recursos do aplicativo são relativos, compatíveis com o caminho do projeto no Pages. Depois da ativação, novos envios para `main` atualizam o site automaticamente.

## Endereços para compartilhar

- [Exercícios](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/exercicios/).
- [Aplicativo de análise](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/).
- [Exemplo do timestep](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/?exemplo=timestep).
- [Exemplo do complexo](https://henriquecsj.github.io/AIMD-6WPPQG-UERJ/visualizador/?exemplo=complex).

Esses endereços estão disponíveis. O Pages publica a branch `main` a partir de `/(root)`; novos envios atualizam o site automaticamente após a implantação.

## O que conferir após cada atualização

Abra o aplicativo, carregue um exemplo e selecione um output próprio. Confira também a animação, a aba Distâncias e o download de um pacote ZIP de exercício. A seleção de arquivos é local ao navegador; o código do aplicativo não os transmite ao GitHub nem a um servidor de análise.

Os slides pessoais permanecem fora da publicação. As pastas `slides` já tinham páginas de orientação no histórico; PDFs, fontes LaTeX, notas e alterações atuais dessas pastas foram deixados fora dos commits publicados.

Referências: [o que é GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) e [configurar publicação a partir de uma branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
