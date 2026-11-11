"""Build and validate a source-only Hostinger V5 ZIP; never read private env files."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'deployment-output'
OUTPUT.mkdir(exist_ok=True)
ARCHIVE = OUTPUT / 'techromzit-hostinger-deploy-v5.zip'
ROOT_FILES = [
    'package.json', 'package-lock.json', 'next.config.mjs', 'tsconfig.json',
    'jsconfig.json', 'next-env.d.ts', 'postcss.config.js', 'tailwind.config.js',
    '.eslintrc.json', '.eslintignore', '.env.example', '.nvmrc',
    'vitest.config.ts', 'README.md',
]
DIRECTORIES = ['src', 'public', 'database', 'config', 'scripts']
DOCS = [
    'HOSTINGER_DEPLOYMENT_V5.md', 'institute-course-enquiry-hostinger-activation.md',
    'institute-phase2-deployment.md', 'institute-hostinger-proxy-validation.md',
    'institute-smtp-smoke-test.md', 'institute-release-scope.md',
    'HOSTINGER_DEPLOYMENT.md', 'SOURCE_SYNCHRONIZATION.md',
]
EXCLUDED_PARTS = {'node_modules', '.git', '.next', '__pycache__', 'coverage', '.cache'}
EXCLUDED_SUFFIXES = {'.zip', '.log', '.pem', '.key', '.p12', '.pfx', '.crt', '.cer', '.tsbuildinfo', '.bak', '.tmp', '.pyc'}
PACKAGE_SCRIPTS = {'package-hostinger-v3.py', 'package-hostinger-v4.py', 'package-hostinger-v5.py'}

def allowed(path):
    return (path.name not in PACKAGE_SCRIPTS
            and not any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts)
            and path.suffix.lower() not in EXCLUDED_SUFFIXES
            and (not path.name.startswith('.env') or path.name == '.env.example'))

paths = [ROOT / name for name in ROOT_FILES]
for directory in DIRECTORIES:
    paths.extend(p for p in (ROOT / directory).rglob('*') if p.is_file() and allowed(p))
paths.extend(ROOT / 'docs' / name for name in DOCS)
paths = sorted(set(paths))
assert all(p.is_file() and not p.is_symlink() for p in paths)

# Pattern scan only distributable files; report filenames, never matching values.
secret_patterns = [
    rb'-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----',
    rb'\bAKIA[0-9A-Z]{16}\b', rb'\bgh[pousr]_[A-Za-z0-9]{30,}\b',
    rb'\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b',
    rb'(?:mysql|postgres(?:ql)?):\/\/[^\s:]+:[^\s@]+@',
]
findings = [p.relative_to(ROOT).as_posix() for p in paths
            if any(re.search(pattern, p.read_bytes()) for pattern in secret_patterns)]
if findings:
    raise RuntimeError('Review potential credentials in selected files: ' + ', '.join(findings))

with zipfile.ZipFile(ARCHIVE, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in paths:
        archive.write(path, path.relative_to(ROOT).as_posix())

with zipfile.ZipFile(ARCHIVE) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert 'package.json' in names and 'package-lock.json' in names and '.env.example' in names
    assert 'docs/HOSTINGER_DEPLOYMENT_V5.md' in names
    assert len(names) == len(set(names))
    for directory in ['src/app/', 'src/features/', 'public/', 'database/migrations/']:
        assert any(name.startswith(directory) for name in names), directory
    assert all(not name.startswith('/') and '..' not in Path(name).parts for name in names)
    assert all(allowed(ROOT / name) for name in names)
    for path in paths:
        assert archive.read(path.relative_to(ROOT).as_posix()) == path.read_bytes()
    for directory in ['public', 'database']:
        assert all(p.relative_to(ROOT).as_posix() in names for p in (ROOT / directory).rglob('*') if p.is_file())
    dependencies = json.loads(archive.read('package.json'))['dependencies']
    assert all(name in dependencies for name in ['next', 'react', 'react-dom', 'nodemailer', 'mysql2', 'server-only'])

report = {
    'archive': str(ARCHIVE), 'sizeBytes': ARCHIVE.stat().st_size,
    'sha256': hashlib.sha256(ARCHIVE.read_bytes()).hexdigest(),
    'fileCount': len(paths), 'rootPackageJson': True, 'zipIntegrity': 'passed',
    'allPublicAssetsIncluded': True, 'sourceByteComparison': 'passed',
    'credentialPatternScan': 'passed; selected patterns only, not a formal guarantee',
    'excluded': ['private environment files', 'node_modules', '.next', '.git', 'keys/certificates', 'logs/caches', 'previous ZIPs', 'database backups'],
    'files': names,
}
(OUTPUT / 'archive-inventory-v5.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'files'}, indent=2))
