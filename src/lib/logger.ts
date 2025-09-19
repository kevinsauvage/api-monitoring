import log from "loglevel";

// Set log level based on environment
const logLevel =
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");
log.setLevel(logLevel as log.LogLevelDesc);

export { log };
export default log;
