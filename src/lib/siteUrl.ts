type SiteUrlEnv = Record<string, string | undefined>;

const LOCAL_SITE_URL = 'http://localhost:4399';

export function getSiteUrl(env: SiteUrlEnv = process.env): URL {
  const configuredUrl = env.NEXT_PUBLIC_SITE_URL
    ?? env.VERCEL_PROJECT_PRODUCTION_URL
    ?? env.VERCEL_URL;

  if (!configuredUrl?.trim()) {
    return new URL(LOCAL_SITE_URL);
  }

  const value = configuredUrl.trim();
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must use http or https');
  }

  if (url.username || url.password) {
    throw new Error('NEXT_PUBLIC_SITE_URL must not contain credentials');
  }

  const isLocalHttp = url.protocol === 'http:'
    && (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]');
  if (url.protocol === 'http:' && !isLocalHttp) {
    throw new Error('NEXT_PUBLIC_SITE_URL must use https outside local development');
  }

  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url;
}
