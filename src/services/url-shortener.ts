import { randomInt } from "crypto";
import { config } from "../config";
import { HttpError } from "../errors";
import { UrlMapping } from "../types";
import { validateShortCode, validateUrl } from "../utils/url";
import { redisClient } from "./redis";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const keyFor = (code: string): string => `short:${code}`;

const serializeMapping = (mapping: UrlMapping): string => JSON.stringify(mapping);

const parseMapping = (value: string | null): UrlMapping | null => {
  if (!value) {
    return null;
  }

  return JSON.parse(value) as UrlMapping;
};

const buildShortUrl = (code: string): string => {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  return `${baseUrl}/${code}`;
};

const generateCode = (): string =>
  Array.from({ length: config.shortCodeLength }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const saveMapping = async (code: string, mapping: UrlMapping, ttlSeconds?: number): Promise<void> => {
  const key = keyFor(code);
  const payload = serializeMapping(mapping);

  if (ttlSeconds && ttlSeconds > 0) {
    await redisClient.set(key, payload, { EX: ttlSeconds });
    return;
  }

  await redisClient.set(key, payload);
};

const resolveRequestedTtl = (requestedTtl?: number): number | undefined => {
  if (requestedTtl === undefined || requestedTtl === null) {
    return config.defaultTtlSeconds > 0 ? config.defaultTtlSeconds : undefined;
  }

  if (!Number.isInteger(requestedTtl) || requestedTtl < 0) {
    throw new HttpError(400, "ttlSeconds must be a non-negative integer.");
  }

  return requestedTtl > 0 ? requestedTtl : undefined;
};

export const createShortUrl = async (input: {
  url: string;
  customCode?: string;
  ttlSeconds?: number;
}): Promise<{
  code: string;
  shortUrl: string;
  originalUrl: string;
  ttlSeconds?: number;
}> => {
  const originalUrl = validateUrl(input.url);
  const requestedCode = input.customCode ? validateShortCode(input.customCode) : undefined;
  const ttlSeconds = resolveRequestedTtl(input.ttlSeconds);

  let code = requestedCode ?? generateCode();

  if (requestedCode) {
    const exists = await redisClient.exists(keyFor(code));
    if (exists) {
      throw new HttpError(409, "That short code is already in use.");
    }
  } else {
    let attempts = 0;
    while (attempts < 5 && (await redisClient.exists(keyFor(code)))) {
      attempts += 1;
      code = generateCode();
    }

    if (await redisClient.exists(keyFor(code))) {
      throw new HttpError(500, "Failed to generate a unique short code.");
    }
  }

  await saveMapping(
    code,
    {
      originalUrl,
      createdAt: new Date().toISOString()
    },
    ttlSeconds
  );

  return {
    code,
    shortUrl: buildShortUrl(code),
    originalUrl,
    ttlSeconds
  };
};

export const getOriginalUrl = async (code: string): Promise<string> => {
  const mapping = parseMapping(await redisClient.get(keyFor(code)));

  if (!mapping) {
    throw new HttpError(404, "Short URL not found.");
  }

  return mapping.originalUrl;
};
