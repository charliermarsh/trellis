# typekit

_Write Dockerfiles in TypeScript._

typekit is a portable CI/CD tool. With typekit, you can write Dockerfiles and CI/CD pipelines in
TypeScript, then run them anywhere, be it locally or on a hosted platform.

typekit takes inspiration from tools like [Earthly](https://earthly.dev/),
[Dagger](https://dagger.io/), and [Tangram](https://tangram.dev/).

## Commands

### `typekit preview`

Generate a Dockerfile from a TypeKit build definition.

### `typekit build`

Build a Docker image from a TypeKit build definition.

### `typekit ls`

List the build and execution targets from a TypeKit file.

### `typekit run`

Run a TypeKit function.

## License

MIT
