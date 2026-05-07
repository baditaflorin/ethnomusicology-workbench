# Contributing

Thanks for helping improve Ethnomusicology Workbench.

## Local setup

```bash
npm install
make install-hooks
make dev
```

## Standards

- Use Conventional Commits, for example `feat: add elan export`.
- Keep user recordings and secrets out of git.
- Run `make test` and `make build` before pushing.
- Add or update ADRs for significant architectural decisions.

## Git hooks

Install local hooks with:

```bash
make install-hooks
```

The hooks run formatting, linting, type checks, tests, builds, smoke tests, a Conventional Commits check, and `gitleaks` when it is available locally.
