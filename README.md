# TypeKit

_Write Dockerfiles in TypeScript._

TypeKit is a portable CI/CD tool. With TypeKit, you can write Dockerfiles and
CI/CD pipelines in TypeScript, then run them anywhere, be it locally or on a
hosted platform.

TypeKit takes inspiration from tools like [Earthly](https://earthly.dev/),
[Dagger](https://dagger.io/), and [Tangram](https://tangram.dev/).

## Commands

### `typekit preview`

Generate a Dockerfile from a TypeKit build definition.

### `typekit build`

Build a Docker image from a TypeKit build definition.

### `typekit ls`

List the buildable Images and runnable Tasks defined in a TypeKit file.

### `typekit run`

Run a TypeKit Task.

## What's missing?

### Documentation

- Instructions for running locally or on CI.
- An example of using TypeKit with Pulumi.

### Functionality

- Ability to save artifacts locally.
- Ability to run builds remotely.
- Ability to use a shared inline cache.

## Architecture

### Caching

- How do we handle multi-stage builds? Do we automatically push all stages?

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
