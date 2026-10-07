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
    def test_seven_teaching_copies_omit_only_the_optional_velocity_dump(self):
        expected = {
            f'exercicios/7-dinamica-complexo/inputs/zn_solv_h2o_{suffix}.inp':
            f'exercicios/7-dinamica-complexo/resultados/zn_solv_h2o_{suffix}/zn_solv_h2o_{suffix}.inp'
            for suffix in ['sem_parede', 'spring10', 'spring50', 'spring200']
        }
        expected.update({
            f'exercicios/14-zn-en-pressao/zn_en_{pressure}bar_5ps.inp':
            f'exercicios/14-zn-en-pressao/resultados/zn_en_{pressure}bar_5ps/zn_en_{pressure}bar_5ps.inp'
            for pressure in [1, 1000, 4000]
        })
        actual = {key: item['executedInput'] for key, item in DATA['inputs'].items() if item.get('executedInput')}
        self.assertEqual(actual, expected)
        for teaching, executed in actual.items():
            original = (ROOT / executed).read_text(encoding='utf-8').splitlines()
            removed = [line for line in original if re.match(r'^\s*Dump Velocity ', line)]
            self.assertEqual(len(removed), 1, executed)
            self.assertEqual(removed[0].strip(), f'Dump Velocity Stride 2000 Filename "{DATA["inputs"][teaching]["case"]}-vel.xyz"')
            self.assertEqual(normalized((ROOT / teaching).read_text(encoding='utf-8')), normalized('\n'.join(line for line in original if line != removed[0])), teaching)
            self.assertIn(executed, DATA['inputs'])
            page = ROOT / 'exercicios' / Path(teaching).parts[1] / 'index.html'
            rendered = page.read_text(encoding='utf-8')
            card = re.search(r'<div class="input-resources" data-input="' + re.escape(teaching) + r'">(.*?)</div></div>', rendered, re.S)[1]
            href = executed.split('/resultados/', 1)[1]
            self.assertIn(f'href="resultados/{href}" download>Input original executado', card)
        self.assertIn('Dump Velocity Stride 1', (EX / '1-agua-dft/inputs/agua_dump.inp').read_text())

    def test_chelation_classroom_has_two_minimal_inputs_and_all_nine_original_support_protocols_remain_copyable(self):
        folder = EX / '11-formacao-quelato'
        main = (folder / 'README.md').read_text(encoding='utf-8')
        history = (folder / 'historico.md').read_text(encoding='utf-8')
        support = (folder / 'apoio.md').read_text(encoding='utf-8')
        self.assertEqual(len(BLOCK.findall(main)), 2)
        self.assertEqual(len(BLOCK.findall(history)), 5)
        self.assertEqual(len(BLOCK.findall(support)), 4)
        self.assertLess(main.index('Ajudamos o primeiro N'), main.index('Abrir o percurso'))
        self.assertLess(main.index('seis águas já coordenadas'), main.index('Abrir o percurso'))
        self.assertGreater(main.index('Como a aproximação foi forçada?'), main.index('Abrir o percurso'))
        self.assertNotIn('7083', main)
        self.assertNotIn('CoordNumber', main)
        self.assertNotIn('Define 2', main)
        self.assertNotIn('Define 3', main)
        self.assertNotIn('Reset Colvar 3', main)
        self.assertIn('en_aproximar_N1', main)
        self.assertIn('en_continuar_sem_mola', main)
        self.assertIn('9864', history)
        self.assertIn('ainda não foram executados', support)
        with zipfile.ZipFile(folder / 'resultados-completos.zip') as archive:
            for name in ['historico.md', 'apoio.md']:
                self.assertEqual(archive.read(name), (folder / name).read_bytes())

    def test_raw_solvator_packages_include_the_native_scf_logs(self):
        folder = EX / '7-dinamica-complexo'
        with zipfile.ZipFile(folder / 'resultados-completos.zip') as combined:
            for suffix in ['sem_parede', 'spring10', 'spring50', 'spring200']:
                case = 'zn_solv_h2o_' + suffix
                with zipfile.ZipFile(folder / f'resultado-{case}.zip') as own:
                    name = case + '.scf.log'
                    self.assertGreater(own.getinfo(name).file_size, 0)
                    self.assertEqual(combined.read(f'resultados/{case}/{name}'), own.read(name))

    def test_generated_results_have_direct_xyz_downloads_in_every_visible_input_card(self):
        manifest = json.loads((ROOT / 'visualizador/examples.js').read_text(encoding='utf-8').split('window.AIMD_EXAMPLES = ', 1)[1].strip().rstrip(';'))
        for page in EX.glob('*/*.md'):
            blocks = BLOCK.findall(page.read_text(encoding='utf-8-sig'))
            if not blocks:
                continue
            output = page.with_name('index.html') if page.name == 'README.md' else page.with_suffix('.html')
            rendered = output.read_text(encoding='utf-8')
            for relative, _ in blocks:
                key = (page.parent / relative).resolve().relative_to(ROOT).as_posix()
                item = DATA['inputs'][key]
                expected = [result for run in manifest['presets'][item['preset']]['runs'] for result in manifest['sources'][run]['resultXYZ']]
                if item['state'].startswith('prepared'):
                    continue
                if item['state'].startswith('complete') or item['state'] in {'failed_partial_md', 'partial_interrupted_md'}:
                    self.assertTrue(expected, f'Generated XYZ missing: {key}')
                card = re.search(r'<div class="input-resources" data-input="' + re.escape(key) + r'">(.*?)</div></div>', rendered, re.S)
                self.assertIsNotNone(card, key)
                links = re.findall(r'<a href="([^"]+)" download[^>]*>Baixar XYZ do resultado', card[1])
                linked = {(output.parent / html.unescape(link)).resolve() for link in links}
                for result in expected:
                    self.assertIn((ROOT / result['path']).resolve(), linked, key)
                    self.assertTrue((ROOT / result['path']).is_file(), result['path'])
        for run, stage in [('dimero_xtb2_5ps', 'water_02000_05000fs-traj.xyz'), ('etanol_nve_5ps', 'ethanol_00500_05000fs-traj.xyz'), ('proton_shared_10ps', 'z02_02000_10000fs-traj.xyz')]:
            self.assertTrue(any(result['name'] == stage for result in manifest['sources'][run]['resultXYZ']), stage)
        generated_paths = {result['path'] for source in manifest['sources'].values() for result in source['resultXYZ']}
        for stage in ['h01_aquecer', 'p03_equilibrar', 'p04_observar', 't500_gota', 't600_gota']:
            self.assertIn(f'exercicios/12-gota-protonada/resultados/etapas/originais/{stage}/{stage}-traj.xyz', generated_paths)
        for key in ['zn2_isolado', 'z00_otimizar_inicial', 'probe_properties', 'al_agua_nh3_xtb2']:
            self.assertEqual(manifest['sources'][key]['resultXYZ'], [], key)
        self.assertTrue(manifest['sources']['zn_ion_20h2o_solvator']['resultXYZ'][0]['path'].endswith('.solvator.xyz'))
        self.assertTrue(manifest['sources']['z00_otimizar']['resultXYZ'][0]['path'].endswith('h5o2_otimizado.xyz'))

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
        # Only the seven explicitly declared native/teaching pairs may use a
        # teaching copy. Their sole output-line difference is checked above.
        teaching_for_executed = {item['executedInput']: key for key, item in DATA['inputs'].items() if item.get('executedInput')}
        for key in paths:
            copy_key = teaching_for_executed.get(key, key)
            self.assertIn(protocol(ROOT / copy_key), covered, f'No complete copyable protocol: {key}')

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
