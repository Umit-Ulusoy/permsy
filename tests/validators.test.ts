import { describe, it, expect } from 'vitest';
import { validateContext, validateConfigOptions } from '../src/core/validators.ts';
import type { AdapterContext, ConfigOptions } from '../src/types.ts';

describe('validateContext', () => {
  const validContext: AdapterContext = {
    type: 'slash',
    userId: 'user_123',
commandName: "ban",
    channelId: 'channel_456',
    roles: ['role_789'],
    permissions: ['send_messages'],
  };

  it('should not throw an error when a valid context is provided', () => {
    expect(() => validateContext(validContext)).not.toThrow();
  });

  describe('Context object structure validation', () => {
    it('should throw an error if context is null', () => {
      expect(() => validateContext(null as any)).toThrow(
        '[Permsy] Invalid context: AdapterContext must be a non-null object.'
      );
    });

    it('should throw an error if context is undefined', () => {
      expect(() => validateContext(undefined as any)).toThrow(
        '[Permsy] Invalid context: AdapterContext must be a non-null object.'
      );
    });

    it('should throw an error if context is an array instead of an object', () => {
      expect(() => validateContext([] as any)).toThrow(
        '[Permsy] Invalid context: AdapterContext must be a non-null object.'
      );
    });
  });

  describe('type field validation', () => {
    it('should allow execution when type is "slash"', () => {
      const validSlash = { ...validContext, type: 'slash' as const };
      expect(() => validateContext(validSlash)).not.toThrow();
    });

    it('should allow execution when type is "prefix"', () => {
      const validPrefix = { ...validContext, type: 'prefix' as const };
      expect(() => validateContext(validPrefix)).not.toThrow();
    });

  it('should throw an error if type is undefined', () => {
    const invalid = { ...validContext, type: undefined };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.type must be a non-null string.'
    );
  });

  it('should throw an error if type is null', () => {
    const invalid = { ...validContext, type: null };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.type must be a non-null string.'
    );
  });

  it('should throw an error if type is a number', () => {
    const invalid = { ...validContext, type: 123 };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.type must be a non-null string.'
    );
  });

  it('should throw an error if type is an empty string', () => {
    const invalid = { ...validContext, type: '' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.type must be a non-null string.'
    );
  });

  it('should throw an error if type is only whitespace', () => {
    const invalid = { ...validContext, type: '   ' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.type must be a non-null string.'
    );
  });

  it('should throw an error if type is a boolean', () => {
    const invalid = { ...validContext, type: true };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.type must be a non-null string.'
    );
  });

    it('should throw an error if type is any other unsupported string value (e.g. "interaction")', () => {
      const invalid = { ...validContext, type: 'interaction' };
      expect(() => validateContext(invalid as any)).toThrow(
        "[Permsy] Invalid context: AdapterContext.type must be either 'slash' or 'prefix'."
      );
    });
  });

describe('userId field validation', () => {
  it('should throw an error if userId is undefined', () => {
    const invalid = { ...validContext, userId: undefined };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.userId must be a non-null string.'
    );
  });

  it('should throw an error if userId is null', () => {
    const invalid = { ...validContext, userId: null };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.userId must be a non-null string.'
    );
  });

  it('should throw an error if userId is a number', () => {
    const invalid = { ...validContext, userId: 12345 };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.userId must be a non-null string.'
    );
  });

  it('should throw an error if userId is a boolean', () => {
    const invalid = { ...validContext, userId: true };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.userId must be a non-null string.'
    );
  });

  it('should throw an error if userId is an empty string', () => {
    const invalid = { ...validContext, userId: '' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.userId must be a non-null string.'
    );
  });

  it('should throw an error if userId is whitespace only', () => {
    const invalid = { ...validContext, userId: '   ' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.userId must be a non-null string.'
    );
  });

  it('should throw an error if userId is an array', () => {
    const invalid = { ...validContext, userId: [] };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.userId must be a non-null string.'
    );
  });
});

describe('commandName field validation', () => {
  it('should throw an error if commandName is undefined', () => {
    const invalid = { ...validContext, commandName: undefined };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.'
    );
  });

  it('should throw an error if commandName is null', () => {
    const invalid = { ...validContext, commandName: null };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.'
    );
  });

  it('should throw an error if commandName is a number', () => {
    const invalid = { ...validContext, commandName: 12345 };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.'
    );
  });

  it('should throw an error if commandName is a boolean', () => {
    const invalid = { ...validContext, commandName: true };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.'
    );
  });

  it('should throw an error if commandName is an empty string', () => {
    const invalid = { ...validContext, commandName: '' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.'
    );
  });

  it('should throw an error if commandName is whitespace only', () => {
    const invalid = { ...validContext, commandName: '   ' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.'
    );
  });

  it('should throw an error if commandName is an array', () => {
    const invalid = { ...validContext, commandName: [] };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.commandName must be a non-null string.'
    );
  });
});

describe('channelId field validation', () => {
  it('should throw an error if channelId is undefined', () => {
    const invalid = { ...validContext, channelId: undefined };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.'
    );
  });

  it('should throw an error if channelId is null', () => {
    const invalid = { ...validContext, channelId: null };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.'
    );
  });

  it('should throw an error if channelId is a number', () => {
    const invalid = { ...validContext, channelId: 12345 };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.'
    );
  });

  it('should throw an error if channelId is a boolean', () => {
    const invalid = { ...validContext, channelId: true };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.'
    );
  });

  it('should throw an error if channelId is an empty string', () => {
    const invalid = { ...validContext, channelId: '' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.'
    );
  });

  it('should throw an error if channelId is whitespace only', () => {
    const invalid = { ...validContext, channelId: '   ' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.'
    );
  });

  it('should throw an error if channelId is an array', () => {
    const invalid = { ...validContext, channelId: [] };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.channelId must be a non-null string.'
    );
  });
});

  describe('roles field validation', () => {
  it('should throw an error if roles is undefined', () => {
    const invalid = { ...validContext, roles: undefined };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.roles must be a non-null array.'
    );
  });

  it('should throw an error if roles is null', () => {
    const invalid = { ...validContext, roles: null };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.roles must be a non-null array.'
    );
  });

  it('should throw an error if roles is a string instead of an array', () => {
    const invalid = { ...validContext, roles: 'role_1' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.roles must be a non-null array.'
    );
  });

  it('should throw an error if roles is a number instead of an array', () => {
    const invalid = { ...validContext, roles: 12345 };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.roles must be a non-null array.'
    );
  });

  it('should throw an error if roles is a boolean instead of an array', () => {
    const invalid = { ...validContext, roles: true };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.roles must be a non-null array.'
    );
  });

  it('should throw an error if roles is an object instead of an array', () => {
    const invalid = { ...validContext, roles: { id: 'role_1' } };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.roles must be a non-null array.'
    );
  });

it('should throw an error if roles contains non-string elements', () => {
  const invalid = { ...validContext, roles: [123, 'valid_role'] };
  expect(() => validateContext(invalid as any)).toThrow(
    '[Permsy] Invalid context: AdapterContext.roles must be an array of strings.'
  );
});
});

describe('permissions field validation', () => {
  it('should throw an error if permissions is undefined', () => {
    const invalid = { ...validContext, permissions: undefined };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.permissions must be a non-null array.'
    );
  });

  it('should throw an error if permissions is null', () => {
    const invalid = { ...validContext, permissions: null };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.permissions must be a non-null array.'
    );
  });

  it('should throw an error if permissions is a string instead of an array', () => {
    const invalid = { ...validContext, permissions: 'READ' };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.permissions must be a non-null array.'
    );
  });

  it('should throw an error if permissions is a number instead of an array', () => {
    const invalid = { ...validContext, permissions: 42 };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.permissions must be a non-null array.'
    );
  });

  it('should throw an error if permissions is a boolean instead of an array', () => {
    const invalid = { ...validContext, permissions: true };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.permissions must be a non-null array.'
    );
  });

  it('should throw an error if permissions is an object instead of an array', () => {
    const invalid = { ...validContext, permissions: { id: 'READ' } };
    expect(() => validateContext(invalid as any)).toThrow(
      '[Permsy] Invalid context: AdapterContext.permissions must be a non-null array.'
    );
  });
});

it('should throw an error if permissions contains non-string elements', () => {
  const invalid = { ...validContext, permissions: [123, 'send_messages'] };
  expect(() => validateContext(invalid as any)).toThrow(
    '[Permsy] Invalid context: AdapterContext.permissions must be an array of strings.'
  );
});
});

describe('validateConfigOptions', () => {
  const validConfigOptions: ConfigOptions = {
    adapter: {
      resolveContext: async () => ({} as any),
      sendDenyMessage: async () => {},
    },
    configDir: './configs',
    fileName: 'permsy.config.ts',
  };

  it('should not throw an error when valid config options are provided', () => {
    expect(() => validateConfigOptions(validConfigOptions)).not.toThrow();
  });

  describe('Config object structure validation', () => {
    it('should throw an error if configOptions is null', () => {
      expect(() => validateConfigOptions(null as any)).toThrow(
        '[Permsy] Invalid config: Config must be a non-null object.'
      );
    });

    it('should throw an error if configOptions is undefined', () => {
      expect(() => validateConfigOptions(undefined as any)).toThrow(
        '[Permsy] Invalid config: Config must be a non-null object.'
      );
    });

    it('should throw an error if configOptions is an array instead of an object', () => {
      expect(() => validateConfigOptions([] as any)).toThrow(
        '[Permsy] Invalid config: Config must be a non-null object.'
      );
    });
  });

  describe('adapter field validation', () => {
    it('should throw an error if adapter is missing', () => {
      const invalid = { ...validConfigOptions, adapter: undefined };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.adapter must be a non-null object.'
      );
    });

    it('should throw an error if adapter is null', () => {
      const invalid = { ...validConfigOptions, adapter: null };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.adapter must be a non-null object.'
      );
    });

    it('should throw an error if adapter is an array instead of an object', () => {
      const invalid = { ...validConfigOptions, adapter: [] };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.adapter must be a non-null object.'
      );
    });
  });

  describe('configDir field validation', () => {
    it('should throw an error if configDir is missing', () => {
      const invalid = { ...validConfigOptions, configDir: undefined };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.configDir must be a non-null string.'
      );
    });

    it('should throw an error if configDir is not a string', () => {
      const invalid = { ...validConfigOptions, configDir: 123 };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.configDir must be a non-null string.'
      );
    });

    it('should throw an error if configDir is an empty string or whitespace', () => {
      const invalid = { ...validConfigOptions, configDir: '   ' };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.configDir must be a non-null string.'
      );
    });
  });

  describe('fileName field validation', () => {
    it('should throw an error if fileName is missing', () => {
      const invalid = { ...validConfigOptions, fileName: undefined };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.fileName must be a non-null string.'
      );
    });

    it('should throw an error if fileName is not a string', () => {
      const invalid = { ...validConfigOptions, fileName: true };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.fileName must be a non-null string.'
      );
    });

    it('should throw an error if fileName is whitespace only', () => {
      const invalid = { ...validConfigOptions, fileName: '' };
      expect(() => validateConfigOptions(invalid as any)).toThrow(
        '[Permsy] Invalid config: config.fileName must be a non-null string.'
      );
    });
  });
});