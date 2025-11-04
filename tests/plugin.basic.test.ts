import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/plugin';

describe('GraphQL Codegen Apollo SSR Plugin - Basic Operations', () => {
  const schema = buildSchema(`
    type User {
      id: ID!
      name: String!
      email: String!
      bio: String
    }

    type Query {
      users: [User!]!
      user(id: ID!): User
    }

    type Mutation {
      createUser(name: String!, email: String!): User!
    }

    type Subscription {
      userUpdated: User!
    }
  `);

  describe('Query operations', () => {
    it('should generate correct query document and function', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
            name
            email
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('export const GetUsersDocument = gql');
      expect(result).toContain('async getGetUsers');
      expect(result).toContain('GetUsersQuery');
      expect(result).toContain('GetUsersQueryVariables');
      expect(result).not.toContain('GetUsersMutation');
    });

    it('should generate query with variables', () => {
      const document = parse(`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('GetUserQuery');
      expect(result).toContain('GetUserQueryVariables');
    });
  });

  describe('Mutation operations', () => {
    it('should generate correct mutation document and function with Mutation suffix', () => {
      const document = parse(`
        mutation CreateUser($name: String!, $email: String!) {
          createUser(name: $name, email: $email) {
            id
            name
            email
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('export const CreateUserDocument = gql');
      expect(result).toContain('async postCreateUser');
      expect(result).toContain('CreateUserMutation');
      expect(result).toContain('CreateUserMutationVariables');
      expect(result).not.toContain('CreateUserQuery');
    });
  });

  describe('Subscription operations', () => {
    it('should generate correct subscription document with Subscription suffix', () => {
      const document = parse(`
        subscription UserUpdated {
          userUpdated {
            id
            name
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('export const UserUpdatedDocument = gql');
      expect(result).toContain('async postUserUpdated');
      expect(result).toContain('UserUpdatedSubscription');
      expect(result).toContain('UserUpdatedSubscriptionVariables');
    });
  });

  describe('Multiple operations', () => {
    it('should generate multiple operations correctly', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
            name
          }
        }

        mutation CreateUser($name: String!, $email: String!) {
          createUser(name: $name, email: $email) {
            id
            name
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('getGetUsers');
      expect(result).toContain('GetUsersQuery');
      expect(result).toContain('postCreateUser');
      expect(result).toContain('CreateUserMutation');
    });
  });

  describe('Anonymous operations', () => {
    it('should skip anonymous operations', () => {
      const document = parse(`
        {
          users {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      // Should not generate any function for anonymous operations
      expect(result).not.toMatch(/async (get|post)\w+\(/);
    });
  });

  describe('Function naming', () => {
    it('should use "get" prefix for queries', () => {
      const document = parse(`
        query GetUsers {
          users {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('async getGetUsers');
    });

    it('should use "post" prefix for mutations', () => {
      const document = parse(`
        mutation CreateUser {
          createUser(name: "Test", email: "test@test.com") {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('async postCreateUser');
    });

    it('should use "post" prefix for subscriptions', () => {
      const document = parse(`
        subscription UserUpdated {
          userUpdated {
            id
          }
        }
      `);

      const result = plugin(schema, [{ document, location: 'test.graphql' }], {});

      expect(result).toContain('async postUserUpdated');
    });
  });
});
