import log from "loglevel";

import { envPublic } from "./env";

// Set log level based on environment
const logLevel = envPublic().NEXT_PUBLIC_LOG_LEVEL ?? "info";
log.setLevel(logLevel as log.LogLevelDesc);

export { log };
export default log;
