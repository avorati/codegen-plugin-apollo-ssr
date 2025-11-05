import { RequiredConfig } from '../config/config';
import { FragmentDefInfo, getCollisionEntries } from './collision-detector';
import { fileBase, parentAndFileBase, sanitizeGraphqlName } from '../utils/naming';

/**
 * Rename map: docIndex -> (oldName -> newName)
 */
export type RenameMap = Map<number, Map<string, string>>;

/**
 * Creates rename maps for fragments with collisions
 * @param collisions - Map of fragment names to their definitions
 * @param config - Normalized plugin configuration
 * @returns Map of document indices to their rename mappings
 */
export function createRenameMaps(
  collisions: Map<string, FragmentDefInfo[]>,
  config: RequiredConfig
): RenameMap {
  const perDocRenameMap: RenameMap = new Map();
  const collisionEntries = getCollisionEntries(collisions);

  if (
    collisionEntries.length === 0 ||
    config.onNameCollision !== 'rename' ||
    config.fragmentNamespace === 'none'
  ) {
    return perDocRenameMap;
  }

  const occupiedNames = new Set<string>();

  // Start with existing names (without renaming) to avoid future collisions
  for (const [name] of collisions) {
    occupiedNames.add(name);
  }

  for (const [origName, defs] of collisionEntries) {
    // Strategy: file-based name (or folder+file) + _ + origName
    // Resolves ties between equal basenames
    const proposedNames = defs.map((d) => {
      const base =
        config.namespaceDepth === 2 || config.fragmentNamespace === 'folder'
          ? parentAndFileBase(d.filePath)
          : fileBase(d.filePath);
      return `${base}_${origName}`;
    });

    // Ensures global uniqueness with stable incremental suffix if needed
    const finalNames: string[] = [];
    const seen = new Map<string, number>();
    proposedNames.forEach((n) => {
      let candidate = sanitizeGraphqlName(n);
      const initial = candidate;
      let seq = seen.get(initial) ?? 0;
      while (occupiedNames.has(candidate)) {
        seq += 1;
        candidate = `${initial}${seq}`;
      }
      seen.set(initial, seq);
      occupiedNames.add(candidate);
      finalNames.push(candidate);
    });

    defs.forEach((d, i) => {
      const m = perDocRenameMap.get(d.docIndex) ?? new Map<string, string>();
      m.set(origName, finalNames[i]);
      perDocRenameMap.set(d.docIndex, m);
    });
  }

  return perDocRenameMap;
}
