import * as path from 'path';

/**
 * Converts a string to PascalCase
 * @param value - String to convert
 * @returns PascalCase string
 */
export function toPascalCase(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

/**
 * Sanitizes a string to be a valid GraphQL name
 * Keeps only letters, numbers, and underscores
 * @param value - String to sanitize
 * @returns Sanitized GraphQL name
 */
export function sanitizeGraphqlName(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, '');
}

/**
 * Gets the base name of a file in PascalCase
 * @param filePath - File path
 * @returns PascalCase base name
 */
export function fileBase(filePath: string): string {
  return toPascalCase(path.parse(filePath).name);
}

/**
 * Gets parent directory and file base name in PascalCase format
 * @param filePath - File path
 * @returns PascalCase string in format "ParentDir_FileName"
 */
export function parentAndFileBase(filePath: string): string {
  const { dir } = path.parse(filePath);
  const parent = path.basename(dir);
  return `${toPascalCase(parent)}_${fileBase(filePath)}`;
}
