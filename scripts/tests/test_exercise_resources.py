"""Student contracts: complete copy blocks, independent downloads and usable packages."""
from pathlib import Path
import html
import json
import re
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[2]
EX = ROOT / 'exercicios'
DATA = json.loads((EX / 'arquivos-exercicios.json').read_text(encoding='utf-8'))
BLOCK = re.compile(r'<!-- input-source: (.*?) -->\s*```text\n(.*?)\n```', re.S)


def normalized(text):
    return text.replace('\r\n', '\n').strip()


def protocol(path):
    """Compare commands and expanded coordinates, ignoring didactic comments."""
    text = '\n'.join(line.split('#')[0] for line in path.read_text(encoding='utf-8-sig').splitlines())
    key = path.relative_to(ROOT).as_posix()
    external = re.search(r'\*\s*xyzfile\s+(\S+)\s+(\S+)\s+\S+', text, re.I)
    if external:
        xyz = (ROOT / DATA['inputs'][key]['structures'][0]).read_text(encoding='utf-8-sig').splitlines()[2:]
        text = text[:external.start()] + f'* xyz {external[1]} {external[2]}\n' + '\n'.join(xyz) + '\n*'
    inline = re.search(r'\*\s*xyz\s+(\S+)\s+(\S+)\s*\n(.*?)\n\s*\*', text, re.S | re.I)
    coordinates = ()
    if inline:
        coordinates = tuple((parts[0], *(round(float(x), 10) for x in parts[1:])) for line in inline[3].splitlines() if (parts := line.split()))
        text = text[:inline.start()] + f'* xyz {inline[1]} {inline[2]}'
    return ' '.join(text.split()), coordinates


class ExerciseResourcesTests(unittest.TestCase):
    def test_every_input_protocol_has_a_complete_visible_copy_block(self):
        displayed = []
        for page in EX.glob('*/*.md'):
            source = page.read_text(encoding='utf-8-sig')
            output = page.with_name('index.html') if page.name == 'README.md' else page.with_suffix('.html')
            blocks = BLOCK.findall(source)
            if not blocks:
                continue
            self.assertTrue(output.exists(), str(page))
            rendered = output.read_text(encoding='utf-8')
            self.assertEqual(rendered.count('class="input-resources"'), len(blocks), str(page))
            for relative, content in blocks:
                path = (page.parent / relative).resolve()
                self.assertEqual(normalized(content), normalized(path.read_text(encoding='utf-8-sig')), str(path))
                rendered_blocks = [normalized(html.unescape(code)) for code in re.findall(r'<pre><code[^>]*>(.*?)</code></pre>', rendered, re.S)]
                self.assertTrue(normalized(content) in rendered_blocks, f'Copy content changed in {output}: {relative}')
                displayed.append(path)
            for detail in re.findall(r'<details\b([^>]*)>(.*?)</details>', source, re.S):
                if '<!-- input-source:' in detail[1]:
                    self.assertRegex(detail[0], r'\bopen\b', str(page))
        covered = {protocol(path) for path in displayed}
        paths = {p.relative_to(ROOT).as_posix() for p in EX.rglob('*.inp')}
        self.assertEqual(paths, set(DATA['inputs']))
        for key in paths:
            self.assertIn(protocol(ROOT / key), covered, f'No complete copyable protocol: {key}')

    def test_every_input_has_separate_structure_downloads_and_a_contextual_lab(self):
        manifest = json.loads((ROOT / 'visualizador/examples.js').read_text(encoding='utf-8').split('window.AIMD_EXAMPLES = ', 1)[1].strip().rstrip(';'))
        for key, item in DATA['inputs'].items():
            self.assertTrue(item['structures'], key)
            for file in [key, *item['structures'], *item['dependencies'], item['resultsPackage']]:
                self.assertTrue((ROOT / file).is_file(), file)
            preset = manifest['presets'][item['preset']]
            self.assertTrue(preset['runs'], key)
            self.assertTrue(preset['loadMessage'], key)
            for run in preset['runs']:
                self.assertIn(run, manifest['sources'], key)
            route = preset['returnRoute']['href'].split('#')[0]
            self.assertTrue((ROOT / 'visualizador' / route).resolve().is_file(), route)
            self.assertNotRegex(preset['returnRoute']['label'], r'\]\(|^>', key)

    def test_results_packages_retain_every_raw_file_and_ready_to_run_dependencies(self):
        for folder in sorted(p for p in EX.iterdir() if p.is_dir()):
            if not (folder / 'resultados-completos.zip').exists():
                continue
            with zipfile.ZipFile(folder / 'resultados-completos.zip') as archive:
                self.assertIsNone(archive.testzip())
                for file in folder.rglob('*'):
                    if file.is_file() and file.suffix.lower() in {'.inp', '.out', '.csv', '.xyz', '.mdrestart', '.json', '.engrad', '.log'}:
                        self.assertEqual(archive.read(file.relative_to(folder).as_posix()), file.read_bytes(), str(file))
                for key, item in DATA['inputs'].items():
                    path = ROOT / key
                    if not path.is_relative_to(folder):
                        continue
                    base = Path('executar') / path.relative_to(folder).with_suffix('')
                    for file in [key, *item['structures'], *item['dependencies']]:
                        self.assertEqual(archive.read((base / Path(file).name).as_posix()), (ROOT / file).read_bytes(), key)
                    text = path.read_text(encoding='utf-8-sig')
                    filenames = re.findall(r'Restart\s+"([^"]+)"|--input\s+([^"\s]+)', text, re.I)
                    for pair in filenames:
                        filename = next(part for part in pair if part)
                        self.assertIn((base / filename).as_posix(), archive.namelist(), key)

    def test_h5o2_teaching_order_commands_and_stage_archives(self):
        folder = EX / '10-proton-compartilhado'
        text = (folder / 'README.md').read_text(encoding='utf-8')
        names = ['inputs/z00_otimizar.inp', 'inputs/z01_dinamica.inp', 'resultados/proton_shared_10ps/etapas/z02_02000_10000fs.inp']
        positions = [text.index('<!-- input-source: ' + name) for name in names]
        self.assertEqual(positions, sorted(positions))
        for name in names:
            self.assertIn('orca ' + Path(name).name + ' > ', text)
        with zipfile.ZipFile(folder / 'resultado-proton_shared_10ps.zip') as archive:
            self.assertTrue(all(name.startswith('resultados/proton_shared_10ps/') for name in archive.namelist()))
            for stage in ['z01_dinamica', 'z02_02000_10000fs']:
                for suffix in ['.inp', '.out', '-traj.xyz', '-md-ener.csv', '.mdrestart']:
                    self.assertIn('resultados/proton_shared_10ps/etapas/' + stage + suffix, archive.namelist())


if __name__ == '__main__':
    unittest.main()
