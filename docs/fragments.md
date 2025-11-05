# Fragments Support

The plugin automatically handles GraphQL fragments, including nested and recursive fragments, and can optionally namespace fragment names to avoid collisions across files.

## Basic Fragments

Define fragments in your GraphQL files:

```graphql
# user-fragment.graphql
fragment UserFields on User {
  id
  name
  email
}

# query.graphql
query GetUsers {
  users {
    ...UserFields
  }
}
```

The plugin automatically includes the fragment in the generated document.

## Nested Fragments

Fragments can reference other fragments:

```graphql
fragment UserBasic on User {
  id
  name
}

fragment UserDetails on User {
  ...UserBasic
  email
  bio
  avatar
}

query GetUsers {
  users {
    ...UserDetails
  }
}
```

The plugin recursively includes all required fragments (`UserBasic` will be included when `UserDetails` is used).

## Fragments Across Files

Fragments can be defined in separate files and will be collected automatically:

```graphql
# fragments/user-fields.graphql
fragment UserFields on User {
  id
  name
  email
}

# fragments/user-avatar.graphql
fragment UserAvatar on User {
  avatar {
    url
    alt
  }
}

# queries/users.graphql
query GetUsers {
  users {
    ...UserFields
    ...UserAvatar
  }
}
```

All fragments from all files are collected and included when needed.

## Fragment Inheritance

Fragments can be deeply nested:

```graphql
fragment MediaFields on UploadFile {
  alternativeText
  url
  mime
}

fragment CTAFields on ComponentSharedCta {
  id
  ctaOption {
    ... on ComponentMenuOptionsPage {
      id
      label
    }
  }
}

fragment HeroFields on ComponentHomeComponentsHero {
  title
  background {
    ...MediaFields
  }
  cta {
    ...CTAFields
  }
}

query HomePage {
  homePage {
    sections {
      ...HeroFields
    }
  }
}
```

The plugin automatically includes:
- `MediaFields` (used by `HeroFields`)
- `CTAFields` (used by `HeroFields`)

## Best Practices

1. **Reuse Fragments**: Create reusable fragments for common fields
2. **Name Conventions**: Use descriptive names like `UserFields`, `ProductDetails`
3. **Organize by Feature**: Group related fragments in the same file
4. **Avoid Circular Dependencies**: Don't create fragments that reference each other cyclically

## Fragment Namespacing and Collisions

When multiple files define the same fragment name, enable namespacing to avoid collisions:

```ts
// codegen.ts
plugins: [
  'typescript',
  'typescript-operations',
  '@avorati/codegen-plugin-apollo-ssr',
],
config: {
  fragmentNamespace: 'file', // 'file' | 'folder' | 'none'
  onNameCollision: 'rename', // 'rename' | 'error'
  namespaceDepth: 1, // 1=FileBase, 2=ParentDir_FileBase
}
```

Examples of resulting names:
- `home.graphql` with `fragment Media` → `Home_Media`
- `menu.graphql` with `fragment Media` → `Menu_Media`

If two files share the same basename (e.g., `feature/home.graphql` and `pages/home.graphql`), set `namespaceDepth: 2` or use `fragmentNamespace: 'folder'` to produce names like `Feature_Home_Media` and `Pages_Home_Media`.

If you prefer a hard error instead of auto-rename, use `onNameCollision: 'error'`.

## Fragment Limitations

- Fragments must be defined on valid types from your schema
- Anonymous fragments (without names) are not supported

