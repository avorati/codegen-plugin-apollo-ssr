import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { normalizeConfig } from './config/config';
import { compileTemplates } from './templates/loader';
import { detectFragmentCollisions, validateCollisions } from './fragments/collision-detector';
import { createRenameMaps } from './fragments/renamer';
import { transformDocuments } from './transformers/document-transformer';
import { collectFragments } from './fragments/resolver';
import { processOperations } from './operations/processor';

export interface PluginConfig {
  /** Namespace strategy for fragment names when collisions are detected */
  fragmentNamespace?: 'file' | 'folder' | 'none';
  /** Behavior on name collision */
  onNameCollision?: 'rename' | 'error';
  /** Controls how deep the namespace goes when basenames repeat (1 = FileBase, 2 = ParentDir_FileBase) */
  namespaceDepth?: 1 | 2;
}

export const plugin: PluginFunction<PluginConfig> = (
  _schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  _config: PluginConfig
) => {
  // Normalize configuration
  const config = normalizeConfig(_config);

  // Compile templates
  const templates = compileTemplates();

  // Detect fragment collisions
  const collisions = detectFragmentCollisions(documents);

  // Validate collisions (throws error if configured to do so)
  validateCollisions(collisions, config.onNameCollision);

  // Create rename maps for collisions
  const renameMap = createRenameMaps(collisions, config);

  // Transform documents with renamed fragments
  const transformedDocuments = transformDocuments(documents, renameMap);

  // Collect all fragments from transformed documents
  const fragmentMap = collectFragments(transformedDocuments);

  // Process operations and generate code
  const { documents: customDocuments, operations } = processOperations(
    transformedDocuments,
    fragmentMap,
    templates
  );

  // Generate client output
  const clientOutput = templates.client({
    operations: operations.join('\n'),
  });

  // Combine all outputs
  return [...customDocuments, clientOutput].join('\n');
};
