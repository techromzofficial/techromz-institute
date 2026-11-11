"""Concatenate the canonical Institute migrations; never connects to a database."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / 'database' / 'migrations'
OUTPUT = ROOT / 'deployment-output' / 'techromzit-institute-database-v5.sql'
files = sorted(path for path in MIGRATIONS.glob('[0-9]*.sql') if path.is_file())
expected = [
    '001_institute_core.sql', '002_institute_administration.sql',
    '003_institute_security_remediation.sql', '004_institute_ip_independent_security.sql',
    '005_institute_course_enquiries.sql', '006_institute_enquiry_delivery.sql',
]
if [path.name for path in files] != expected:
    raise SystemExit('Migration set differs from the reviewed 001-006 sequence.')
OUTPUT.parent.mkdir(exist_ok=True)
parts = [
    '-- Generated from the exact repository migrations 001-006.',
    '-- This export does not write institute_schema_migrations tracking rows.',
    '-- Prefer npm run db:migrate:institute to apply and checksum-track the schema.',
    '',
]
for path in files:
    parts.extend([f'-- BEGIN {path.name}', path.read_text(encoding='utf-8').rstrip(), f'-- END {path.name}', ''])
OUTPUT.write_text('\n'.join(parts), encoding='utf-8', newline='\n')
print(f'Wrote {OUTPUT} from {len(files)} canonical migration files.')
