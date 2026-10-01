"""Render the exercise README pages as a local, static site (no student dependencies)."""
from pathlib import Path
import html,re
import markdown
ROOT=Path(__file__).resolve().parents[1]
EX=ROOT/'exercicios'
COURSE=[('1-agua-dft','Dímero de água'),('3-xtb2-etanol','Etanol: controle'),('4-timestep','Timestep e correção'),('5-termostato','Aquecer e resfriar'),('6-complexo-solvator','Zn–en: SOLVATOR'),('7-dinamica-complexo','Zn–en: parede'),('11-formacao-quelato','Zn–en: formar o quelato'),('10-proton-compartilhado','Um próton entre duas águas')]
OPTIONAL=[('2-solvente-implicito','DFT e solvente contínuo'),('12-gota-protonada','Gota protonada: 300–600 K'),('8-agua-no-fulereno','Água dentro de C₆₀'),('9-aluminio-amonia','Al³⁺/amônia: referência')]
LESSONS=COURSE+OPTIONAL
BADGES=['01','02a','02b','03','04a','04b','04c','05']+['↗']*len(OPTIONAL)
def render(folder,title,source,index,filename='index.html'):
    inside=folder!=EX; prefix='../' if inside else '';repo_prefix='../../' if inside else '../'
    nav=f'<a class="home" href="{prefix}index.html">Visão geral do percurso</a>'
    for group,entries,offset in [('Durante a aula',COURSE,0),('Opcionais e referências',OPTIONAL,len(COURSE))]:
        nav+=f'<h3 class="nav-group">{group}</h3><div class="links">'
        for n,(slug,label) in enumerate(entries,1+offset):
            current=' aria-current="page"' if index==n and filename=='index.html' else ''
            nav+=f'<a href="{prefix}{slug}/index.html"{current}><span class="num">{BADGES[n-1]}</span><span>{label}</span></a>'
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
        elif href.endswith('roteiro-4h.md') and resolved.parent==EX:
            href=href[:-len('roteiro-4h.md')]+'roteiro-4h.html'
        elif href.endswith('.md') and resolved.parent==ROOT/'tutoriais':
            # Pages serves Markdown as text; open the readable GitHub guide.
            href='https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ/blob/main/'+resolved.relative_to(ROOT).as_posix()
        return 'href="'+href+tail+'"'
    body=re.sub(r'href="([^"]+)"',local_link,body)
    endnav=''
    if index and index<=len(COURSE):
        prev=f'<a href="../{COURSE[index-2][0]}/index.html">← {COURSE[index-2][1]}</a>' if index>1 else '<a href="../index.html">← Percurso</a>'
        nxt=f'<a href="../{COURSE[index][0]}/index.html">{COURSE[index][1]} →</a>' if index<len(COURSE) else '<a href="../index.html#opcionais-e-referencias">Explorar os opcionais →</a>'
        endnav=f'<nav class="endnav" aria-label="Próxima etapa">{prev}{nxt}</nav>'
    elif index:
        endnav='<nav class="endnav" aria-label="Voltar"><a href="../index.html">← Percurso da aula</a><a href="../index.html#opcionais-e-referencias">Outros opcionais →</a></nav>'
    page=f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} · AIMD / ORCA</title><link rel="stylesheet" href="{prefix}pagina.css?v=20261001-course"><script defer src="{prefix}pagina.js"></script></head>
<body><a class="skip" href="#conteudo">Ir para o conteúdo</a><header class="brand"><a href="{prefix}index.html"><strong>AIMD com ORCA</strong><small>6º Workshop PPGQ–UERJ · 7 de outubro de 2026</small></a><div class="logos"><img src="{repo_prefix}assets/uerj-logo.png" alt="UERJ"><img src="{repo_prefix}assets/ufrrj-logo-compacto.png" alt="UFRRJ"></div></header><div class="layout"><nav class="course-nav" aria-label="Exercícios"><h2>Do input à interpretação</h2>{nav}</nav><main id="conteudo">{body}{endnav}</main></div><footer>Henrique de Castro Silva Junior e Virginia Camila Rufino Ferreira · ORCA 6.1.1 · Materiais e dados locais; links externos levam à documentação oficial.</footer></body></html>'''
    (folder/filename).write_text(page,encoding='utf-8')
for n,(slug,title) in enumerate(LESSONS,1):
    path=EX/slug/'README.md'
    if path.exists():render(path.parent,f'{BADGES[n-1]} · {title}',path.read_text(encoding='utf-8'),n)
    support=EX/slug/'apoio.md'
    if support.exists():render(support.parent,f'Apoio · {title}',support.read_text(encoding='utf-8'),n,'apoio.html')
    hydration=EX/slug/'hidratacao.md'
    if hydration.exists():render(hydration.parent,'Ver a camada de águas se formar',hydration.read_text(encoding='utf-8'),n,'hidratacao.html')
render(EX,'Percurso dos exercícios',(EX/'README.md').read_text(encoding='utf-8-sig'),0)
render(EX,'Roteiro de quatro horas',(EX/'roteiro-4h.md').read_text(encoding='utf-8-sig'),0,'roteiro-4h.html')
print('Static exercise pages rendered from their README sources.')
