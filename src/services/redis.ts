import { createClient } from "redis";
import { config } from "../config";

export const redisClient = createClient({
  url: config.redisUrl
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
