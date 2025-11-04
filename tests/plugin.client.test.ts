import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/plugin';

describe('GraphQL Codegen Apollo SSR Plugin - Client Generation', () => {
  const schema = buildSchema(`
    type User {
      id: ID!
      name: String!
    }

    type Query {
      users: [User!]!
    }
  `);

  describe('Client class generation', () => {
    it('should generate GraphqlCustomClient class', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('export class GraphqlCustomClient');
      expect(result).toContain('ssrMode: true');
      expect(result).toContain("fetchPolicy: 'network-only'");
      expect(result).toContain('getCustomVariables');
    });

    it('should include all operations in client class', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
          }
        }

        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('async getGetUsers');
      expect(result).toContain('async getGetUser');
      expect(result).toContain('export class GraphqlCustomClient');
    });

    it('should generate client with proper imports', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain(
        "import { gql, HttpLink, ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client'"
      );
    });

    it('should generate client constructor with ApolloLink parameter', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('constructor(link: ApolloLink)');
    });

    it('should generate methods with proper typing', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      // Should include async method with optional variables and context
      expect(result).toMatch(/async getGetUsers\(variables\?: .*QueryVariables, context\?: any\)/);
    });
  });
});
