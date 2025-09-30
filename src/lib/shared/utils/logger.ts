import log from "loglevel";

import { envPrivate } from "./env";

// Set log level based on environment
const logLevel =
  envPrivate().LOG_LEVEL ??
  (envPrivate().NODE_ENV === "production" ? "info" : "debug");
log.setLevel(logLevel as log.LogLevelDesc);

export { log };
export default log;
