"""Preparacao didatica opcional: afastar cada H2O rigidamente 0,8 A do Zn.

Uso: python preparar_aguas.py zn_ion_20h2o_solvator.solvator.xyz
Requer somente Python 3. Preserva o arquivo de entrada e nao executa ORCA.
"""
from pathlib import Path
import argparse
import math


def prepare(source, destination):
    if destination.exists():
        raise ValueError('O destino ja existe; escolha outra pasta ou nome.')
    lines = source.read_text(encoding='utf-8').splitlines()
    atoms = [(row.split()[0], list(map(float, row.split()[1:])))
             for row in lines[2:] if row.strip()]
    if int(lines[0]) != 61 or len(atoms) != 61 or atoms[0][0] != 'Zn':
        raise ValueError('Esperado um XYZ de 61 atomos com Zn no indice zero.')
    if any(len(position) != 3 or not all(math.isfinite(v) for v in position)
           for _, position in atoms):
        raise ValueError('Coordenadas invalidas.')
    origin = atoms[0][1]
    shifted = [('Zn', [0.0, 0.0, 0.0])]
    for start in range(1, 61, 3):
        water = atoms[start:start+3]
        if [element for element, _ in water] != ['O', 'H', 'H']:
            raise ValueError('Esperada a ordem Zn, seguida de vinte grupos O H H.')
        if any(not 0.7 < math.dist(water[0][1], water[i][1]) < 1.25 for i in (1, 2)):
            raise ValueError('Grupo O H H nao corresponde a uma agua intacta.')
        radial = [water[0][1][axis] - origin[axis] for axis in range(3)]
        norm = math.sqrt(sum(v*v for v in radial))
        if norm == 0:
            raise ValueError('Oxigenio sobreposto ao Zn.')
        translation = [0.8*v/norm for v in radial]
        shifted.extend((element, [position[axis]-origin[axis]+translation[axis]
                                 for axis in range(3)]) for element, position in water)
    min_zn_o = min(math.sqrt(sum(v*v for v in pos)) for e,pos in shifted if e == 'O')
    max_radius = max(math.sqrt(sum(v*v for v in pos)) for _,pos in shifted)
    if min_zn_o <= 2.6 or max_radius >= 6.5:
        raise ValueError('Esta montagem exige outra preparacao: ainda tem contato Zn-O '
                         'ou atomo fora de 6,5 A. Use a estrutura fornecida para comparar os ramos.')
    destination.write_text('61\nSOLVATOR + translacao rigida radial de 0.8 A por agua; sem otimizacao\n'
                           + '\n'.join(e+' '+' '.join(f'{v:.12f}' for v in pos)
                                       for e,pos in shifted)+'\n', encoding='utf-8')
    print(f'61 atomos; menor Zn-O {min_zn_o:.6f} A; maior raio {max_radius:.6f} A.')
    print(f'Gravado: {destination}; original preservado: {source}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, default=Path('zn_20h2o_inicial.xyz'))
    args = parser.parse_args()
    prepare(args.source, args.output)
