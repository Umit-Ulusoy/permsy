import type { ParsedCommandRule,
CommandRuleInput,
ParsedPermissionConfig,
PermissionConfigInput,
ParsedGroupRule,
GroupRuleInput,
CommandCategoriesInput
} from '../types.js';

export class Parser {
    private static readonly VALID_CATEGORIES = ["prefixes", "slashes", "groups"];
    private static readonly VALID_RULES = ["rolesOnly", "usersOnly", "permissionsOnly", "channelsOnly", "denyMessage"];
    private static readonly VALID_GROUP_RULES = ["commands", "rolesOnly", "usersOnly", "permissionsOnly", "channelsOnly", "denyMessage"];

public static parsePermissionConfig(permissionConfig: PermissionConfigInput): ParsedPermissionConfig {
    if (!permissionConfig || typeof permissionConfig !== 'object' || Array.isArray(permissionConfig)) {
        throw new Error("Invalid configuration: Configuration must be an object.");
    }

    if (!permissionConfig.defaultDenyMessage || typeof permissionConfig.defaultDenyMessage !== 'string') {
        throw new Error("Invalid configuration: 'defaultDenyMessage' must be a non-empty string.");
    }

    const parsedConfig: ParsedPermissionConfig = { 
        defaultDenyMessage: permissionConfig.defaultDenyMessage || "", 
        commands: {} 
    };

    if (!permissionConfig.commands) {
        return parsedConfig;
    }

    const commandsInput = permissionConfig.commands as Record<string, any>;
    const parsedCommands = parsedConfig.commands as Record<string, any>;

    for (const category of Object.keys(commandsInput) as Array<keyof CommandCategoriesInput>) {
        if (!this.VALID_CATEGORIES.includes(category)) {
            throw new Error(`Invalid category type: '${category}' must be a valid category.`);
        }

        const categoryData = commandsInput[category];

        if (category === "groups") {
            if (!Array.isArray(categoryData)) {
                throw new Error("Invalid category type: 'groups' must be an array.");
            }
            parsedCommands[category] = categoryData.map((group: GroupRuleInput) => this.parseGroupRules(group));
        } else {
            if (typeof categoryData !== 'object' || categoryData === null || Array.isArray(categoryData)) {
                throw new Error(`Invalid category type: '${category}' must be an object.`);
            }

            parsedCommands[category] = {};
            for (const [commandName, rules] of Object.entries(categoryData as Record<string, CommandRuleInput>)) {
                parsedCommands[category][commandName] = this.parseCommandRules(rules);
            }
        }
    }

    return parsedConfig;
}

public static parseGroupRules(rules: GroupRuleInput): ParsedGroupRule {
    const parsedRules = this.parseRules<ParsedGroupRule>(rules, this.VALID_GROUP_RULES, "group");

    if (!parsedRules.commands || !Array.isArray(parsedRules.commands) || parsedRules.commands.length === 0) {
        throw new Error("Invalid group rule: 'commands' array is required and cannot be empty.");
    }

    return parsedRules;
}

public static parseCommandRules(rules: CommandRuleInput): ParsedCommandRule {
    return this.parseRules<ParsedCommandRule>(rules, this.VALID_RULES, "command");
}

private static parseRules<T extends ParsedCommandRule>(
    rules: CommandRuleInput | GroupRuleInput, 
    validRules: string[], 
    errorPrefix: string
): T {
    if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
        throw new Error(`Invalid ${errorPrefix} rules: Rules must be an object.`);
    }

    const parsedRules: Record<string, any> = {};

    for (const ruleKey of Object.keys(rules)) {
        if (!validRules.includes(ruleKey)) {
            throw new Error(`Unknown ${errorPrefix} rule definition: '${ruleKey}'. Valid rules: ${validRules.join(', ')}`);
        }

        if (ruleKey === "denyMessage") {
            if (typeof rules[ruleKey] !== "string") {
                throw new Error(`Invalid ${errorPrefix} rule: denyMessage must be a string`);
            }
            parsedRules[ruleKey] = rules[ruleKey];
        } else if (ruleKey === "commands") {
            parsedRules[ruleKey] = this.normalizeCommandsValue(rules[ruleKey]);
        } else {
            parsedRules[ruleKey] = this.normalizeRuleValue(rules[ruleKey]);
        }
    }

    return parsedRules as T;
}

    public static normalizeRuleValue(value: string | Array<string | { id: string, name?: string }>): string[] {
        return this.normalizeValue(value, true);
    }

    public static normalizeCommandsValue(value: string | Array<string | { id: string, name?: string }>): string[] {
        return this.normalizeValue(value, false);
    }

    private static normalizeValue(
        value: string | Array<string | { id: string, name?: string }>,
        allowObjects: boolean
    ): string[] {
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
                } else if (allowObjects && item && typeof item === 'object' && 'id' in item && typeof item.id === 'string') {
                    result.push(item.id);
                } else {
                    throw new Error(`Invalid rule value: ${JSON.stringify(item)}. ${allowObjects ? 'Value must be a string or { id: string }.' : 'Only strings are accepted, not objects.'}`);
                }
            }

            return result;
        }

        throw new Error(`Invalid rule type: ${typeof value}. Only string or array are accepted.`);
    }
}