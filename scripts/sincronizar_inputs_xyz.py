"""Keep small teaching inputs, displayed blocks and their existing ZIPs in sync.

The XYZ files remain the geometry source. No calculation is run. By default,
check only; use --write to update, then run gerar_paginas_exercicios.py.
Historical inputs/results and restart packages are never rewritten.
"""
from pathlib import Path
import argparse
import io
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EX = ROOT / 'exercicios'
INLINE = {
    '1-agua-dft': {'agua_dft': 'agua', 'preparar_agua': 'agua_inicial',
                   'dimero_b97': 'dimero_b97', 'dimero_xtb2_2ps': 'dimero_b97'},
    '2-solvente-implicito': {'agua_cpcm': 'agua', 'dimero_b97_cpcm': 'dimero_b97'},
    '3-xtb2-etanol': {'etanol_nve': 'etanol', 'preparar_etanol': 'etanol_inicial'},
    '4-timestep': {name: 'etanol' for name in
                   ('etanol_instavel', 'etanol_corrigido', 'etanol_dt025',
                    'etanol_dt200', 'etanol_dt500')},
    '5-termostato': {'etanol_etapas': 'etanol', 'etanol_csvr': 'etanol'},
    '10-proton-compartilhado': {'proton_shared': 'h5o2_otimizado',
                               'z00_otimizar': 'h5o2_inicial'},
}
BLOCK = re.compile(r'(<!-- input-source: ([^\n]+) -->\n```text\n)(.*?)(\n```)', re.S)


def read(path):
    return path.read_bytes().decode('utf-8').replace('\r\n', '\n')


def geometry(path):
    lines = read(path).splitlines()
    count = int(lines[0])
    coords = lines[2:]
    if len(coords) != count or any(len(line.split()) != 4 for line in coords):
        raise ValueError(f'Invalid single-frame XYZ: {path}')
    return '\n'.join(coords)


def desired_input(path, xyz):
    source = read(path)
    # Accept the original external line or the one existing inline block.
    pattern = re.compile(r'^\* xyzfile (-?\d+) (\d+) [^\n]+$|'
                         r'^\* xyz (-?\d+) (\d+)\n.*?^\*[ \t]*$', re.M | re.S)
    matches = list(pattern.finditer(source))
    if len(matches) != 1:
        raise ValueError(f'Expected one geometry block: {path}')
    match = matches[0]
    charge = match.group(1) or match.group(3)
    mult = match.group(2) or match.group(4)
    block = f'* xyz {charge} {mult}\n{geometry(xyz)}\n*'
    return source[:match.start()] + block + source[match.end():]


def synchronize(write=False):
    pending = []
    inputs = {}
    def update(path, data):
        if path.read_bytes() != data:
            pending.append(str(path.relative_to(ROOT)))
            if write:
                path.write_bytes(data)

    for slug, entries in INLINE.items():
        folder = EX / slug
        for name, xyz in entries.items():
            path = folder / 'inputs' / f'{name}.inp'
            content = desired_input(path, folder / 'estruturas' / f'{xyz}.xyz')
            inputs[path] = content
            update(path, content.encode('utf-8'))
            archive = folder / f'aula-{name}.zip'
            if not archive.exists():
                continue
            with zipfile.ZipFile(archive) as old:
                infos = old.infolist()
                members = {info.filename: old.read(info) for info in infos}
                matching = [info.filename for info in infos
                            if Path(info.filename).name == path.name]
                if len(matching) != 1:
                    raise ValueError(f'Expected one matching input: {archive}')
                geometry_members = [info.filename for info in infos
                                    if Path(info.filename).name == f'{xyz}.xyz']
                if len(geometry_members) != 1:
                    raise ValueError(f'Expected one matching XYZ: {archive}')
                replacements = {matching[0]: content.encode('utf-8'),
                                geometry_members[0]: (folder / 'estruturas' /
                                                       f'{xyz}.xyz').read_bytes()}
                if any(members[name] != data for name, data in replacements.items()):
                    pending.append(str(archive.relative_to(ROOT)))
                    if write:
                        buffer = io.BytesIO()
                        with zipfile.ZipFile(buffer, 'w') as new:
                            new.comment = old.comment
                            for info in infos:
                                new.writestr(info, replacements.get(info.filename,
                                                                   members[info.filename]))
                    else:
                        buffer = None
                else:
                    buffer = None
            if buffer is not None:
                archive.write_bytes(buffer.getvalue())

    for page in sorted(EX.glob('*/*.md')):
        source = read(page)
        def replace(match):
            path = (page.parent / match.group(2)).resolve()
            if not path.is_relative_to(EX) or not path.is_file():
                raise ValueError(f'Invalid input-source in {page}: {path}')
            content = inputs.get(path, read(path)).rstrip('\n')
            return match.group(1) + content + match.group(4)
        changed = BLOCK.sub(replace, source)
        if changed != source:
            update(page, changed.encode('utf-8'))
    return pending


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Apply updates')
    args = parser.parse_args()
    changes = synchronize(args.write)
    for path in changes:
        print(path)
    print(f'{len(changes)} ' + ('files updated.' if args.write else 'files need synchronization.'))
    if changes and not args.write:
        raise SystemExit(1)
