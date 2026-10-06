import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "./errors";
import { createShortUrl, getOriginalUrl } from "./services/url-shortener";
import { ShortenUrlRequestBody } from "./types";

export const app = express();

app.use(express.json());

app.get("/health", (_request: Request, response: Response) => {
  response.json({ status: "ok" });
});

app.post(
  "/api/urls",
  async (
    request: Request<Record<string, never>, Record<string, unknown>, ShortenUrlRequestBody>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { url, customCode, ttlSeconds } = request.body;

      if (!url) {
        throw new HttpError(400, "url is required.");
      }

      const created = await createShortUrl({
        url,
        customCode,
        ttlSeconds
      });

      response.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }
);

app.get("/:code", async (request: Request<{ code: string }>, response: Response, next: NextFunction) => {
  try {
    const originalUrl = await getOriginalUrl(request.params.code);
    response.redirect(302, originalUrl);
  } catch (error) {
    next(error);
  }
});

app.use((_request: Request, _response: Response, next: NextFunction) => {
  next(new HttpError(404, "Route not found."));
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error("Unhandled error:", error);
  response.status(500).json({ message: "Internal server error." });
});
