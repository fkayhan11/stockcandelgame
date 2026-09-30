/**
 * Application Logger & Diagnostic Monitor
 * Handles error tracking, operational telemetry, and runtime diagnostics.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

type ErrorContext = Record<string, unknown>;

class ApplicationLogger {
  private isProduction = process.env.NODE_ENV === "production";

  info(message: string, context?: ErrorContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: ErrorContext): void {
    this.log("warn", message, context);
  }

  error(error: unknown, context?: ErrorContext): void {
    const errorDetails =
      error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : { message: String(error) };

    const payload = {
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "server",
      ...errorDetails,
      ...context,
    };

    console.error("[App Error]", payload);
  }

  private log(level: LogLevel, message: string, context?: ErrorContext): void {
    if (this.isProduction && level === "debug") return;

    const logFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;

    logFn(`[${level.toUpperCase()}] ${message}`, context ?? "");
  }
}

export const logger = new ApplicationLogger();
