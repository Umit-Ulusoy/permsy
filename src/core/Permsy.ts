import type { AdapterContext, BaseAdapter, ConfigOptions,
ParsedPermissionConfig, PermissionConfigInput } from "../types.js";
import { PermissionEngine } from "../core/PermissionEngine.js";
import { Parser } from "../core/Parser.js";
import { loadPermissionConfig } from "../core/configLoader.js";
import { validateConfigOptions } from "../core/validators.js";

class Permsy {
private configOptions: ConfigOptions;
private adapter: BaseAdapter;
private ParsedPermissionConfigPromise: Promise<ParsedPermissionConfig>;
private permissionEngine: PermissionEngine;

constructor(configOptions: ConfigOptions) {
validateConfigOptions(configOptions);
this.adapter = configOptions.adapter;
this.configOptions = configOptions;
this.ParsedPermissionConfigPromise = this.loadConfig();
this.permissionEngine = new PermissionEngine();
}

public async isAllowed(context: unknown): Promise<boolean> {
const config = await this.ParsedPermissionConfigPromise;
const resolvedContext: AdapterContext = await this.adapter.resolveContext(context);
const result = this.permissionEngine.check(resolvedContext, config);
if (result.isAllowed) return true;
await this.adapter.sendDenyMessage(context, result.denyMessage);
return false;
}

private async loadConfig(): Promise<ParsedPermissionConfig> {
    const { configDir, fileName } = this.configOptions;

    let resolvedPath: string | undefined;

    if (configDir) {
        const normalizedDir = configDir.endsWith("/") ? configDir : `${configDir}/`;
        resolvedPath = normalizedDir + (fileName ?? "permsy.config.js");
    } else if (fileName) {
        resolvedPath = fileName;
    }

    const rawConfig = await loadPermissionConfig(resolvedPath);
    return Parser.parsePermissionConfig(rawConfig);
}

}

export default Permsy;