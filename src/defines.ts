import type { PermissionConfigInput } from "./types.js";

/**
 * Helper function to define Permsy configuration with type safety
 * and full IntelliSense support.
 */
export function definePermissionConfig<T extends PermissionConfigInput>(
  config: T
): T {
  return config;
}