"""The main route never forces an optional detour; local links stay usable."""
import importlib.util
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

SPEC = importlib.util.spec_from_file_location('exercise_pages', Path(__file__).parents[1] / 'gerar_paginas_exercicios.py')
PAGES = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PAGES)


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = set()
        self.links = []
        self.navs = []
        self.active_navs = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        if tag == 'nav':
            nav = {'attrs': attrs, 'links': []}
            self.navs.append(nav)
            self.active_navs.append(nav)
        if tag == 'a':
            self.links.append(attrs)
            for nav in self.active_navs:
                nav['links'].append(attrs)

    def handle_endtag(self, tag):
        if tag == 'nav':
            self.active_navs.pop()


class CourseNavigationTests(unittest.TestCase):
    def page(self, index, source='# Atividade\n\n## Observar\n\nTexto.', filename='index.html'):
        slug, title = PAGES.LESSONS[index - 1]
        return PAGES.build_page(PAGES.EX / slug, title, source, index, filename)

    def routes(self, page):
        return [nav for nav in Document(page).navs if 'route-nav' in nav['attrs'].get('class', '')]

    def test_all_eight_core_pages_have_same_previous_next_at_top_and_end(self):
        self.assertEqual(len(PAGES.COURSE), 8)
        self.assertEqual(PAGES.BADGES[:8], ['01', '02a', '02b', '03', '04a', '04b', '04c', '05'])
        for index in range(1, 9):
            with self.subTest(index=index):
                page = self.page(index)
                top, bottom = self.routes(page)
                self.assertEqual(top['links'], bottom['links'])
                self.assertIn(f'Etapa {index} de 8', page)
                prev = [a for a in top['links'] if a.get('rel') == 'prev']
                self.assertEqual(len(prev), 1)
                self.assertEqual(prev[0]['href'], '../index.html' if index == 1 else f'../{PAGES.COURSE[index - 2][0]}/index.html')
                nxt = [a for a in top['links'] if a.get('rel') == 'next']
                if index < 8:
                    self.assertEqual(nxt[0]['href'], f'../{PAGES.COURSE[index][0]}/index.html')
                else:
                    self.assertEqual(nxt, [])
                    self.assertIn('Percurso concluído', page)

    def test_support_returns_to_its_activity_without_skipping_a_course_step(self):
        for filename in ['apoio.html', 'hidratacao.html']:
            page = self.page(6, filename=filename)
            for nav in self.routes(page):
                self.assertEqual(nav['links'][0]['href'], 'index.html')
                self.assertFalse(any(link.get('rel') == 'next' for link in nav['links']))
            self.assertIn('Apoio à atividade', page)

    def test_cell_has_three_independent_anchored_steps_and_return(self):
        source = '# Cell\n\nComplemento.\n\n' + '\n\n'.join(f'<a id="{anchor}"></a>\n\n## {label}\n\nConteúdo.' for anchor, label in PAGES.CELL_STEPS)
        page = self.page(9, source)
        doc = Document(page)
        self.assertIn('Complemento opcional · Cell', page)
        self.assertNotIn('<progress', page)
        steps = [nav for nav in doc.navs if nav['attrs'].get('class') == 'complement-steps']
        self.assertEqual(len(steps), 3)
        self.assertEqual(steps[0]['links'][-1]['href'], '#pressao-e-volume')
        self.assertEqual(steps[1]['links'][0]['href'], '#parede-e-rigidez')
        self.assertEqual(steps[1]['links'][-1]['href'], '#fixar-ou-remover')
        self.assertEqual(steps[2]['links'][-1]['href'], '../index.html')
        for link in doc.links:
            if link.get('href', '').startswith('#'):
                self.assertIn(link['href'][1:], doc.ids)

    def test_dump_uses_its_stable_anchor_and_is_marked_optional(self):
        source = '# Água\n\n<a id="alem-das-posicoes"></a>\n\n## Além das posições: Dump\n\nObservação.\n\n## Continuar a aula\n\nTexto.'
        page = self.page(1, source)
        doc = Document(page)
        sections = next(nav for nav in doc.navs if nav['attrs'].get('class') == 'section-nav')
        self.assertEqual(sections['links'][0]['href'], '#alem-das-posicoes')
        self.assertIn('Complemento opcional · Além das posições', page)
        dump = next(nav for nav in doc.navs if nav['attrs'].get('aria-label') == 'Retorno do complemento Dump')
        self.assertEqual(dump['links'][0]['href'], '#conteudo')

    def test_current_page_and_external_guide_preserve_accessible_link_semantics(self):
        doc = Document(self.page(3))
        current = [link for link in doc.links if link.get('aria-current') == 'page']
        self.assertEqual(len(current), 1)
        self.assertEqual(current[0]['href'], '../4-timestep/index.html')
        guide = next(link for link in doc.links if link.get('class') == 'parameter-guide')
        self.assertEqual(guide['target'], '_blank')
        self.assertEqual(guide['rel'], 'noopener')

    def test_retained_inputs_and_each_section_anchor_survive_rendering(self):
        for index, (slug, title) in enumerate(PAGES.LESSONS, 1):
            source_path = PAGES.EX / slug / 'README.md'
            if not source_path.exists():
                continue
            with self.subTest(slug=slug):
                source = source_path.read_text(encoding='utf-8')
                plain = PAGES.markdown.markdown(source, extensions=['fenced_code', 'tables', 'toc', 'sane_lists', 'md_in_html'])
                page = self.page(index, source)
                self.assertEqual(re.findall(r'<pre>.*?</pre>', plain, re.S), re.findall(r'<pre>.*?</pre>', page, re.S))
                doc = Document(page)
                for nav in doc.navs:
                    if nav['attrs'].get('class') == 'section-nav':
                        for link in nav['links']:
                            self.assertIn(link['href'][1:], doc.ids)


if __name__ == '__main__':
    unittest.main()
