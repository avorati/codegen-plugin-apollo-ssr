# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-11-06

### Changed
- Changed `GraphqlCustomClient` constructor to accept `ApolloClientOptions<any>` instead of `ApolloLink`
  - Users can now configure all Apollo Client options including cache, defaultOptions, ssrMode, and more
  - Default values (ssrMode: true, cache: InMemoryCache, fetchPolicy: 'network-only') are merged with user options
  - User options take precedence over defaults
  - This provides full flexibility for Apollo Client configuration

### Improved
- Updated documentation with examples of custom cache configuration and Apollo Client options
- Added tests to verify option merging behavior

## [1.2.4] - 2025-11-06

### Fixed
- Fixed outdated test expectation for client imports (removed HttpLink from expected imports)

## [1.2.3] - 2025-11-05

### Maintenance
- Version bump and release housekeeping

## [1.2.2] - 2025-11-05

### Improved
- Refactored plugin codebase for better maintainability
  - Separated code into focused modules by responsibility
  - Created dedicated modules for configuration, templates, naming utilities, fragment handling, and operations
  - Reduced main plugin file from 296 lines to ~60 lines
  - Improved code organization and testability
  - Maintained full backward compatibility

## [1.2.1] - 2025-11-05

### Fixed
- Align package version with changelog and release commit order

## [1.2.0] - 2025-11-05

### Added
- Fragment namespacing to avoid collisions across multiple files
- Config options: `fragmentNamespace`, `onNameCollision`, `namespaceDepth`
- Error mode with clear message listing conflicting files
- Tests covering collisions, same basename handling, and error mode
- Documentation updates (`README.md`, `docs/fragments.md`)

### Changed
- Preserve underscores in generated fragment names (e.g., `Home_Media`)

## [1.1.0] - 2024-11-04

### Changed
- Updated `GraphqlCustomClient` constructor to accept `ApolloLink` instead of `HttpLink`
  - Enables support for composite links (e.g., `from([errorLink, httpLink])`)
  - Maintains backward compatibility as `HttpLink` extends `ApolloLink`
  - Allows more flexible link configuration

### Improved
- Removed unnecessary `NormalizedCacheObject` type annotation from ApolloClient
- Simplified operation template to pass context directly to Apollo Client
  - Apollo Client automatically merges context headers with link headers
  - Context headers now properly override default link headers

## [1.0.2] - 2024-11-04

### Fixed
- Fixed build error caused by release creation before CI completion

## [1.0.1] - 2025-11-04

### Added
- Added `check-version.ps1` script for PowerShell version checking in CI/CD
- Added `check-version.sh` script for Bash version checking in CI/CD

## [1.0.0] - 2025-11-04

### Added
- Initial release of the Apollo SSR codegen plugin
- Support for GraphQL queries, mutations, and subscriptions
- Automatic recursive fragment support
- SSR-optimized Apollo Client configuration
- TypeScript type generation via `typescript-operations`
- Generated client class with methods for each operation
- Support for Next.js 14+ Server Components
- Comprehensive test suite
- Documentation and usage examples

### Features
- Direct method calls (no React hooks needed)
- Query methods prefixed with `get` (e.g., `getUsers()`)
- Mutation/Subscription methods prefixed with `post` (e.g., `postCreateUser()`)
- Network-only fetch policy for SSR compatibility
- Automatic fragment inclusion across multiple files

[1.3.0]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.3.0
[1.2.4]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.2.4
[1.2.3]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.2.3
[1.2.2]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.2.2
[1.2.1]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.2.1
[1.2.0]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.2.0
[1.1.0]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.1.0
[1.0.2]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.0.2
[1.0.1]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.0.1
[1.0.0]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.0.0
