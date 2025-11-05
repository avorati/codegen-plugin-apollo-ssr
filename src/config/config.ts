import { PluginConfig } from '../plugin';

/**
 * Normalized configuration with all required fields
 */
export type RequiredConfig = Required<
  Pick<PluginConfig, 'fragmentNamespace' | 'onNameCollision' | 'namespaceDepth'>
>;

/**
 * Normalizes plugin configuration with default values
 * @param config - User-provided configuration
 * @returns Normalized configuration with all required fields
 */
export function normalizeConfig(config: PluginConfig): RequiredConfig {
  return {
    fragmentNamespace: config.fragmentNamespace ?? 'file',
    onNameCollision: config.onNameCollision ?? 'rename',
    namespaceDepth: config.namespaceDepth ?? 1,
  };
}
