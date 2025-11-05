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

export interface PluginConfig {
  /** Namespace strategy for fragment names when collisions are detected */
  fragmentNamespace?: 'file' | 'folder' | 'none';
  /** Behavior on name collision */
  onNameCollision?: 'rename' | 'error';
  /** Controls how deep the namespace goes when basenames repeat (1 = FileBase, 2 = ParentDir_FileBase) */
  namespaceDepth?: 1 | 2;
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
  const config: Required<
    Pick<PluginConfig, 'fragmentNamespace' | 'onNameCollision' | 'namespaceDepth'>
  > = {
    fragmentNamespace: _config.fragmentNamespace ?? 'file',
    onNameCollision: _config.onNameCollision ?? 'rename',
    namespaceDepth: _config.namespaceDepth ?? 1,
  };

  // Utilitários de nomeação/namespace
  const toPascalCase = (value: string): string => {
    return value
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('');
  };

  const sanitizeGraphqlName = (value: string): string => {
    // Mantém letras, números e underscore; remove demais caracteres
    return value.replace(/[^A-Za-z0-9_]/g, '');
  };

  const fileBase = (filePath: string): string => toPascalCase(path.parse(filePath).name);
  const parentAndFileBase = (filePath: string): string => {
    const { dir } = path.parse(filePath);
    const parent = path.basename(dir);
    return `${toPascalCase(parent)}_${fileBase(filePath)}`;
  };

  // 1) Detecta colisões de fragmentos entre arquivos e cria mapeamentos de renomeação
  type FragmentDefInfo = { node: FragmentDefinitionNode; filePath: string; docIndex: number };
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

  const collisions = Array.from(nameToDefs.entries()).filter(([, defs]) => defs.length > 1);

  if (collisions.length > 0 && config.onNameCollision === 'error') {
    const lines: string[] = ['Not all fragments have an unique name:'];
    for (const [name, defs] of collisions) {
      lines.push(`  * ${name} found in:`);
      for (const d of defs) lines.push(`      - ${d.filePath}`);
    }
    throw new Error(lines.join('\n'));
  }

  // Mapa: docIndex -> (oldName -> newName)
  const perDocRenameMap: Map<number, Map<string, string>> = new Map();

  if (
    collisions.length > 0 &&
    config.onNameCollision === 'rename' &&
    config.fragmentNamespace !== 'none'
  ) {
    const occupiedNames = new Set<string>();

    // Começa ocupados com nomes existentes (sem renomear) para evitar colisões futuras
    for (const [name] of nameToDefs) occupiedNames.add(name);

    for (const [origName, defs] of collisions) {
      // Estratégia: nome baseado em arquivo (ou pasta+arquivo) + _ + origName
      // Resolve empates entre basenames iguais
      const proposedNames = defs.map((d) => {
        const base =
          config.namespaceDepth === 2 || config.fragmentNamespace === 'folder'
            ? parentAndFileBase(d.filePath)
            : fileBase(d.filePath);
        return `${base}_${origName}`;
      });

      // Garante unicidade global com sufixo incremental estável se necessário
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
  }

  // 2) Aplica renomeação no AST por arquivo (definitions e spreads que referenciam o fragment local)
  const transformedDocuments: Types.DocumentFile[] = documents.map((doc, idx) => {
    const renameMap = perDocRenameMap.get(idx);
    if (!doc.document || !renameMap || renameMap.size === 0) return doc;

    const localDefs = new Set<string>();
    visit(doc.document, {
      FragmentDefinition(node) {
        if (renameMap.has(node.name.value)) localDefs.add(node.name.value);
      },
    });

    const newDoc = visit(doc.document, {
      FragmentDefinition(node) {
        const newName = renameMap.get(node.name.value);
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
          const newName = renameMap.get(node.name.value);
          if (newName) {
            return { ...node, name: { ...node.name, value: newName } };
          }
        }
        return node;
      },
    });

    return { ...doc, document: newDoc };
  });

  // Recoleta fragments a partir dos documentos transformados
  // Coleta todos os fragments de todos os documentos
  const fragmentMap: { [name: string]: FragmentDefinitionNode } = {};
  transformedDocuments.forEach((doc) => {
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
  transformedDocuments.forEach((doc) => {
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
