# Comparison with Other Plugins

This document compares `@avorati/codegen-plugin-apollo-ssr` with other GraphQL Code Generator plugins.

## vs `typescript-react-apollo`

| Feature | `@avorati/codegen-plugin-apollo-ssr` | `typescript-react-apollo` |
|---------|--------------------------------------|---------------------------|
| **SSR Support** | ✅ Optimized for SSR | ❌ Client-side hooks |
| **Server Components** | ✅ Full support | ❌ Not compatible |
| **Server Actions** | ✅ Full support | ❌ Not compatible |
| **React Hooks** | ❌ No hooks | ✅ `useQuery`, `useMutation` |
| **Direct Methods** | ✅ `getUsers()`, `postCreateUser()` | ❌ Hook-based API |
| **Bundle Size** | ✅ Smaller (no React dependencies) | ❌ Includes React hooks |
| **Cache Strategy** | ✅ `network-only` (SSR-optimized) | ⚠️ Configurable (may cache) |
| **Type Generation** | ✅ Via `typescript-operations` | ✅ Via `typescript-operations` |

### When to Use Each

**Use `@avorati/codegen-plugin-apollo-ssr` when:**
- Building Next.js 14+ App Router applications
- Using Server Components
- Need SSR-optimized code generation
- Want direct method calls (no hooks)

**Use `typescript-react-apollo` when:**
- Building client-side React applications
- Need React hooks for data fetching
- Building interactive components with real-time updates
- Using client-side caching strategies

## vs `typescript-apollo-client-helpers`

| Feature | `@avorati/codegen-plugin-apollo-ssr` | `typescript-apollo-client-helpers` |
|---------|--------------------------------------|-----------------------------------|
| **SSR Optimization** | ✅ Built-in | ⚠️ Manual configuration |
| **Client Class** | ✅ Generated automatically | ❌ Manual setup |
| **Method Naming** | ✅ Consistent (`get`/`post` prefix) | ⚠️ Custom naming |
| **Fragment Support** | ✅ Automatic recursive | ✅ Automatic recursive |
| **Next.js Integration** | ✅ Optimized for Next.js 14+ | ⚠️ Generic |

## vs `typescript-graphql-request`

| Feature | `@avorati/codegen-plugin-apollo-ssr` | `typescript-graphql-request` |
|---------|--------------------------------------|------------------------------|
| **Client Library** | Apollo Client | GraphQL Request |
| **SSR Support** | ✅ Built-in | ✅ Built-in |
| **Cache** | ✅ InMemoryCache | ❌ No cache |
| **Error Handling** | ✅ Apollo error types | ⚠️ Basic error handling |
| **Subscriptions** | ✅ Supported | ❌ Not supported |
| **Bundle Size** | ⚠️ Larger (Apollo Client) | ✅ Smaller (graphql-request) |

## Summary

`@avorati/codegen-plugin-apollo-ssr` is specifically designed for:

- ✅ **Next.js 14+ App Router** applications
- ✅ **Server Components** and **Server Actions**
- ✅ **SSR-optimized** code generation
- ✅ **Direct method calls** without React hooks

If you're building a traditional React application with client-side data fetching, consider `typescript-react-apollo` instead.

