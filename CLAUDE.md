# CLAUDE.md

## Commands

- Install dependencies: `npm install`
- Run tests: `npm test`
- Type-check/build: `npm run build`
- Lint: `npm run lint`

## Workflow Rules

- Do not push changes unless explicitly asked.
- Do not use `--no-verify`.
- Do not run destructive git commands such as `git reset --hard`, `git clean -fd`, deleting branches, or force-pushing without asking first.
- Keep diffs focused on the requested task.
- Add or update tests for behavior changes.
- Report the exact verification commands and their results before finishing.

## Architecture Notes

- Routes should handle HTTP parsing/response concerns only.
- Services own business rules.
- Repositories own in-memory persistence.
- Audit events should be written from service-level workflows, not directly from routes.
- Approval and budget rules must remain tenant-scoped.
