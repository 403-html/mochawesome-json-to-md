# Code of Conduct

This project is about shipping reliable code. Keep interactions professional and on-topic: discuss code, architecture, tests, and delivery. Off-topic or disruptive behavior slows everyone down and is not welcome.

## Expectations

- Keep feedback technical, specific, and actionable.
- Respect reviewers' time: run lint/tests and describe changes clearly.
- Prefer clarity over cleverness; document reasoning for non-obvious choices.
- Stay on topic in issues/PRs; avoid personal comments.
- Disagreements are resolved with evidence (benchmarks, docs, specs), not volume.

## Not acceptable

- Personal attacks, insults, or attempts to derail technical discussions.
- Spam, off-topic promotion, or flooding threads.
- Ignoring project decisions or repeatedly reopening settled topics without new data.
- Sharing private information from issues/PRs without consent.

## Safety rules for code contributions

To keep the codebase predictable and safe, contributors are expected to follow these safety rules when writing or reviewing code:

- Favor simple, linear control flow; avoid deeply nested branches and hidden side effects.
- Keep loops bounded with clear exit conditions; avoid unbounded `while` patterns.
- Keep functions small and single-purpose (target: under ~60 logical lines).
- Check and handle errors and return values explicitly; do not ignore failures.
- Use explicit comparisons and defaults; avoid implicit coercion or reliance on falsy/truthy checks for critical paths.
- Limit mutable shared state; keep variable scope as narrow as possible.
- Keep one primary side effect per statement to preserve readability and order of operations.
- Guard assumptions with validations or assertions where appropriate.
- Prefer predictable allocation and resource reuse in hot paths; clean up resources deterministically.
- Run linting/static analysis and address warnings before submitting changes.
