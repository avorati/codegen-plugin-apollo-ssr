import { Types } from '@graphql-codegen/plugin-helpers';
import { visit } from 'graphql';
import { RenameMap } from '../fragments/renamer';

/**
 * Transforms documents by applying fragment renames
 * @param documents - Original document files
 * @param renameMap - Map of document indices to their rename mappings
 * @returns Transformed document files with renamed fragments
 */
export function transformDocuments(
  documents: Types.DocumentFile[],
  renameMap: RenameMap
): Types.DocumentFile[] {
  return documents.map((doc, idx) => {
    const rename = renameMap.get(idx);
    if (!doc.document || !rename || rename.size === 0) return doc;

    const localDefs = new Set<string>();
    visit(doc.document, {
      FragmentDefinition(node) {
        if (rename.has(node.name.value)) {
          localDefs.add(node.name.value);
        }
      },
    });

    const newDoc = visit(doc.document, {
      FragmentDefinition(node) {
        const newName = rename.get(node.name.value);
        if (newName) {
          return {
            ...node,
            name: { ...node.name, value: newName },
          };
        }
        return node;
      },
      FragmentSpread(node) {
        if (localDefs.has(node.name.value)) {
          const newName = rename.get(node.name.value);
          if (newName) {
            return { ...node, name: { ...node.name, value: newName } };
          }
        }
        return node;
      },
    });

    return { ...doc, document: newDoc };
  });
}
