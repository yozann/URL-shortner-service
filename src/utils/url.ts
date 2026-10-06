import { HttpError } from "../errors";

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

export const validateUrl = (value: string): string => {
  try {
    const parsed = new URL(value);

    if (!HTTP_PROTOCOLS.has(parsed.protocol)) {
      throw new HttpError(400, "Only HTTP and HTTPS URLs are supported.");
    }

    return parsed.toString();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(400, "A valid URL is required.");
  }
};

export const validateShortCode = (value: string): string => {
  const normalized = value.trim();

  if (!/^[a-zA-Z0-9_-]{4,32}$/.test(normalized)) {
    throw new HttpError(
      400,
      "Custom codes must be 4-32 characters and only use letters, numbers, underscores, or hyphens."
    );
  }

  return normalized;
};
