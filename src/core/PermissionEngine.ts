import type { AdapterContext,
ParsedGroupRule,
ParsedCommandRule,
EngineResult,
ParsedPermissionConfig
} from "../types.js";

export class PermissionEngine {

public check(context: AdapterContext, config: ParsedPermissionConfig): EngineResult {
        const commandName = context.commandName;
        const commandType = context.type;

        const matchedGroup: ParsedGroupRule | undefined = config.commands.groups?.find(group => 
            group.commands && Array.isArray(group.commands) && group.commands.includes(commandName)
        );
        
        let specificRule: ParsedCommandRule | undefined = undefined;
        if (commandType === 'slash') {
            specificRule = config.commands.slashes?.[commandName];
        } else if (commandType === 'prefix') {
            specificRule = config.commands.prefixes?.[commandName];
        }

        const mergedRules = {
            ...(matchedGroup || {}),
            ...(specificRule || {})
        };

        if (Object.keys(mergedRules).length === 0) {
            return { isAllowed: true };
        }

        const isAllowed = this.evaluateRules(context, mergedRules);        

        if (isAllowed) {
            return { isAllowed: true };
        }

        const activeDenyMessage = 
            mergedRules.denyMessage || 
            config.defaultDenyMessage || 
            "You don't have a permission to use this command.";

        return { 
            isAllowed: false, 
            denyMessage: activeDenyMessage 
        };
    }

private evaluateRules(context: AdapterContext, rules: ParsedCommandRule): boolean {
    if (rules.channelsOnly) {
        if (!context.channelId || !rules.channelsOnly.includes(context.channelId)) {
            return false;
        }
    }

    const identityResult: Record<string, boolean> = {};

    if (rules.usersOnly && context.userId) {
        identityResult.usersOnly = rules.usersOnly.includes(context.userId);
    }

    if (rules.rolesOnly && context.roles) {
        identityResult.rolesOnly = rules.rolesOnly.some(r => context.roles.includes(r));
    }

    if (rules.permissionsOnly && context.permissions) {
        identityResult.permissionsOnly = rules.permissionsOnly.some(p => context.permissions.includes(p));
    }

    const identityValues = Object.values(identityResult);

    if (identityValues.length === 0) return true;

    return identityValues.some(Boolean);
}
}