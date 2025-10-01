import log from "loglevel";

import clientEnv from "../env/client";

// Set log level based on environment
const logLevel = clientEnv.NEXT_PUBLIC_LOG_LEVEL ?? "info";
log.setLevel(logLevel as log.LogLevelDesc);

export { log };
export default log;
