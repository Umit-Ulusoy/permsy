import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadPermissionConfig, _internal } from '../src/core/configLoader';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

vi.mock('node:fs/promises', () => ({
  access: vi.fn(),
  constants: { F_OK: 0 },
}));

describe('loadPermissionConfig tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should throw proper error once a config file not found', async () => {
    vi.mocked(access).mockRejectedValueOnce(new Error('ENOENT'));
    await expect(loadPermissionConfig('laughing-file.ts')).rejects.toThrow(
      /Permission config file not found/
    );
  });

  it('Should throw an error once file doesn\' export permissionConfig', async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    vi.spyOn(_internal, 'dynamicImport').mockResolvedValueOnce({});
    await expect(loadPermissionConfig('laughing-permConfig')).rejects.toThrow(
      /'permissionConfig' \(or default\) export not found/
    );
  });

  it('Should return permissionConfig if file exists and exports the object properly', async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    const mockConfig = {
      defaultDenyMessage: 'Access denied',
      commands: {},
    };
    vi.spyOn(_internal, 'dynamicImport').mockResolvedValueOnce({
      permissionConfig: mockConfig
    });
    const result = await loadPermissionConfig('smiling-config.ts');
    expect(result).toEqual(mockConfig);
  });

  it('Should return config successfully if it is exported as default', async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    const mockConfig = {
      defaultDenyMessage: 'You have no permission to do that',
      commands: {},
    };
    vi.spyOn(_internal, 'dynamicImport').mockResolvedValueOnce({
      default: mockConfig
    });
    const result = await loadPermissionConfig('default-config.ts');
    expect(result).toEqual(mockConfig);
  });

  it('Should throw an error if exported configuration is an array instead of an object', async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    vi.spyOn(_internal, 'dynamicImport').mockResolvedValueOnce({
      permissionConfig: ['invalid-type-array']
    });
    await expect(loadPermissionConfig('array-config.ts')).rejects.toThrow(
      /The exported configuration must be a valid object/
    );
  });

  it('Should throw an error if exported configuration is a string', async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    vi.spyOn(_internal, 'dynamicImport').mockResolvedValueOnce({
      permissionConfig: 'Hello, I am that string'
    });
    await expect(loadPermissionConfig('that-stringy-config.ts')).rejects.toThrow(
      /The exported configuration must be a valid object/
    );
  });

  it('Should throw a wrapped error if dynamicImport throws an unexpected error', async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    vi.spyOn(_internal, 'dynamicImport').mockRejectedValueOnce(new Error('SyntaxError in file'));
    await expect(loadPermissionConfig('broken-file.ts')).rejects.toThrow(
      /Failed to load config file: SyntaxError in file/
    );
  });

  it('Should resolve to the default config path when no configPath is provided', async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    const mockConfig = {
      defaultDenyMessage: 'No permission',
      commands: {},
    };
    const dynamicImportSpy = vi.spyOn(_internal, 'dynamicImport').mockResolvedValueOnce({
      permissionConfig: mockConfig
    });
    const expectedPath = path.resolve(process.cwd(), 'permy.config.ts');
    const expectedUrl = pathToFileURL(expectedPath).href;

    await loadPermissionConfig();

    expect(dynamicImportSpy).toHaveBeenCalledWith(expectedUrl);
  });
});