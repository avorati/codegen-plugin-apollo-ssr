# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.1]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.0.1
[1.0.0]: https://github.com/avorati/codegen-plugin-apollo-ssr/releases/tag/v1.0.0
