import { describe, it, expect } from 'vitest';
import { PermissionEngine } from '../src/core/PermissionEngine.ts';
import type { AdapterContext, PermissionConfig } from '../src/types.ts';

describe('PermissionEngine comprehensive tests', () => {
    const permissionEngine = new PermissionEngine();

    const sampleConfig: PermissionConfig = {
        defaultDenyMessage: 'Default denial message.',
        commands: {
            slashes: {
                muteUser: {
                    rolesOnly: ['moderator-role'],
                    channelsOnly: ['mod-log-channel']
                },
                warnUser: {
                    rolesOnly: ['trusted-role']
                },
                purgeMessages: {
                    rolesOnly: ['admin-role'],
                    denyMessage: 'Custom slash denial message.'
                }
            },
            prefixes: {
                setNickname: {
                    rolesOnly: ['admin-role']
                },
                timeoutUser: {
                    channelsOnly: ['mod-channel']
                },
                lockChannel: {
                    channelsOnly: ['mod-channel'],
                    denyMessage: 'Custom prefix denial message.'
                }
            },
            groups: [
                {
                    commands: ['banUser', 'kickUser'],
                    channelsOnly: ['mod-channel'],
                    usersOnly: ['server-owner'],
                    permissionsOnly: ['BAN_MEMBERS'],
                    rolesOnly: ['admin-role'],
                    denyMessage: 'Custom group denial message.'
                }
            ]
        }
    };

    describe('Group level evaluation tests', () => {
        it('Should allow execution when channel matches and at least one identity rule matches', () => {
            const context: AdapterContext = {
                commandName: 'banUser',
                type: 'slash',
                channelId: 'mod-channel',
                userId: 'random-member',
                roles: ['member-role'],
                permissions: ['BAN_MEMBERS']
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should deny execution when channel fails even if identity criteria would match', () => {
            const context: AdapterContext = {
                commandName: 'banUser',
                type: 'slash',
                channelId: 'general-channel',
                userId: 'server-owner',
                roles: ['member-role'],
                permissions: ['SEND_MESSAGES']
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Custom group denial message.'
            });
        });

        it('Should deny execution with custom denyMessage when all group rules fail', () => {
            const context: AdapterContext = {
                commandName: 'banUser',
                type: 'slash',
                channelId: 'general-channel',
                userId: 'random-member',
                roles: ['member-role'],
                permissions: ['SEND_MESSAGES']
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Custom group denial message.'
            });
        });

        it('Should fallback to defaultDenyMessage when all group rules fail and no custom message exists', () => {
            const configWithoutCustomMessage: PermissionConfig = {
                ...sampleConfig,
                commands: {
                    ...sampleConfig.commands,
                    groups: [{
                        commands: ['banUser'],
                        rolesOnly: ['admin-role']
                    }]
                }
            };

            const context: AdapterContext = {
                commandName: 'banUser',
                type: 'slash',
                roles: ['member-role']
            };

            const result = permissionEngine.check(context, configWithoutCustomMessage);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Default denial message.'
            });
        });
    });

    describe('Slash level evaluation tests', () => {
        it('Should allow execution when slash rule matches successfully', () => {
            const context: AdapterContext = {
                commandName: 'warnUser',
                type: 'slash',
                roles: ['trusted-role']
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should deny execution with defaultDenyMessage when slash rule fails', () => {
            const context: AdapterContext = {
                commandName: 'warnUser',
                type: 'slash',
                roles: ['member-role']
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Default denial message.'
            });
        });

        it('Should deny execution with custom denyMessage when slash rule fails', () => {
            const context: AdapterContext = {
                commandName: 'purgeMessages',
                type: 'slash',
                roles: ['member-role']
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Custom slash denial message.'
            });
        });
    });

    describe('Prefix level evaluation tests', () => {
        it('Should allow execution when prefix rule matches successfully', () => {
            const context: AdapterContext = {
                commandName: 'timeoutUser',
                type: 'prefix',
                channelId: 'mod-channel'
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should deny execution with defaultDenyMessage when prefix rule fails', () => {
            const context: AdapterContext = {
                commandName: 'timeoutUser',
                type: 'prefix',
                channelId: 'general-channel'
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Default denial message.'
            });
        });

        it('Should deny execution with custom denyMessage when prefix rule fails', () => {
            const context: AdapterContext = {
                commandName: 'lockChannel',
                type: 'prefix',
                channelId: 'general-channel'
            };

            const result = permissionEngine.check(context, sampleConfig);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Custom prefix denial message.'
            });
        });
    });

    describe('Isolated rule parameter validations', () => {
        it('Should allow execution when channelsOnly is the only rule and matches', () => {
            const config: PermissionConfig = {
                defaultDenyMessage: 'Access denied.',
                commands: {
                    slashes: {
                        muteUser: {
                            channelsOnly: ['mod-channel']
                        }
                    }
                }
            };

            const context: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                channelId: 'mod-channel'
            };

            const result = permissionEngine.check(context, config);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should deny execution when channelsOnly is the only rule and fails', () => {
            const config: PermissionConfig = {
                defaultDenyMessage: 'Access denied.',
                commands: {
                    slashes: {
                        muteUser: {
                            channelsOnly: ['mod-channel']
                        }
                    }
                }
            };

            const context: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                channelId: 'general-channel'
            };

            const result = permissionEngine.check(context, config);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Access denied.'
            });
        });

        it('Should allow execution when only usersOnly matches and no channel restriction exists', () => {
            const config: PermissionConfig = {
                defaultDenyMessage: 'Access denied.',
                commands: {
                    slashes: {
                        muteUser: {
                            usersOnly: ['server-owner']
                        }
                    }
                }
            };

            const context: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                userId: 'server-owner'
            };

            const result = permissionEngine.check(context, config);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should allow execution when only rolesOnly matches and no channel restriction exists', () => {
            const config: PermissionConfig = {
                defaultDenyMessage: 'Access denied.',
                commands: {
                    slashes: {
                        muteUser: {
                            rolesOnly: ['moderator-role']
                        }
                    }
                }
            };

            const context: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                roles: ['moderator-role']
            };

            const result = permissionEngine.check(context, config);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should allow execution when only permissionsOnly matches and no channel restriction exists', () => {
            const config: PermissionConfig = {
                defaultDenyMessage: 'Access denied.',
                commands: {
                    slashes: {
                        muteUser: {
                            permissionsOnly: ['MANAGE_MESSAGES']
                        }
                    }
                }
            };

            const context: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                permissions: ['MANAGE_MESSAGES']
            };

            const result = permissionEngine.check(context, config);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should deny execution when channel matches but none of the defined identity rules match', () => {
            const config: PermissionConfig = {
                defaultDenyMessage: 'Access denied.',
                commands: {
                    slashes: {
                        muteUser: {
                            channelsOnly: ['mod-channel'],
                            usersOnly: ['server-owner'],
                            rolesOnly: ['moderator-role'],
                            permissionsOnly: ['MANAGE_MESSAGES']
                        }
                    }
                }
            };

            const context: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                channelId: 'mod-channel',
                userId: 'random-member',
                roles: ['member-role'],
                permissions: ['SEND_MESSAGES']
            };

            const result = permissionEngine.check(context, config);
            expect(result).toEqual({
                isAllowed: false,
                denyMessage: 'Access denied.'
            });
        });

        it('Should allow execution when channel matches and at least one of several identity rules matches', () => {
            const config: PermissionConfig = {
                defaultDenyMessage: 'Access denied.',
                commands: {
                    slashes: {
                        muteUser: {
                            channelsOnly: ['mod-channel'],
                            usersOnly: ['server-owner'],
                            rolesOnly: ['moderator-role'],
                            permissionsOnly: ['MANAGE_MESSAGES']
                        }
                    }
                }
            };

            const context: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                channelId: 'mod-channel',
                userId: 'random-member',
                roles: ['moderator-role'],
                permissions: ['SEND_MESSAGES']
            };

            const result = permissionEngine.check(context, config);
            expect(result).toEqual({ isAllowed: true });
        });
    });

    describe('Command conflicts and resolution tests', () => {
        it('Should overwrite group rules with specific command rules when keys conflict', () => {
            const conflictContext: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                channelId: 'mod-log-channel',
                roles: ['moderator-role']
            };

            const result = permissionEngine.check(conflictContext, sampleConfig);
            expect(result).toEqual({ isAllowed: true });
        });

        it('Should deny execution when specific command overrides group but channel requirement is not met', () => {
            const conflictContext: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                channelId: 'general-channel',
                roles: ['moderator-role']
            };

            const result = permissionEngine.check(conflictContext, sampleConfig);
            expect(result.isAllowed).toBe(false);
        });

        it('Should extend rules when specific command adds new criteria alongside group rules', () => {
            const extendContext: AdapterContext = {
                commandName: 'muteUser',
                type: 'slash',
                channelId: 'mod-log-channel'
            };

            const result = permissionEngine.check(extendContext, sampleConfig);
            expect(result).toEqual({ isAllowed: true });
        });
    });
});