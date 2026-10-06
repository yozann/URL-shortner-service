export interface ShortenUrlRequestBody {
  url?: string;
  customCode?: string;
  ttlSeconds?: number;
}

export interface UrlMapping {
  originalUrl: string;
  createdAt: string;
}
