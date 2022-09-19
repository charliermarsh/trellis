# TypeKit

_Write Dockerfiles in TypeScript._

TypeKit is a portable CI/CD tool. With TypeKit, you can write Dockerfiles and
CI/CD pipelines in TypeScript, then run them anywhere, be it locally or on a
hosted platform.

TypeKit takes inspiration from tools like [Earthly](https://earthly.dev/),
[Dagger](https://dagger.io/), and [Tangram](https://tangram.dev/).

## Motivation

TypeKit can be used in several ways and so fits into several framings:

1. "Write Dockerfiles in TypeScript"
2. "Write Jenkinsfiles in TypeScript" (or any CI/CD pipeline)
3. "Write command-line tools in TypeScript" (this is more tenuous)

Why do this? Much of it is motivated by what I see as failings of Jenkins but,
in my opinion, also apply to other CI/CD systems.

- Dockerfiles are hard to maintain. Writing them in TypeScript gives you
  autocompletion out of the box, and enables you to take advantage of
  composition, modularity, and abstraction. By leveraging types, we can make
  certain Dockerfile mistakes "impossible" (like relying on non-existent
  artifacts).
- Writing _efficient_ Dockerfiles is hard. As BuildKit has expanded, Dockerfile
  has become too low-level. TypeKit gives you higher-level primitives.
- CI/CD should be runnable locally as a first-class primitive.
- CI/CD should be portable.
- Writing CI/CD in TypeScript gives us immediate access to a familiar ecosystem.
  For example, if we want to ping Slack within a CI script, we just
  `npm install` the Slack client (as opposed to install a Slack plugin on
  Jenkins).
- Using Deno means that installation is extremely simple.

A significant goal here is that running locally shouldn't mean that your builds
happen locally. And we should handle caching and intelligent builds
automatically (unlike GitHub Actions) or other systems where caching always
comes last. Imagine if you could run a CI command and get zero-configuration
access to running builds on the cloud while orchestrating from your local
machine? Cloud compute that feels local.

## Design goals

- Feel similar to Dockerfile

## Commands

### `typekit preview`

Generate a Dockerfile from a TypeKit build definition.

### `typekit build`

Build a Docker image from a TypeKit build definition.

### `typekit ls`

List the buildable Images and runnable Tasks defined in a TypeKit file.

### `typekit run`

Run a TypeKit Task.

## Examples

1. Rust (Rocket) webserver
2. TypeScript monorepo
3. Linux development container
4. Nix-backed development container

## What's missing?

Future goals:

- Auto-generate TypeKit files like Nixpacks
- Automatically connect to (extremely fast) cloud compute
- Create CI-like abstractions around job configuration and workflow state, with
  infrastructure-as-code and one-click deployment

### Documentation

- Instructions for running locally or on CI.
- An example of using TypeKit with Pulumi.

### Functionality

- Ability to save artifacts locally.
- Ability to run builds remotely.
- Ability to use a shared inline cache.

## Architecture

### Caching

- Should we enable shared inline caches?
- How would we handle multi-stage builds? Would we automatically push all
  stages?

### Remote server

- Create a GCE instance to act as the build server.
- Create an NFS server.
- When we run `docker build`, collect the build context. We'll actually parse
  the build context by looking at ADD and COPY commands.
- For each file, compute a checksum, and send it up to the server; server
  replies with the files it needs; client sends them up.
- Connect to the server, and run the typekit commands.
- (Don't worry about local copies for now.)

## License

MIT
