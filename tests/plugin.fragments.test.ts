import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/plugin';

describe('GraphQL Codegen Apollo SSR Plugin - Fragments', () => {
  const schema = buildSchema(`
    type User {
      id: ID!
      name: String!
      email: String!
      bio: String
    }

    type Query {
      users: [User!]!
    }
  `);

  describe('Simple fragments', () => {
    it('should include fragments in generated documents', () => {
      const document = parse(`
        fragment UserFields on User {
          id
          name
          email
        }

        query GetUsers {
          users {
            ...UserFields
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('fragment UserFields');
      expect(result).toContain('GetUsersDocument');
    });
  });

  describe('Nested fragments', () => {
    it('should handle nested fragments recursively', () => {
      const document = parse(`
        fragment UserFields on User {
          id
          name
        }

        fragment UserDetails on User {
          ...UserFields
          email
          bio
        }

        query GetUsers {
          users {
            ...UserDetails
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('fragment UserFields');
      expect(result).toContain('fragment UserDetails');
      expect(result).toContain('...UserFields');
    });

    it('should handle deeply nested fragments', () => {
      const document = parse(`
        fragment UserBasic on User {
          id
        }

        fragment UserContact on User {
          ...UserBasic
          email
        }

        fragment UserFull on User {
          ...UserContact
          name
          bio
        }

        query GetUsers {
          users {
            ...UserFull
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('fragment UserBasic');
      expect(result).toContain('fragment UserContact');
      expect(result).toContain('fragment UserFull');
      expect(result).toContain('...UserBasic');
      expect(result).toContain('...UserContact');
    });
  });

  describe('Fragments across multiple documents', () => {
    it('should collect fragments from multiple document files', () => {
      const document1 = parse(`
        fragment UserFields on User {
          id
          name
        }
      `);

      const document2 = parse(`
        query GetUsers {
          users {
            ...UserFields
          }
        }
      `);

      const result = plugin(
        schema,
        [
          { document: document1, location: 'fragments.graphql' },
          { document: document2, location: 'queries.graphql' },
        ],
        {}
      );

      expect(result).toContain('fragment UserFields');
      expect(result).toContain('GetUsersDocument');
    });
  });
});
