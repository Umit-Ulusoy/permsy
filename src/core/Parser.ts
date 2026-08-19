import type { CommandRule, PermissionConfig } from '../types.ts';

export class Parser {
    private static readonly VALID_RULES = ["rolesOnly", "usersOnly", "permissionsOnly", "channelsOnly", "denyMessage"];
    private static readonly VALID_GROUP_RULES = ["commands", "rolesOnly", "usersOnly", "permissionsOnly", "channelsOnly", "denyMessage"];

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