import { environment } from '../../environments/environment';

export function toProxied(url: string) {
  if (!url) return url;
  if (url.startsWith('data:')) return url;
  const prefix = `${environment.API_BASE}/api/cards/images/proxy?url=`;
  if (url.startsWith(prefix)) return url;
  return `${prefix}${encodeURIComponent(url)}`;
}

export function getLocalBleedImageUrl(originalUrl: string): string {
  return toProxied(originalUrl);
}
