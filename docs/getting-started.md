# Getting Started

This guide will help you set up and configure the plugin in your Next.js project.

## Installation

```bash
npm install --save-dev @avorati/codegen-plugin-apollo-ssr
# or
yarn add --dev @avorati/codegen-plugin-apollo-ssr
```

## Configuration

### 1. Create `codegen.ts`

Create a `codegen.ts` file in your project root:

```typescript
import { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:1337/graphql"]: {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      },
    },
  ],
  documents: "src/**/*.graphql",
  generates: {
    "./src/graphql/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "@avorati/codegen-plugin-apollo-ssr",
      ],
      config: {
        withHook: false,
      },
    },
  },
};

export default config;
```

### 2. Add Script to `package.json`

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts"
  }
}
```

### 3. Run Code Generation

```bash
npm run codegen
# or
yarn codegen
```

## Setup Apollo Client

Create a file to initialize the client (e.g., `src/lib/apollo-client.ts`):

```typescript
import { HttpLink, InMemoryCache } from '@apollo/client';
import { GraphqlCustomClient } from '@/graphql/graphql';

export function createApolloClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1337/graphql',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
    },
  });

  return new GraphqlCustomClient({
    link: httpLink,
    cache: new InMemoryCache(),
    // You can customize any Apollo Client option here:
    // ssrMode: true,
    // defaultOptions: { ... },
    // connectToDevTools: true,
    // etc.
  });
}
```

## Next Steps

- [Usage Examples](./usage-examples.md) - Learn how to use the generated client
- [API Reference](./api-reference.md) - Understand the generated code structure

