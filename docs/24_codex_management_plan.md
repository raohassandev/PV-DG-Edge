# Codex Management Plan

## Loop

1. Give Codex one phase prompt.
2. Codex implements locally.
3. Codex runs tests/typecheck/lint.
4. Codex commits.
5. User shares result/errors with ChatGPT.
6. ChatGPT reviews and gives next prompt.

## Codex report format

```text
Summary:
Files changed:
Commands run:
Test results:
Known limitations:
Next recommended step:
```

## Branching

```text
main
develop
phase/01-bootstrap
phase/02-database
...
```

## Commit style

```text
feat(api): add site CRUD
fix(worker): handle modbus timeout
docs(architecture): update realtime design
test(db): add migration tests
```

## Definition of done

- builds
- tests pass
- docs updated
- no secrets committed
- known limitations listed
