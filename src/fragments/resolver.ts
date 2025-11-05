import { Types } from '@graphql-codegen/plugin-helpers';
import { FragmentDefinitionNode, visit } from 'graphql';

/**
 * Map of fragment names to their definitions
 */
export type FragmentMap = { [name: string]: FragmentDefinitionNode };

/**
 * Collects all fragments from transformed documents
 * @param documents - Transformed document files
 * @returns Map of fragment names to their definitions
 */
export function collectFragments(documents: Types.DocumentFile[]): FragmentMap {
  const fragmentMap: FragmentMap = {};

  documents.forEach((doc) => {
    if (doc.document) {
      visit(doc.document, {
        FragmentDefinition(node) {
          fragmentMap[node.name.value] = node;
        },
      });
    }
  });

  return fragmentMap;
}

/**
 * Recursively collects required fragments for a selection set
 * @param selectionSet - GraphQL selection set
 * @param fragmentMap - Map of all available fragments
 * @param collected - Set to store collected fragment names
 */
export function getRequiredFragments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectionSet: any,
  fragmentMap: FragmentMap,
  collected: Set<string>
): void {
  visit(selectionSet, {
    FragmentSpread(node) {
      const fragmentName = node.name.value;
      if (!collected.has(fragmentName) && fragmentMap[fragmentName]) {
        collected.add(fragmentName);
        getRequiredFragments(fragmentMap[fragmentName].selectionSet, fragmentMap, collected);
      }
    },
  });
}
