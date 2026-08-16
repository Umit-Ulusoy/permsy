import type { PermissionConfig } from '../types.ts';

export class Parser {

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