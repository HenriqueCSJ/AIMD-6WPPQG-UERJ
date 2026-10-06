"""Render exercise README pages as a local static site (no student dependencies)."""
from pathlib import Path
import html
import re
import json
import os
import markdown

ROOT = Path(__file__).resolve().parents[1]
EX = ROOT / 'exercicios'
COURSE = [('1-agua-dft', 'Água: molécula e dímero'), ('3-xtb2-etanol', 'Etanol: controle'), ('4-timestep', 'Timestep e correção'), ('5-termostato', 'Aquecer e resfriar'), ('6-complexo-solvator', 'Zn²⁺ + 20 águas: SOLVATOR'), ('7-dinamica-complexo', 'Zn²⁺: hidratação e paredes'), ('11-formacao-quelato', 'en: primeiro N assistido, segundo N livre'), ('14-zn-en-pressao', 'Zn–en sem assistência: 1 / 1000 / 4000 bar'), ('10-proton-compartilhado', 'Um próton entre duas águas')]
OPTIONAL = [('13-cell-pressao', 'Cell: parede, pressão e volume'), ('2-solvente-implicito', 'DFT e solvente contínuo'), ('12-gota-protonada', 'Gota protonada: 300–600 K'), ('8-agua-no-fulereno', 'Água dentro de C₆₀'), ('9-aluminio-amonia', 'Al³⁺/amônia: referência')]
LESSONS = COURSE + OPTIONAL
BADGES = ['01', '02a', '02b', '03', '04a', '04b', '04c', '04d', '05'] + ['C'] + ['↗'] * (len(OPTIONAL) - 1)
CELL_STEPS = [('parede-e-rigidez', 'C1 · Parede e rigidez'), ('pressao-e-volume', 'C2 · Pressão e volume'), ('fixar-ou-remover', 'C3 · Fixar ou remover')]


def input_resources(body, folder):
    """Put each input's own downloads and preloaded laboratory beside its copy block."""
    registry = ROOT / 'exercicios/arquivos-exercicios.json'
    if not registry.exists():
        return body
    assets = json.loads(registry.read_text(encoding='utf-8'))['inputs']
    manifest_text = (ROOT / 'visualizador/examples.js').read_text(encoding='utf-8').split('window.AIMD_EXAMPLES = ', 1)[1].strip().rstrip(';')
    manifest = json.loads(manifest_text)
    def resource_card(match):
        relative = match.group(1)
        key = (folder / relative).resolve().relative_to(ROOT).as_posix()
        if key not in assets:
            raise ValueError(f'Input without exercise resources: {key}')
        item = assets[key]
        def link(path, label, download=True):
            href = os.path.relpath(ROOT / path, folder).replace('\\', '/')
            attr = ' download' if download else ''
            return f'<a href="{html.escape(href, quote=True)}"{attr}>{html.escape(label)}</a>'
        links = [link(key, 'Baixar input completo')]
        for structure in item['structures']:
            links.append(link(structure, 'Baixar XYZ de entrada · ' + Path(structure).name))
        results = {}
        if not item['state'].startswith('prepared'):
            for runkey in manifest['presets'][item['preset']]['runs']:
                for result in manifest['sources'][runkey].get('resultXYZ', []):
                    results[result['path']] = result
        for result in sorted(results.values(), key=lambda result: (result['name'] != item['case'] + '-traj.xyz', result['name'])):
            links.append(link(result['path'], 'Baixar XYZ do resultado' + (' parcial' if result.get('partial') else '') + ' · ' + result['name']))
        for dependency in item.get('dependencies', []):
            links.append(link(dependency, 'Auxiliar obrigatório · ' + Path(dependency).name))
        if item.get('executionPackage'):
            links.append(link(item['executionPackage'], 'Pacote para executar'))
        if item.get('casePackage'):
            links.append(link(item['casePackage'], 'Resultados completos desta etapa'))
        links.append(link(item['resultsPackage'], 'Resultados completos deste exercício · todas as variantes'))
        lab = os.path.relpath(ROOT / 'visualizador/index.html', folder).replace('\\', '/')
        links.append(f'<a class="open-input-lab" href="{lab}?exemplo={html.escape(item["preset"], quote=True)}&amp;aba=trajetoria">{html.escape(item.get("labLabel", "Abrir no laboratório com tudo carregado"))}</a>')
        status = html.escape(item['status'])
        return match.group(0) + f'\n<div class="input-resources" data-input="{html.escape(key, quote=True)}"><p><strong>{html.escape(Path(key).name)}</strong> · {status}</p><div class="input-downloads">' + ''.join(links) + '</div></div>\n'
    return re.sub(r'<!-- input-source: (.*?) -->', resource_card, body)


def course_controls(index, prefix, filename, location):
    """Keep the classroom sequence independent from optional/support pages."""
    if not index:
        return ''
    slug, label = LESSONS[index - 1]
    is_support = filename != 'index.html'
    if is_support:
        status = f'Apoio à atividade · {html.escape(label)}'
        links = f'<a class="route-prev" href="index.html">← Voltar à atividade</a><a class="route-next" href="{prefix}index.html">Mapa do percurso</a>'
    elif index <= len(COURSE):
        status = f'Etapa {index} de {len(COURSE)} · Bloco {BADGES[index - 1]}'
        prev_slug, prev_label = COURSE[index - 2] if index > 1 else ('', 'Mapa do percurso')
        prev_url = f'{prefix}{prev_slug}/index.html' if prev_slug else f'{prefix}index.html'
        links = f'<a class="route-prev" rel="prev" href="{prev_url}"><small>Anterior</small><span>← {html.escape(prev_label)}</span></a>'
        if index < len(COURSE):
            next_slug, next_label = COURSE[index]
            links += f'<a class="route-next" rel="next" href="{prefix}{next_slug}/index.html"><small>Próximo</small><span>{html.escape(next_label)} →</span></a>'
        else:
            links += f'<a class="route-next" href="{prefix}index.html"><small>Percurso concluído</small><span>Voltar ao mapa →</span></a>'
    else:
        status = 'Complemento opcional · Cell · C1 → C2 → C3' if slug == '13-cell-pressao' else 'Opcional ou referência · fora da sequência da aula'
        links = f'<a class="route-prev" href="{prefix}index.html">← Voltar ao percurso da aula</a><a class="route-next" href="{prefix}index.html#opcionais-e-referencias">Ver outros opcionais →</a>'
    progress = f'<progress class="course-progress" value="{index}" max="{len(COURSE)}" aria-label="Etapa {index} de {len(COURSE)}"></progress>' if index <= len(COURSE) and not is_support else ''
    return f'<nav class="route-nav route-{location}" aria-label="Navegação do percurso — {location}"><div class="route-status">{status}{progress}</div><div class="route-controls">{links}</div><a class="route-map" href="{prefix}index.html">Mapa completo do percurso</a></nav>'


def section_index(tokens, slug):
    if slug == '13-cell-pressao':
        entries = CELL_STEPS
        title = 'Neste complemento opcional · siga C1 → C2 → C3'
    else:
        entries = [(token['id'], html.unescape(re.sub('<[^>]+>', '', token['name']))) for token in tokens]
        entries = [(anchor, ('Complemento opcional · ' if anchor == 'alem-das-posicoes' and not label.startswith('Complemento opcional') else '') + label) for anchor, label in entries]
        title = 'Nesta página'
    if not entries:
        return ''
    links = ''.join(f'<li><a href="#{html.escape(anchor, quote=True)}">{html.escape(label)}</a></li>' for anchor, label in entries)
    return f'<nav class="section-nav" aria-label="Seções desta página"><strong>{title}</strong><ul>{links}</ul></nav>'


def add_section_return(body, anchor, controls):
    """Add navigation after an explicitly anchored heading, retaining its content."""
    pattern = rf'(<a\b[^>]*\bid="{re.escape(anchor)}"[^>]*>\s*</a>.*?</h[23]>|<h[23]\b[^>]*\bid="{re.escape(anchor)}"[^>]*>.*?</h[23]>)'
    return re.sub(pattern, lambda match: match.group(0) + controls, body, count=1, flags=re.S)


def build_page(folder, title, source, index, filename='index.html'):
    inside = folder != EX
    prefix = '../' if inside else ''
    repo_prefix = '../../' if inside else '../'
    slug = LESSONS[index - 1][0] if index else ''
    nav = f'<a class="home" href="{prefix}index.html">Visão geral do percurso</a>'
    nav += f'<a class="parameter-guide" href="{repo_prefix}guia-md/index.html" target="_blank" rel="noopener" aria-label="Guia de parâmetros %md (abre em outra aba)">Guia de parâmetros %md ↗</a>'
    for group, entries, offset in [('Durante a aula · siga nesta ordem', COURSE, 0), ('Complementos opcionais e referências', OPTIONAL, len(COURSE))]:
        nav += f'<h3 class="nav-group">{group}</h3>'
        if offset:
            nav += f'<p class="nav-note">A sequência da aula segue diretamente entre as {len(COURSE)} etapas acima.</p>'
        nav += '<ol class="links">'
        for n, (lesson_slug, label) in enumerate(entries, 1 + offset):
            current = ' aria-current="page"' if index == n and filename == 'index.html' else ''
            nav += f'<li><a href="{prefix}{lesson_slug}/index.html"{current}><span class="num">{BADGES[n - 1]}</span><span>{label}</span></a></li>'
        nav += '</ol>'
    converter = markdown.Markdown(extensions=['fenced_code', 'tables', 'toc', 'sane_lists', 'md_in_html'], extension_configs={'toc': {'toc_depth': '2-2'}}, output_format='html')
    body = converter.convert(source)

    def local_link(match):
        href = match.group(1)
        tail = ''
        if href.startswith(('http:', 'https:', '#', 'mailto:')):
            return match.group(0)
        if '#' in href:
            href, tail = href.split('#', 1)
            tail = '#' + tail
        resolved = (folder / href).resolve()
        if href.endswith('README.md') and (resolved.parent == EX or resolved.parent.name in dict(LESSONS)):
            href = href[:-len('README.md')] + 'index.html'
        elif href.endswith('.md') and resolved.parent.name in dict(LESSONS) and resolved.stem in ('apoio', 'historico', 'historico-apoio', 'historico-radial', 'historico-radial-apoio', 'hidratacao', 'verificacao-dump'):
            href = href[:-3] + '.html'
        elif href.endswith('roteiro-4h.md') and resolved.parent == EX:
            href = href[:-len('roteiro-4h.md')] + 'roteiro-4h.html'
        elif href.endswith('.md') and resolved.parent == ROOT / 'tutoriais':
            href = 'https://github.com/HenriqueCSJ/AIMD-6WPPQG-UERJ/blob/main/' + resolved.relative_to(ROOT).as_posix()
        download = ''
        if not tail and resolved.suffix.lower() in ('.inp', '.xyz', '.mdrestart'):
            download = ' download="' + html.escape(resolved.name, quote=True) + '"'
        return 'href="' + href + tail + '"' + download

    body = re.sub(r'href="([^"]+)"', local_link, body)
    body = input_resources(body, folder)
    if '<div class="toc">' not in body:
        # Handwritten stable anchors take precedence over the heading slug.
        stable_anchors = {heading: anchor for anchor, heading in re.findall(r'<a\b[^>]*\bid="([^"]+)"[^>]*>\s*</a>\s*(?:</p>\s*)?<h2\b[^>]*\bid="([^"]+)"', body)}
        tokens = [dict(token, id=stable_anchors.get(token['id'], token['id'])) for token in converter.toc_tokens]
        sections = section_index(tokens, slug)
        body = re.sub(r'</h1>', lambda match: match.group(0) + sections, body, count=1)
    if slug == '13-cell-pressao' and filename == 'index.html':
        for step, (anchor, label) in enumerate(CELL_STEPS):
            prev = f'<a href="#{CELL_STEPS[step - 1][0]}">← {CELL_STEPS[step - 1][1]}</a>' if step else '<a href="#conteudo">← Início do complemento</a>'
            nxt = f'<a href="#{CELL_STEPS[step + 1][0]}">{CELL_STEPS[step + 1][1]} →</a>' if step + 1 < len(CELL_STEPS) else '<a href="../index.html">Voltar ao percurso →</a>'
            controls = f'<nav class="complement-steps" aria-label="Navegação do complemento · {label}"><span>{label} · {step + 1} de 3</span>{prev}{nxt}</nav>'
            body = add_section_return(body, anchor, controls)
    elif slug == '1-agua-dft' and filename == 'index.html':
        body = add_section_return(body, 'alem-das-posicoes', '<nav class="complement-steps" aria-label="Retorno do complemento Dump"><span>Complemento opcional · Dump</span><a href="#conteudo">↑ Voltar à etapa da água e à sequência da aula</a></nav>')
    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} · AIMD / ORCA</title><link rel="stylesheet" href="{prefix}pagina.css?v=20261006-solvator-direto"><script defer src="{prefix}pagina.js?v=20261006-solvator-direto"></script></head>
<body><a class="skip" href="#conteudo">Ir para o conteúdo</a><header class="brand"><a href="{prefix}index.html"><strong>AIMD com ORCA</strong><small>6º Workshop PPGQ–UERJ · 7 de outubro de 2026</small></a><div class="logos"><img src="{repo_prefix}assets/uerj-logo.png" alt="UERJ"><img src="{repo_prefix}assets/ufrrj-logo-compacto.png" alt="UFRRJ"></div></header><div class="layout"><nav class="course-nav" aria-label="Mapa dos exercícios"><details class="course-map" open><summary>Mapa dos exercícios <small>{len(COURSE)} etapas + complementos opcionais</small></summary>{nav}</details></nav><main id="conteudo">{course_controls(index, prefix, filename, 'topo')}<article class="lesson-content">{body}</article>{course_controls(index, prefix, filename, 'fim')}</main></div><footer>Henrique de Castro Silva Junior e Virginia Camila Rufino Ferreira · ORCA 6.1.1 · Materiais e dados locais; links externos levam à documentação oficial.</footer></body></html>'''


def render(folder, title, source, index, filename='index.html'):
    (folder / filename).write_text(build_page(folder, title, source, index, filename), encoding='utf-8')


def main():
    for n, (slug, title) in enumerate(LESSONS, 1):
        path = EX / slug / 'README.md'
        if path.exists():
            render(path.parent, f'{BADGES[n - 1]} · {title}', path.read_text(encoding='utf-8'), n)
        support = EX / slug / 'apoio.md'
        if support.exists():
            render(support.parent, f'Apoio · {title}', support.read_text(encoding='utf-8'), n, 'apoio.html')
        for historical_name in ('historico', 'historico-apoio', 'historico-radial', 'historico-radial-apoio', 'verificacao-dump'):
            historical = EX / slug / f'{historical_name}.md'
            if historical.exists():
                render(historical.parent, f'Histórico · {title}', historical.read_text(encoding='utf-8'), n, f'{historical_name}.html')
        hydration = EX / slug / 'hidratacao.md'
        if hydration.exists():
            render(hydration.parent, 'Ver a camada de águas se formar', hydration.read_text(encoding='utf-8'), n, 'hidratacao.html')
    render(EX, 'Percurso dos exercícios', (EX / 'README.md').read_text(encoding='utf-8-sig'), 0)
    render(EX, 'Roteiro de quatro horas', (EX / 'roteiro-4h.md').read_text(encoding='utf-8-sig'), 0, 'roteiro-4h.html')
    print('Static exercise pages rendered from their README sources.')


if __name__ == '__main__':
    main()
