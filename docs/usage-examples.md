# Usage Examples

This document provides practical examples of using the generated client in Next.js 14+.

## Server Components

Use the client directly in Server Components:

```typescript
// app/users/page.tsx
import { createApolloClient } from '@/lib/apollo-client';

export default async function UsersPage() {
  const client = createApolloClient();
  
  const { data, loading, error } = await client.getUsers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data?.users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Server Actions

Use mutations in Server Actions:

```typescript
// app/actions/user-actions.ts
'use server';

import { createApolloClient } from '@/lib/apollo-client';

export async function createUser(name: string, email: string) {
  const client = createApolloClient();
  
  const { data, error } = await client.postCreateUser({
    name,
    email,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
```

## With Variables

Pass variables to queries and mutations:

```typescript
// app/users/[id]/page.tsx
import { createApolloClient } from '@/lib/apollo-client';

export default async function UserPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const client = createApolloClient();
  
  const { data } = await client.getUser({
    id: params.id,
  });

  return (
    <div>
      <h1>{data?.user?.name}</h1>
      <p>{data?.user?.email}</p>
    </div>
  );
}
```

## Error Handling

Handle errors properly:

```typescript
import { createApolloClient } from '@/lib/apollo-client';
import { ApolloError } from '@apollo/client';

export default async function DataPage() {
  const client = createApolloClient();
  
  try {
    const { data, error } = await client.getData();
    
    if (error) {
      console.error('GraphQL Error:', error);
      return <div>Error loading data</div>;
    }

    return <div>{/* Render data */}</div>;
  } catch (error) {
    if (error instanceof ApolloError) {
      console.error('Apollo Error:', error);
    }
    return <div>Something went wrong</div>;
  }
}
```

## With Context

Pass custom context to requests:

```typescript
const client = createApolloClient();

const { data } = await client.getUsers(
  undefined, // variables
  {
    headers: {
      'X-Custom-Header': 'value',
    },
  }
);
```

## Multiple Operations

Use multiple operations in the same component:

```typescript
export default async function DashboardPage() {
  const client = createApolloClient();
  
  // Run operations in parallel
  const [usersResult, postsResult] = await Promise.all([
    client.getUsers(),
    client.getPosts(),
  ]);

  return (
    <div>
      <UsersList data={usersResult.data} />
      <PostsList data={postsResult.data} />
    </div>
  );
}
```

