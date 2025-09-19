import type { ServiceFactory, ServiceIdentifier } from "@/lib/shared/types";

export class DIContainer {
  private static instance: DIContainer;
  readonly services = new Map<ServiceIdentifier, ServiceFactory>();
  readonly singletons = new Map<ServiceIdentifier, unknown>();

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(identifier: ServiceIdentifier, factory: ServiceFactory<T>): void {
    this.services.set(identifier, factory);
  }

  registerSingleton<T>(
    identifier: ServiceIdentifier,
    factory: ServiceFactory<T>
  ): void {
    this.services.set(identifier, factory);
    this.singletons.set(identifier, null);
  }

  resolve<T>(identifier: ServiceIdentifier): T {
    const factory = this.services.get(identifier);

    if (!factory) {
      throw new Error(
        `Service with identifier '${String(identifier)}' not found`
      );
    }

    if (this.singletons.has(identifier)) {
      let instance = this.singletons.get(identifier) as T;
      if (!instance) {
        instance = factory() as T;
        this.singletons.set(identifier, instance as unknown);
      }
      return instance;
    }

    return factory() as T;
  }

  has(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier);
  }

  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}

export const container = DIContainer.getInstance();
