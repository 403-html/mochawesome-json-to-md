# Project Review

Date: 2026-02-06

## Key strengths

- Clear layering in `src/` (`bin`, `services`, `domain`, `config`) keeps responsibilities focused.
- Input validation is consistent at boundaries (`cli-options`, `schema`) and error messages include context.
- Tests cover core behaviors (CLI invocation, nested suite traversal, invalid input paths).
- Tooling is sensible: ESLint, markdownlint, Prettier, lefthook hooks, and a release workflow.
- Minimal runtime dependencies aligned with the CLI’s scope.

## Key risks or weak points

- `src/services/converter.js` uses module-level mutable logger state, which makes repeated calls harder to reason about.
- `convertMochaToMarkdown` sets `process.exitCode` even when used as a library import, which may surprise consumers.
- `test:coverage` currently aliases `npm test` without coverage output, which can be misleading.
- `@typescript-eslint/*` dev dependencies appear unused (no TypeScript config), which is minor but adds noise.

## High-impact improvement opportunities

- Remove the module-level logger state by passing logger instances explicitly.
- Separate CLI-only side effects (exit codes) from library usage paths.
- Either add coverage tooling for `test:coverage` or rename the script for clarity.
- Remove unused dev dependencies or document the TypeScript roadmap intent.

## Prioritized refactor suggestions

1. **Inject logger instead of module-level state**  
   - **What to change:** Replace `let logger` and `setLogger` with explicit logger creation inside
     `convertMochaToMarkdown`, and pass it to helper functions.
   - **Why it helps:** Eliminates hidden shared state and makes repeated calls and tests more predictable.
   - **Risk level:** Medium (touches shared logging flow).
   - **Recommendation:** Recommended.

2. **Limit `process.exitCode` to the CLI entrypoint**  
   - **What to change:** Return a success/failure value (or rethrow) from `convertMochaToMarkdown` and
     set `process.exitCode` only in `runCli`.
   - **Why it helps:** Avoids side effects when the library is imported programmatically.
   - **Risk level:** Medium (API behavior adjustment).
   - **Recommendation:** Optional.

3. **Clarify the coverage workflow**  
   - **What to change:** Either add `nyc` (or similar) to `test:coverage` or rename the script to
     reflect that it runs tests only.
   - **Why it helps:** Aligns developer expectations and makes coverage gaps visible.
   - **Risk level:** Low.
   - **Recommendation:** Optional.

4. **Trim unused dev dependencies**  
   - **What to change:** Remove `@typescript-eslint/*` if TypeScript isn’t in active use, or add a
     note to the roadmap/docs if it’s intentional.
   - **Why it helps:** Keeps tooling lean and avoids confusion.
   - **Risk level:** Low.
   - **Recommendation:** Optional.
