"""Incorpora dados locais no HTML; nenhuma dependencia de rede."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
references = root
data_path = root / 'dados-opcoes-md.json'
data = json.loads(data_path.read_text(encoding='utf-8'))
data['template'] = (references / 'MD_COMENTADO.inp').read_text(encoding='utf-8')
active = [line for line in data['template'].splitlines()
          if line.strip() and not line.lstrip().startswith('#')
          and line.strip() not in ('%md', 'end')]
assert len(active) == 8, 'Nucleo ativo inesperado'
data['basic'] = '%md\n' + '\n'.join(active) + '\nend\n'
expected = {'Thermostat', 'Metadynamics', 'Timestep', 'Cell', 'Minimize', 'Initvel', 'PrintLevel', 'SCFLog', 'Randomize', 'Dump', 'Restraint', 'Restart', 'Constraint', 'Screendump', 'Manage_Colvar', 'Run', 'Manage_Region'}
assert expected == {command['label'] for command in data['commands']}
ids = set()
for command in data['commands']:
    assert command['id'] not in ids
    ids.add(command['id'])
    assert command['description'] and command['example'].startswith('%md\n')
    option_ids = set()
    for option in command['options']:
        assert option['id'] not in option_ids
        option_ids.add(option['id'])
        assert option['description'] and option['example'].startswith('%md\n')
template = (root / 'guia-md.template.html').read_text(encoding='utf-8')
assert template.count('__MD_GUIDE_DATA__') == 1
payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
html = template.replace('__MD_GUIDE_DATA__', payload)
(root / 'index.html').write_text(html, encoding='utf-8')
data_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'commands': len(data['commands']),
                  'options': sum(len(c['options']) for c in data['commands']),
                  'standalone_html': str(root / 'index.html')}, ensure_ascii=False))
