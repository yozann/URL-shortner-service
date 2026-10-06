import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: parseNumber(process.env.PORT, 3000),
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  shortCodeLength: parseNumber(process.env.SHORT_CODE_LENGTH, 7),
  defaultTtlSeconds: parseNumber(process.env.DEFAULT_TTL_SECONDS, 0)
};
