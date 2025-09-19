/**
 * Initialize the dependency injection container
 * This should be called once when the application starts
 */

import { registerAllServices } from "./service-registry";

let isInitialized = false;

/**
 * Initialize the DI container with all services
 * This is safe to call multiple times
 */
export function initializeDI(): void {
  if (isInitialized) {
    return;
  }

  registerAllServices();
  isInitialized = true;
}

/**
 * Check if DI container is initialized
 */
export function isDIInitialized(): boolean {
  return isInitialized;
}
