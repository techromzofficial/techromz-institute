"""Package a validated source candidate without secrets or previous release artifacts."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'deployment-output'
VERSION = 'v6'
ARCHIVE = OUTPUT / f'techromzit-hostinger-deploy-{VERSION}.zip'
validation = json.loads((OUTPUT / f'validation-report-{VERSION}.json').read_text(encoding='utf-8'))
if validation.get('repositoryValidation') != 'PASS':
    raise RuntimeError('Repository validation must pass before packaging. Staging approval remains separate.')
if ARCHIVE.exists():
    raise FileExistsError('Release archive already exists; select an unused version. Never overwrite it.')
ROOT_FILES = ['package.json', 'package-lock.json', 'next.config.mjs', 'tsconfig.json', 'jsconfig.json',
              'next-env.d.ts', 'postcss.config.js', 'tailwind.config.js', '.eslintrc.json', '.eslintignore',
              '.env.example', '.nvmrc', 'vitest.config.ts', 'README.md']
EXCLUDED_PARTS = {'node_modules', '.git', '.next', '__pycache__', 'coverage', '.cache', 'backups', 'backup'}
EXCLUDED_SUFFIXES = {'.zip', '.log', '.pem', '.key', '.p12', '.pfx', '.crt', '.cer', '.tsbuildinfo', '.bak', '.tmp', '.pyc'}

def allowed(path):
    parts = path.relative_to(ROOT).parts
    return (not any(part.lower() in EXCLUDED_PARTS for part in parts)
            and path.name not in {'package-hostinger-v3.py', 'package-hostinger-v4.py', 'package-hostinger-v5.py', 'export-institute-schema-v5.py'}
            and path.suffix.lower() not in EXCLUDED_SUFFIXES
            and (not path.name.startswith('.env') or path.name == '.env.example')
            and (path.suffix.lower() != '.sql' or parts[:2] == ('database', 'migrations'))
            and '.private.' not in path.name
            and not path.is_symlink())

paths = [ROOT / name for name in ROOT_FILES]
for directory in ['src', 'public', 'database', 'config', 'scripts', 'docs']:
    paths.extend(p for p in (ROOT / directory).rglob('*') if p.is_file() and allowed(p))
paths = sorted(set(paths))
assert all(p.is_file() and allowed(p) for p in paths)
patterns = [rb'-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----', rb'\bAKIA[0-9A-Z]{16}\b',
            rb'\bgh[pousr]_[A-Za-z0-9]{30,}\b', rb'\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b',
            rb'(?:mysql|postgres(?:ql)?):\/\/[^\s:]+:[^\s@]+@']
findings = [p.relative_to(ROOT).as_posix() for p in paths if any(re.search(pattern, p.read_bytes()) for pattern in patterns)]
if findings:
    raise RuntimeError('Potential credential patterns require review in files: ' + ', '.join(findings))
with zipfile.ZipFile(ARCHIVE, 'x', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in paths:
        archive.write(path, path.relative_to(ROOT).as_posix())
with zipfile.ZipFile(ARCHIVE) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert len(names) == len(set(names))
    for p in paths:
        assert archive.read(p.relative_to(ROOT).as_posix()) == p.read_bytes()
    assert all(not name.startswith('/') and '..' not in Path(name).parts and allowed(ROOT / name) for name in names)
    for required in ['package.json', 'package-lock.json', '.env.example', 'database/migrations/006_institute_enquiry_delivery.sql']:
        assert required in names
report = {'archive': ARCHIVE.name, 'sha256': hashlib.sha256(ARCHIVE.read_bytes()).hexdigest(),
          'bytes': ARCHIVE.stat().st_size, 'fileCount': len(paths), 'zipIntegrity': 'PASS',
          'sourceByteComparison': 'PASS', 'credentialPatternScan': 'PASS (selected patterns only)',
          'productionApproved': False, 'files': names}
with (OUTPUT / f'archive-inventory-{VERSION}.json').open('x', encoding='utf-8') as handle:
    json.dump(report, handle, indent=2)
(OUTPUT / f'techromzit-hostinger-deploy-{VERSION}.sha256').write_text(f"{report['sha256']}  {ARCHIVE.name}\n", encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'files'}, indent=2))
