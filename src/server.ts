import { app } from "./app";
import { config } from "./config";
import { connectRedis } from "./services/redis";

const startServer = async (): Promise<void> => {
  await connectRedis();

  app.listen(config.port, () => {
    console.log(`URL shortener service listening on port ${config.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
