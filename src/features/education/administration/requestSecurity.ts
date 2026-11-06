import 'server-only';

export function isAllowedSensitiveRequest(request: Request, environment: NodeJS.ProcessEnv = process.env): boolean {
  const url = new URL(request.url); const requestHost = request.headers.get('host')?.trim().toLowerCase();
  if (!requestHost || requestHost !== url.host.toLowerCase()) return false;
  const allowed = configuredHosts(environment);
  if (!allowed.has(url.hostname.toLowerCase())) return false;
  if (environment.NODE_ENV === 'production' && url.protocol !== 'https:') return false;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (parsed.host.toLowerCase() !== url.host.toLowerCase() || parsed.protocol !== url.protocol) return false;
  } catch { return false; }
  const fetchSite = request.headers.get('sec-fetch-site');
  return !fetchSite || fetchSite === 'same-origin';
}

function configuredHosts(environment: NodeJS.ProcessEnv): Set<string> {
  const hosts = new Set((environment.INSTITUTE_ALLOWED_HOSTS ?? '').split(',').map((value) => value.trim().toLowerCase()).filter((value) => /^[a-z0-9.-]+$/.test(value)));
  if (environment.NODE_ENV !== 'production') { hosts.add('localhost'); hosts.add('127.0.0.1'); }
  return hosts;
}
