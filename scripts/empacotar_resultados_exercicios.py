"""Build complete, documented downloads from retained exercise files only."""
from pathlib import Path
import json
import zipfile
import argparse

ROOT = Path(__file__).resolve().parents[1]
EX = ROOT / 'exercicios'
REGISTRY = json.loads((EX / 'arquivos-exercicios.json').read_text(encoding='utf-8'))


def main(lessons=None):
    available = {Path(key).parts[1] for key in REGISTRY['inputs']}
    selected = set(lessons) if lessons else available
    if not selected <= available:
        raise ValueError(f'Unknown exercise: {selected - available}')
    for lesson in sorted(selected):
        folder = EX / lesson
        cases = {key: value for key, value in REGISTRY['inputs'].items() if Path(key).parts[1] == lesson}
        lines = [f'Resultados completos: {lesson}', '',
                 'Inclui todas as variantes retidas deste exercício, com os nomes e dados originais.',
                 'Os inputs didáticos e os originais executados estão separados em suas pastas.',
                 'Casos preparados, falhos ou interrompidos conservam esse estado; não são resultados completos de uma simulação bem-sucedida.',
                 'Estruturas estáticas de otimização e SOLVATOR não são trajetórias de dinâmica.', '',
                 'Para executar: use a subpasta executar correspondente ao input. O input e todas as suas dependências estão juntos.',
                 'Execute um cálculo por vez. Os resultados retidos estão em resultados/ ou no apoio diagnóstico indicado.', '', 'Inputs e estados:']
        for key, item in cases.items():
            lines.append(f'- {Path(key).relative_to(Path("exercicios") / lesson).as_posix()}: {item["status"]}')
        files = sorted(p for p in folder.rglob('*') if p.is_file() and p.suffix.lower() not in {'.zip', '.html', '.md', '.py', '.js', '.png', '.svg', '.pdf', '.pyc'})
        with zipfile.ZipFile(folder / 'resultados-completos.zip', 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            archive.writestr('LEIA-ME.txt', '\n'.join(lines) + '\n')
            archive.write(folder / 'README.md', 'README-EXERCICIO.md')
            for file in files:
                archive.write(file, file.relative_to(folder).as_posix())
            # Large native SCF logs may be retained in each calculation's result
            # ZIP instead of duplicated as loose files in the website tree.
            for case, package in sorted({(item['case'], item['casePackage']) for item in cases.values() if item.get('casePackage')}):
                name = case + '.scf.log'
                target = f'resultados/{case}/{name}'
                if target in archive.namelist():
                    continue
                with zipfile.ZipFile(ROOT / package) as source:
                    if name in source.namelist():
                        archive.writestr(target, source.read(name))
            for key, item in cases.items():
                # The retained path distinguishes original and didactic inputs with the same basename.
                location = Path('executar') / Path(key).relative_to(Path('exercicios') / lesson).with_suffix('')
                for relative in dict.fromkeys([key, *item['structures'], *item['dependencies']]):
                    archive.write(ROOT / relative, (location / Path(relative).name).as_posix())
        size = (folder / 'resultados-completos.zip').stat().st_size
        assert size < 100_000_000, f'Package too large for the hosting service: {lesson}'
        print(f'{lesson}: {len(files)} retained files, {len(cases)} input paths, {size / 1e6:.1f} MB')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--lesson', action='append')
    main(parser.parse_args().lesson)
