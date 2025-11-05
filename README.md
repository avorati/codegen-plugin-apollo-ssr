# Codegen Plugin Apollo SSR

[![CI/CD](https://github.com/avorati/codegen-plugin-apollo-ssr/workflows/CI/CD/badge.svg)](https://github.com/avorati/codegen-plugin-apollo-ssr/actions)
[![npm version](https://img.shields.io/npm/v/@avorati/codegen-plugin-apollo-ssr.svg)](https://www.npmjs.com/package/@avorati/codegen-plugin-apollo-ssr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A GraphQL Code Generator plugin that generates SSR-friendly Apollo Client code for Next.js 14+ Server Components.

## Installation

```bash
yarn add --dev @avorati/codegen-plugin-apollo-ssr
# or
npm install --save-dev @avorati/codegen-plugin-apollo-ssr
```

## Quick Start

Add the plugin to your `codegen.ts`:

```typescript
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://your-api.com/graphql",
  documents: "src/**/*.graphql",
  generates: {
    "./src/graphql/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "@avorati/codegen-plugin-apollo-ssr",
      ],
    },
  },
};

export default config;
```

Then run codegen:

```bash
npx graphql-codegen --config codegen.ts
```

## Why Use This Plugin?

Unlike other plugins that generate React hooks (like `typescript-react-apollo`), this plugin is designed specifically for **Next.js 14+ Server Components** and SSR. It generates:

- ✅ Direct methods for each operation (no hooks needed)
- ✅ SSR-optimized Apollo Client configuration
- ✅ Automatic recursive fragment support
- ✅ TypeScript types for all operations

## Documentation

- [Getting Started](./docs/getting-started.md) - Complete setup guide
- [Usage Examples](./docs/usage-examples.md) - Server Components, Server Actions, and more
- [API Reference](./docs/api-reference.md) - Generated code structure
- [Fragments](./docs/fragments.md) - Fragment support, namespacing and best practices

## Fragment Namespacing and Collisions

When multiple files define fragments with the same name (e.g., `Media`, `Cta`), GraphQL requires unique fragment names across the entire document set. This plugin can automatically namespace fragment names per file to avoid collisions.

Configuration example (codegen.ts):

```ts
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://your-api.com/graphql',
  documents: 'src/**/*.graphql',
  generates: {
    './src/graphql/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        '@avorati/codegen-plugin-apollo-ssr',
      ],
      config: {
        fragmentNamespace: 'file', // 'file' | 'folder' | 'none'
        onNameCollision: 'rename', // 'rename' | 'error'
        namespaceDepth: 1, // 1=FileBase, 2=ParentDir_FileBase
      },
    },
  },
};

export default config;
```

Default behavior:
- `fragmentNamespace: 'file'`
- `onNameCollision: 'rename'`
- `namespaceDepth: 1`

This will rename `fragment Media` in `home.graphql` to `Home_Media`, and in `menu.graphql` to `Menu_Media`, updating local spreads accordingly.
- [Comparison](./docs/comparison.md) - Comparison with other plugins
- [Changelog](./CHANGELOG.md) - Version history and changes
- [Contributing](./CONTRIBUTING.md) - How to contribute to this project

## Requirements

- Node.js 16+
- Next.js 14+ (App Router)
- `@graphql-codegen/cli`
- `@graphql-codegen/typescript`
- `@graphql-codegen/typescript-operations`
- `@apollo/client`

## License

MIT
