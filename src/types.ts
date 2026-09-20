
export interface ParsedCommandRule {
    rolesOnly?: string[];
    permissionsOnly?: string[];
    usersOnly?: string[];
    channelsOnly?: string[];
    denyMessage?: string;
    [key: string]: any;
}

export interface ParsedGroupRule extends ParsedCommandRule {
    commands: string[];
}

export interface ParsedCommandCategories {
    prefixes?: Record<string, ParsedCommandRule>;
    slashes?: Record<string, ParsedCommandRule>;
    groups?: ParsedGroupRule[];
}

export interface ParsedPermissionConfig {
    defaultDenyMessage: string;
    commands: ParsedCommandCategories;
    [key: string]: any;
}

export interface ConfigOptions {
    configDir?: string;
fileName?: string;
adapter: BaseAdapter;
}

export type EngineResult =
    | { isAllowed: true }
    | { isAllowed: false; denyMessage: string };

export interface BaseAdapter {
  resolveContext(context: unknown): Promise<AdapterContext>;
  sendDenyMessage(context: unknown, denyMessage: string): Promise<void>;
}

export interface AdapterContext {
  type: "prefix" | "slash";
  commandName: string;
  channelId: string;
  userId: string;
  roles: string[];
  permissions: string[];
}


export interface CommandRuleInput {
    rolesOnly?: string | string[] | Record<string, { id: string; name?: string; denyMessage?: string }>;
    permissionsOnly?: string | string[] | Record<string, { id: string; name?: string; denyMessage?: string }>;
    usersOnly?: string | string[];
    channelsOnly?: string | string[];
    denyMessage?: string;
    [key: string]: any;
}

export interface GroupRuleInput extends CommandRuleInput {
    commands: string[];
}

export interface CommandCategoriesInput {
    prefixes?: Record<string, CommandRuleInput>;
    slashes?: Record<string, CommandRuleInput>;
    groups?: GroupRuleInput[];
}

export interface PermissionConfigInput {
    defaultDenyMessage: string;
    commands: CommandCategoriesInput;
    [key: string]: any;
}
