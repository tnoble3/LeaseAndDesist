import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || "development", tracesSampleRate: 0 });
  console.log("Sentry initialized");
} else {
  console.log("Sentry DSN not configured — skipping Sentry init");
}

export default Sentry;
