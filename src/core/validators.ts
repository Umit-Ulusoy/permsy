import type { AdapterContext, ConfigOptions } from "../types.js";

export function validateContext(context: AdapterContext): void {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    throw new Error("[Permsy] Invalid context: AdapterContext must be a non-null object.");
  }

  if (!context.type || typeof context.type !== "string" || context.type.trim() === "") {
    throw new Error("[Permsy] Invalid context: AdapterContext.type must be a non-null string.");
  }

  if (context.type !== "slash" && context.type !== "prefix") {
    throw new Error("[Permsy] Invalid context: AdapterContext.type must be either 'slash' or 'prefix'.");
  }

  if (!context.userId || typeof context.userId !== "string" || context.userId.trim() === "") {
    throw new Error("[Permsy] Invalid context: AdapterContext.userId must be a non-null string.");
  }

if (!context.commandName || typeof context.commandName !== "string" || context.commandName.trim() === "") {
  throw new Error("[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.");
}

  if (!context.channelId || typeof context.channelId !== "string" || context.channelId.trim() === "") {
    throw new Error("[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.");
  }

  if (!context.roles || !Array.isArray(context.roles)) {
    throw new Error("[Permsy] Invalid context: AdapterContext.roles must be a non-null array.");
  }

  if (!context.roles.every((role) => typeof role === "string")) {
    throw new Error("[Permsy] Invalid context: AdapterContext.roles must be an array of strings.");
  }

  if (!context.permissions || !Array.isArray(context.permissions)) {
    throw new Error("[Permsy] Invalid context: AdapterContext.permissions must be a non-null array.");
  }

  if (!context.permissions.every((permission) => typeof permission === "string")) {
    throw new Error("[Permsy] Invalid context: AdapterContext.permissions must be an array of strings.");
  }
}

export function validateConfigOptions(configOptions: ConfigOptions): void {

    if (!configOptions || typeof configOptions !== "object" || Array.isArray(configOptions)) {
        throw new Error("[Permsy] Invalid config: Config must be a non-null object.");
    }

  if (!configOptions.adapter || typeof configOptions.adapter !== "object" || Array.isArray(configOptions.adapter)) {
    throw new Error("[Permsy] Invalid config: config.adapter must be a non-null object.");
  }

if (!configOptions.configDir || typeof configOptions.configDir !== "string" || configOptions.configDir.trim() === "") {
    throw new Error("[Permsy] Invalid config: config.configDir must be a non-null string.");
}

if (!configOptions.fileName || typeof configOptions.fileName !== "string" || configOptions.fileName.trim() === "") {
    throw new Error("[Permsy] Invalid config: config.fileName must be a non-null string.");
}

}