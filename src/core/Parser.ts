import type { CommandRule, PermissionConfig } from '../types.ts';

export class Parser {
    private static readonly VALID_CATEGORIES = ["prefixes", "slashes", "groups"];
    private static readonly VALID_RULES = ["rolesOnly", "usersOnly", "permissionsOnly", "channelsOnly", "denyMessage"];
    private static readonly VALID_GROUP_RULES = ["commands", "rolesOnly", "usersOnly", "permissionsOnly", "channelsOnly", "denyMessage"];

    public static parsePermissionConfig(permissionConfig: PermissionConfig): PermissionConfig {
        if (!permissionConfig || typeof permissionConfig !== 'object' || Array.isArray(permissionConfig)) {
            throw new Error("Invalid configuration: Configuration must be an object.");
        }

                if (!permissionConfig.defaultDenyMessage || typeof permissionConfig.defaultDenyMessage !== 'string') {
            throw new Error("Invalid configuration: 'defaultDenyMessage' must be a non-empty string.");
        }

        const parsedConfig: PermissionConfig = { 
            defaultDenyMessage: permissionConfig.defaultDenyMessage || "", 
            commands: {} 
        };

        if (!permissionConfig.commands) {
            return parsedConfig;
        }

        for (const category of Object.keys(permissionConfig.commands)) {
            if (!this.VALID_CATEGORIES.includes(category)) {
                throw new Error(`Invalid category type: '${category}' must be a valid category.`);
            }

            const categoryData = permissionConfig.commands[category];

            if (category === "groups") {
                if (!Array.isArray(categoryData)) {
                    throw new Error("Invalid category type: 'groups' must be an array.");
                }
                parsedConfig.commands[category] = categoryData.map(group => this.parseGroupRules(group));
            } else {
                if (typeof categoryData !== 'object' || categoryData === null || Array.isArray(categoryData)) {
                    throw new Error(`Invalid category type: '${category}' must be an object.`);
                }

                parsedConfig.commands[category] = {};
                for (const [commandName, rules] of Object.entries(categoryData)) {
                    parsedConfig.commands[category][commandName] = this.parseCommandRules(rules);
                }
            }
        }

        return parsedConfig;
    }

public static parseGroupRules(rules: CommandRule): CommandRule {
    return this.parseRules(rules, this.VALID_GROUP_RULES, "group");
}

public static parseCommandRules(rules: CommandRule): CommandRule {
    return this.parseRules(rules, this.VALID_RULES, "command");
}

private static parseRules(rules: CommandRule, validRules: string[], errorPrefix: string): CommandRule {
    if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
        throw new Error(`Invalid ${errorPrefix} rules: Rules must be an object.`);
    }

    const parsedRules: CommandRule = {};

    for (const ruleKey of Object.keys(rules)) {
        if (!validRules.includes(ruleKey)) {
            throw new Error(`Unknown ${errorPrefix} rule definition: '${ruleKey}'. Valid rules: ${validRules.join(', ')}`);
        }

        if (ruleKey === "denyMessage") {
            if (typeof rules[ruleKey] !== "string") {
                throw new Error(`Invalid ${errorPrefix} rule: denyMessage must be a string`);
            }
            parsedRules[ruleKey] = rules[ruleKey];
        } else {
            parsedRules[ruleKey] = this.normalizeRuleValue(rules[ruleKey]);
        }
    }

    return parsedRules;
}

    public static normalizeRuleValue(value: string | Array<string | { id: string, name?: string }>): string[] {
        if (value === undefined || value === null) {
            return [];
        }

        if (typeof value === 'string') {
            return value
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        }

        if (Array.isArray(value)) {
            const result: string[] = [];

            for (const item of value) {
                if (typeof item === 'string' && item.trim().length > 0) {
                    result.push(item.trim());
                } else if (item && typeof item === 'object' && 'id' in item && typeof item.id === 'string') {
                    result.push(item.id);
                } else {
                    throw new Error(`Invalid rule value: ${JSON.stringify(item)}. Value must be a string or { id: string }.`);
                }
            }

            return result;
        }

        throw new Error(`Invalid rule type: ${typeof value}. Only string or array are accepted.`);
    }
}