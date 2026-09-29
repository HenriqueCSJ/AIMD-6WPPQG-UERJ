"""Render the exercise README pages as a local, static site (no student dependencies)."""
from pathlib import Path
import html,re
import markdown
ROOT=Path(__file__).resolve().parents[1]
EX=ROOT/'exercicios'
LESSONS=[('1-agua-dft','Água com DFT'),('2-solvente-implicito','Solvente implícito'),('3-xtb2-etanol','XTB2 e etanol'),('4-timestep','Passo de integração'),('5-termostato','Temperatura e termostato'),('6-complexo-solvator','Zn–en e SOLVATOR'),('7-dinamica-complexo','Dinâmica do complexo'),('8-agua-no-fulereno','Água em C₆₀ · opcional')]
def render(folder,title,source,index,filename='index.html'):
    inside=folder!=EX; prefix='../' if inside else '';repo_prefix='../../' if inside else '../'
    nav=f'<a class="home" href="{prefix}index.html">Visão geral do percurso</a><div class="links">'
    for n,(slug,label) in enumerate(LESSONS,1):
        current=' aria-current="page"' if index==n else ''
        nav+=f'<a href="{prefix}{slug}/index.html"{current}><span class="num">{n:02d}</span><span>{label}</span></a>'
    nav+='</div>'
    body=markdown.markdown(source,extensions=['fenced_code','tables','toc','sane_lists','md_in_html'],extension_configs={'toc':{'toc_depth':'2-2'}},output_format='html')
    def local_link(match):
        href=match.group(1);tail=''
        if href.startswith(('http:','https:','#','mailto:')):return match.group(0)
        if '#' in href:href,tail=href.split('#',1);tail='#'+tail
        resolved=(folder/href).resolve()
        if href.endswith('README.md') and (resolved.parent==EX or resolved.parent.name in dict(LESSONS)):
            href=href[:-len('README.md')]+'index.html'
        elif href.endswith('apoio.md') and resolved.parent.name in dict(LESSONS):
            href=href[:-len('apoio.md')]+'apoio.html'
        return 'href="'+href+tail+'"'
    body=re.sub(r'href="([^"]+)"',local_link,body)
    endnav=''
    if index:
        prev=f'<a href="../{LESSONS[index-2][0]}/index.html">← Exercício {index-1}</a>' if index>1 else '<a href="../index.html">← Percurso</a>'
        nxt=f'<a href="../{LESSONS[index][0]}/index.html">Exercício {index+1} →</a>' if index<len(LESSONS) else '<a href="../index.html">Voltar ao percurso →</a>'
        endnav=f'<nav class="endnav" aria-label="Próxima etapa">{prev}{nxt}</nav>'
    page=f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} · AIMD / ORCA</title><link rel="stylesheet" href="{prefix}pagina.css"><script defer src="{prefix}pagina.js"></script></head>
<body><a class="skip" href="#conteudo">Ir para o conteúdo</a><header class="brand"><a href="{prefix}index.html"><strong>AIMD com ORCA</strong><small>6º Workshop PPGQ–UERJ · 7 de outubro de 2026</small></a><div class="logos"><img src="{repo_prefix}assets/uerj-logo.png" alt="UERJ"><img src="{repo_prefix}assets/ufrrj-logo-compacto.png" alt="UFRRJ"></div></header><div class="layout"><nav class="course-nav" aria-label="Exercícios"><h2>Do input à interpretação</h2>{nav}</nav><main id="conteudo">{body}{endnav}</main></div><footer>Henrique de Castro Silva Junior e Virginia Camila Rufino Ferreira · ORCA 6.1.1 · Materiais e dados locais; links externos levam à documentação oficial.</footer></body></html>'''
    (folder/filename).write_text(page,encoding='utf-8')
for n,(slug,title) in enumerate(LESSONS,1):
    path=EX/slug/'README.md'
    if path.exists():render(path.parent,f'{n}. {title}',path.read_text(encoding='utf-8'),n)
    support=EX/slug/'apoio.md'
    if support.exists():render(support.parent,f'Apoio · {title}',support.read_text(encoding='utf-8'),n,'apoio.html')
render(EX,'Percurso dos exercícios',(EX/'README.md').read_text(encoding='utf-8-sig'),0)
print('Static exercise pages rendered from their README sources.')
