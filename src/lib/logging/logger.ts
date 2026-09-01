export type LogLevel = "debug" | "info" | "warn" | "error";

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "apikey",
  "api_key",
  "accesskeyid",
  "secretaccesskey",
  "authorization",
  "cookie",
  "creditcard",
  "ssn",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function redact(value: unknown): unknown {
  if (isObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (REDACTED_KEYS.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redact(val);
      }
    }
    return result;
  }
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  return value;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const safeMeta = meta ? (redact(meta) as Record<string, unknown>) : undefined;
  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(safeMeta ?? {}),
  };

  if (process.env.NODE_ENV === "development") {
    // Readable format for local development.
    const metaString = safeMeta ? ` ${JSON.stringify(entry, null, 2)}` : "";
    console[level](`[${entry.timestamp}] ${level.toUpperCase()}: ${message}${metaString}`);
  } else {
    console[level](JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
