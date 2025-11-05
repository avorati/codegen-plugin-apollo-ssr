import { Types } from '@graphql-codegen/plugin-helpers';
import { OperationDefinitionNode, OperationTypeNode, print } from 'graphql';
import { CompiledTemplates } from '../templates/loader';
import { FragmentMap, getRequiredFragments } from '../fragments/resolver';

/**
 * Result of processing operations
 */
export interface ProcessedOperations {
  documents: string[];
  operations: string[];
}

/**
 * Gets the type suffix based on operation type
 * @param operationType - Type of operation (query, mutation, subscription)
 * @returns Type suffix string
 */
function getTypeSuffix(operationType: OperationTypeNode): string {
  switch (operationType) {
    case 'query':
      return 'Query';
    case 'mutation':
      return 'Mutation';
    case 'subscription':
      return 'Subscription';
    default:
      return 'Query';
  }
}

/**
 * Processes all operations in documents and generates code
 * @param documents - Transformed document files
 * @param fragmentMap - Map of all available fragments
 * @param templates - Compiled Handlebars templates
 * @returns Processed documents and operations code
 */
export function processOperations(
  documents: Types.DocumentFile[],
  fragmentMap: FragmentMap,
  templates: CompiledTemplates
): ProcessedOperations {
  const customDocuments: string[] = [];
  const operations: string[] = [];

  documents.forEach((doc) => {
    const operationsDefinitions = doc.document?.definitions.filter(
      (def): def is OperationDefinitionNode => def.kind === 'OperationDefinition'
    );

    operationsDefinitions?.forEach((operation) => {
      const operationName = operation.name?.value;
      if (!operationName) {
        // Ignore anonymous operations
        return;
      }

      const operationType = operation.operation;
      const functionTypeName = operationType === 'query' ? 'get' : 'post';
      const functionName = `${functionTypeName}${operationName}`;
      const operationString = print(operation);

      // Collect required fragments for the current operation
      const requiredFragments = new Set<string>();
      getRequiredFragments(operation.selectionSet, fragmentMap, requiredFragments);
      const fragmentsString = Array.from(requiredFragments)
        .map((fragmentName) => print(fragmentMap[fragmentName]))
        .join('\n');

      const fullDocumentString = `${operationString}\n${fragmentsString}`;

      // Use correct suffix based on operation type (Query, Mutation, Subscription)
      const typeSuffix = getTypeSuffix(operationType);
      const resultTypeName = `${operationName}${typeSuffix}`;
      const variablesTypeName = `${operationName}${typeSuffix}Variables`;

      // Generate GraphQL document with document template
      const documentOutput = templates.document({
        operationName,
        documentString: fullDocumentString,
      });
      customDocuments.push(documentOutput);

      // Generate operation function with operation template
      const isQuery = operationType === 'query';
      const operationOutput = templates.operation({
        functionName,
        document: `${operationName}Document`,
        operationName,
        isQuery,
        resultTypeName,
        variablesTypeName,
      });
      operations.push(operationOutput);
    });
  });

  return { documents: customDocuments, operations };
}
