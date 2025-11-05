import { Types } from '@graphql-codegen/plugin-helpers';
import { FragmentDefinitionNode, visit } from 'graphql';

/**
 * Information about a fragment definition
 */
export interface FragmentDefInfo {
  node: FragmentDefinitionNode;
  filePath: string;
  docIndex: number;
}

/**
 * Map of fragment names to their definitions (for collision detection)
 */
export type CollisionMap = Map<string, FragmentDefInfo[]>;

/**
 * Detects fragment name collisions across documents
 * @param documents - Array of document files to check
 * @returns Map of fragment names to their definitions
 */
export function detectFragmentCollisions(documents: Types.DocumentFile[]): CollisionMap {
  const nameToDefs = new Map<string, FragmentDefInfo[]>();

  documents.forEach((doc, idx) => {
    if (!doc.document) return;
    visit(doc.document, {
      FragmentDefinition(node) {
        const arr = nameToDefs.get(node.name.value) ?? [];
        arr.push({
          node,
          filePath: doc.location || `doc_${idx}.graphql`,
          docIndex: idx,
        });
        nameToDefs.set(node.name.value, arr);
      },
    });
  });

  return nameToDefs;
}

/**
 * Validates fragment collisions and throws error if configured to do so
 * @param collisions - Map of fragment names to their definitions
 * @param onNameCollision - Behavior on collision ('error' or 'rename')
 * @throws Error if collisions found and onNameCollision is 'error'
 */
export function validateCollisions(
  collisions: CollisionMap,
  onNameCollision: 'error' | 'rename'
): void {
  const collisionEntries = Array.from(collisions.entries()).filter(([, defs]) => defs.length > 1);

  if (collisionEntries.length > 0 && onNameCollision === 'error') {
    const lines: string[] = ['Not all fragments have an unique name:'];
    for (const [name, defs] of collisionEntries) {
      lines.push(`  * ${name} found in:`);
      for (const d of defs) lines.push(`      - ${d.filePath}`);
    }
    throw new Error(lines.join('\n'));
  }
}

/**
 * Gets collision entries (fragments with multiple definitions)
 * @param collisions - Map of fragment names to their definitions
 * @returns Array of [name, definitions] tuples for fragments with collisions
 */
export function getCollisionEntries(collisions: CollisionMap): Array<[string, FragmentDefInfo[]]> {
  return Array.from(collisions.entries()).filter(([, defs]) => defs.length > 1);
}
