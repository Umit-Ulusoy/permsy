export interface CommandRule {
    rolesOnly?: string | string[] | Record<string, { id: string; name?: string; denyMessage?: string }>;
    permsOnly?: string | string[] | Record<string, { id: string; name?: string; denyMessage?: string }>;
    usersOnly?: string | string[];
    channelsOnly?: string | string[];
    denyMessage?: string;
    [key: string]: any;
}

export interface GroupRule extends CommandRule {
    files?: string | string[] | Record<string, { name: string; denyMessage?: string }>;
}

export interface CommandCategories {
    prefixes?: Record<string, CommandRule>;
    slashes?: Record<string, CommandRule>;
    groups?: Record<string, GroupRule>;
}

export interface PermissionConfig {
    defaultDenyMessage?: string;
    commands?: CommandCategories;
    [key: string]: any;
}

export interface EngineOptions {
    configPath?: string;
}

export interface PermissionResult {
    allowed: boolean;
    reason?: string;
    denyMessage?: string;
}