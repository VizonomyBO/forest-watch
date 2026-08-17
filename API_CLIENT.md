# API client contract

All browser requests must use `src/services/httpClient.ts`, either through the generated fetchers or the legacy `BaseService` adapter. The shared boundary provides request IDs, bearer-header handling, abort propagation, normalized `ApiError` failures, and one authenticated `401` logout hook.

New server-state flows should use the generated React Query hooks. Legacy singleton services remain adapters during feature-by-feature migration and must not introduce their own `fetch` implementation.

Client generation is deliberately fail-closed. Set the repository-specific `OPENAPI_<REPOSITORY>_REF` variable (for example, `OPENAPI_FW_API_REF`) to the reviewed, immutable 40-character production schema commit before running a `generate:*` command. Branch names such as `dev` or `main` are rejected.
