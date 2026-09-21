import { access, constants } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import type { PermissionConfigInput } from '../types.js';

export const _internal = {
  async dynamicImport(fileUrl: string) {
    return await import(fileUrl);
  }
};

export async function loadPermissionConfig(configPath?: string): Promise<PermissionConfigInput> {
  const targetPath = configPath 
    ? path.resolve(configPath) 
    : path.resolve(process.cwd(), 'permy.config.ts');

  try {
    await access(targetPath, constants.F_OK);
  } catch {
    throw new Error(`Config Loader-> Permission config file not found at: ${targetPath}`);
  }

  try {
    const fileUrl = pathToFileURL(targetPath).href;
    const importedModule = await _internal.dynamicImport(fileUrl);
    
    const config = importedModule.permissionConfig || importedModule.default;

    if (!config) {
      throw new Error("Config Loader-> 'permissionConfig' (or default) export not found in the config file!");
    }

    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      throw new Error("Config Loader-> The exported configuration must be a valid object.");
    }

    return config;
  } catch (error: any) {
    if (error.message.includes("Config Loader->")) {
      throw error;
    }
    throw new Error(`Config Loader-> Failed to load config file: ${error.message}`);
  }
}