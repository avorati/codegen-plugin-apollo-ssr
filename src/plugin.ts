import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import * as fs from 'fs';
import {
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  OperationTypeNode,
  print,
  visit,
} from 'graphql';
import * as Handlebars from 'handlebars';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PluginConfig {
  // Configurações futuras do plugin podem ser adicionadas aqui
}

// Função para carregar templates de forma segura (funciona após build)
function loadTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, 'templates', templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

// Carrega os templates Handlebars
const operationTemplateContent = loadTemplate('operation.hbs');
const documentTemplateContent = loadTemplate('document.hbs');
const clientTemplateContent = loadTemplate('client.hbs');

const operationTemplate = Handlebars.compile(operationTemplateContent);
const documentTemplate = Handlebars.compile(documentTemplateContent);
const clientTemplate = Handlebars.compile(clientTemplateContent);

export const plugin: PluginFunction<PluginConfig> = (
  _schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  _config: PluginConfig
) => {
  // Coleta todos os fragments de todos os documentos
  const fragmentMap: { [name: string]: FragmentDefinitionNode } = {};
  documents.forEach((doc) => {
    if (doc.document) {
      visit(doc.document, {
        FragmentDefinition(node) {
          fragmentMap[node.name.value] = node;
        },
      });
    }
  });

  // Arrays para armazenar os documentos customizados e as operações (funções)
  const customDocuments: string[] = [];
  const operations: string[] = [];

  // Função auxiliar para coletar fragments necessários recursivamente para cada operação
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getRequiredFragments = (selectionSet: any, collected: Set<string>): void => {
    visit(selectionSet, {
      FragmentSpread(node) {
        const fragmentName = node.name.value;
        if (!collected.has(fragmentName) && fragmentMap[fragmentName]) {
          collected.add(fragmentName);
          getRequiredFragments(fragmentMap[fragmentName].selectionSet, collected);
        }
      },
    });
  };

  // Função auxiliar para determinar o sufixo do tipo baseado no tipo de operação
  const getTypeSuffix = (operationType: OperationTypeNode): string => {
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
  };

  // Processa cada operação (query ou mutation) de cada documento
  documents.forEach((doc) => {
    const operationsDefinitions = doc.document?.definitions.filter(
      (def): def is OperationDefinitionNode => def.kind === 'OperationDefinition'
    );

    operationsDefinitions?.forEach((operation) => {
      const operationName = operation.name?.value;
      if (!operationName) {
        // Ignora operações sem nome (anônimas)
        return;
      }

      const operationType = operation.operation;
      const functionTypeName = operationType === 'query' ? 'get' : 'post';
      const functionName = `${functionTypeName}${operationName}`;
      const operationString = print(operation);

      // Coleta os fragments necessários para a operação atual
      const requiredFragments = new Set<string>();
      getRequiredFragments(operation.selectionSet, requiredFragments);
      const fragmentsString = Array.from(requiredFragments)
        .map((fragmentName) => print(fragmentMap[fragmentName]))
        .join('\n');

      const fullDocumentString = `${operationString}\n${fragmentsString}`;

      // CORREÇÃO: usa o sufixo correto baseado no tipo de operação (Query, Mutation, Subscription)
      const typeSuffix = getTypeSuffix(operationType);
      const resultTypeName = `${operationName}${typeSuffix}`;
      const variablesTypeName = `${operationName}${typeSuffix}Variables`;

      // Gera o documento GraphQL com o template de documento
      const documentOutput = documentTemplate({
        operationName,
        documentString: fullDocumentString,
      });
      customDocuments.push(documentOutput);

      // Gera a função da operação com o template de operação
      const isQuery = operationType === 'query';
      const operationOutput = operationTemplate({
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

  // Insere as operações geradas na classe do cliente customizado
  const clientOutput = clientTemplate({
    operations: operations.join('\n'),
  });

  // Junta os imports, os documentos e o cliente customizado em um único output
  return [...customDocuments, clientOutput].join('\n');
};
