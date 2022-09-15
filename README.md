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

- Instructions for running locally or on CI.
- An example of running on GitHub Actions.
- An example of using TypeKit with Pulumi.
- Ability to tag images.
- Ability to push images as part of a pipeline.
- Ability to extract artifacts as part of a pipeline.
- Ability to run builds remotely.

## License

MIT
