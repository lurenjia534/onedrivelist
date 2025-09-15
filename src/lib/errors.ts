export class AppError extends Error {
  public readonly status: number;
  public readonly expose: boolean;

  constructor(message: string, status: number, options?: { expose?: boolean; cause?: unknown }) {
    super(message, options);
    this.name = this.constructor.name;
    this.status = status;
    this.expose = options?.expose ?? status < 500;
  }
}

export class AuthError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service failure", options?: { status?: number; cause?: unknown }) {
    super(message, options?.status ?? 502, { cause: options?.cause });
  }
}

export class ConfigurationError extends AppError {
  constructor(message = "Server configuration error") {
    super(message, 500);
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return new Response(error.message, { status: error.status });
  }

  if (error instanceof Error) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }

  return new Response("Internal Server Error", { status: 500 });
}
