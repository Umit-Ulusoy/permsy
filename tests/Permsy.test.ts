import { describe, it, expect, vi, beforeEach } from 'vitest';
import Permsy from '../src/core/Permsy.ts';
import { loadPermissionConfig } from '../src/core/configLoader.ts';
import type { PermissionConfig } from '../src/types.ts';

vi.mock('../src/core/configLoader.ts', () => ({
    loadPermissionConfig: vi.fn()
}));

vi.mock('../src/core/Parser.ts', () => ({
    Parser: {
        parsePermissionConfig: vi.fn((raw) => raw)
    }
}));

describe('Permsy facade integration tests', () => {
    const sampleConfig: PermissionConfig = {
        defaultDenyMessage: 'Default denial message.',
        commands: {
            slashes: {
                muteUser: {
                    rolesOnly: ['moderator-role'],
                    denyMessage: 'Custom slash denial message.'
                }
            },
            prefixes: {
                lockChannel: {
                    channelsOnly: ['mod-channel']
                }
            },
            groups: [
                {
                    commands: ['banUser', 'kickUser'],
                    rolesOnly: ['admin-role'],
                    denyMessage: 'Custom group denial message.'
                }
            ]
        }
    };

    const createAdapter = (resolvedContext: unknown) => ({
        resolveContext: vi.fn().mockResolvedValue(resolvedContext),
        sendDenyMessage: vi.fn().mockResolvedValue(undefined)
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(loadPermissionConfig).mockResolvedValue(sampleConfig);
    });

    describe('Config loading behaviour', () => {
        it('Should load the config only once and reuse it across multiple calls', async () => {
            const adapter = createAdapter({
                commandName: 'muteUser',
                type: 'slash',
                roles: ['moderator-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            await permsy.isAllowed({});
            await permsy.isAllowed({});
            await permsy.isAllowed({});

            expect(loadPermissionConfig).toHaveBeenCalledTimes(1);
        });

        it('Should append a trailing slash to configDir when it is missing', async () => {
            const adapter = createAdapter({
                commandName: 'muteUser',
                type: 'slash',
                roles: ['moderator-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            await permsy.isAllowed({});

            expect(loadPermissionConfig).toHaveBeenCalledWith('/config/permissions.ts');
        });

        it('Should keep the path intact when configDir already ends with a slash', async () => {
            const adapter = createAdapter({
                commandName: 'muteUser',
                type: 'slash',
                roles: ['moderator-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config/',
                fileName: 'permissions.ts'
            });

            await permsy.isAllowed({});

            expect(loadPermissionConfig).toHaveBeenCalledWith('/config/permissions.ts');
        });

        it('Should propagate the error when config loading fails', async () => {
            vi.mocked(loadPermissionConfig).mockRejectedValue(new Error('Config file could not be read'));

            const adapter = createAdapter({
                commandName: 'muteUser',
                type: 'slash',
                roles: ['moderator-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            await expect(permsy.isAllowed({})).rejects.toThrow('Config file could not be read');
            expect(adapter.sendDenyMessage).not.toHaveBeenCalled();
        });
    });

    describe('Allowed flow', () => {
        it('Should return true and skip sendDenyMessage when the command is allowed', async () => {
            const adapter = createAdapter({
                commandName: 'muteUser',
                type: 'slash',
                roles: ['moderator-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            const result = await permsy.isAllowed({});

            expect(result).toBe(true);
            expect(adapter.sendDenyMessage).not.toHaveBeenCalled();
        });

        it('Should return true when no rule is defined for the command', async () => {
            const adapter = createAdapter({
                commandName: 'unknownCommand',
                type: 'slash',
                roles: ['member-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            const result = await permsy.isAllowed({});

            expect(result).toBe(true);
            expect(adapter.sendDenyMessage).not.toHaveBeenCalled();
        });

        it('Should resolve the context through the adapter exactly once per call', async () => {
            const adapter = createAdapter({
                commandName: 'muteUser',
                type: 'slash',
                roles: ['moderator-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            const rawContext = { interactionId: 'raw-interaction' };
            await permsy.isAllowed(rawContext);

            expect(adapter.resolveContext).toHaveBeenCalledTimes(1);
            expect(adapter.resolveContext).toHaveBeenCalledWith(rawContext);
        });
    });

    describe('Denied flow', () => {
        it('Should return false and send the rule specific denyMessage', async () => {
            const adapter = createAdapter({
                commandName: 'muteUser',
                type: 'slash',
                roles: ['member-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            const rawContext = { interactionId: 'raw-interaction' };
            const result = await permsy.isAllowed(rawContext);

            expect(result).toBe(false);
            expect(adapter.sendDenyMessage).toHaveBeenCalledTimes(1);
            expect(adapter.sendDenyMessage).toHaveBeenCalledWith(
                rawContext,
                'Custom slash denial message.'
            );
        });

        it('Should send the group denyMessage when a grouped command is denied', async () => {
            const adapter = createAdapter({
                commandName: 'banUser',
                type: 'slash',
                roles: ['member-role']
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            const rawContext = { interactionId: 'raw-interaction' };
            await permsy.isAllowed(rawContext);

            expect(adapter.sendDenyMessage).toHaveBeenCalledWith(
                rawContext,
                'Custom group denial message.'
            );
        });

        it('Should fallback to defaultDenyMessage when the rule has no custom message', async () => {
            const adapter = createAdapter({
                commandName: 'lockChannel',
                type: 'prefix',
                channelId: 'general-channel'
            });

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            const rawContext = { messageId: 'raw-message' };
            await permsy.isAllowed(rawContext);

            expect(adapter.sendDenyMessage).toHaveBeenCalledWith(
                rawContext,
                'Default denial message.'
            );
        });

        it('Should pass the raw context to sendDenyMessage instead of the resolved one', async () => {
            const resolvedContext = {
                commandName: 'muteUser',
                type: 'slash',
                roles: ['member-role']
            };
            const adapter = createAdapter(resolvedContext);

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            const rawContext = { interactionId: 'raw-interaction' };
            await permsy.isAllowed(rawContext);

            const [passedContext] = adapter.sendDenyMessage.mock.calls[0];
            expect(passedContext).toBe(rawContext);
            expect(passedContext).not.toBe(resolvedContext);
        });
    });

    describe('Adapter error propagation', () => {
        it('Should propagate the error when resolveContext throws', async () => {
            const adapter = {
                resolveContext: vi.fn().mockRejectedValue(new Error('Context could not be resolved')),
                sendDenyMessage: vi.fn().mockResolvedValue(undefined)
            };

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            await expect(permsy.isAllowed({})).rejects.toThrow('Context could not be resolved');
            expect(adapter.sendDenyMessage).not.toHaveBeenCalled();
        });

        it('Should propagate the error when sendDenyMessage throws', async () => {
            const adapter = {
                resolveContext: vi.fn().mockResolvedValue({
                    commandName: 'muteUser',
                    type: 'slash',
                    roles: ['member-role']
                }),
                sendDenyMessage: vi.fn().mockRejectedValue(
                    new Error('Discord API error: cannot send message to channel')
                )
            };

            const permsy = new Permsy({
                adapter: adapter as any,
                configDir: '/config',
                fileName: 'permissions.ts'
            });

            await expect(permsy.isAllowed({})).rejects.toThrow(
                'Discord API error: cannot send message to channel'
            );
        });
    });
});