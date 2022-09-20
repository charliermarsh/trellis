# typescript

Using Trellis to run continuous integration tests for a TypeScript monorepo.

## Usage

To run continuous integration checks, run:

```shell
trellis run trellis/tasks.ts
```

To post to Slack, add a `SLACK_TOKEN` to `.env`, and run:

```shell
trellis run trellis/tasks.ts -- --notify
```
