import * as Sentry from "@sentry/browser";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
  console.log("Frontend Sentry initialized");
} else {
  console.log("Frontend Sentry disabled (no VITE_SENTRY_DSN)");
}

export default Sentry;
