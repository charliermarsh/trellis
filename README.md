# Trellis

![Trellis module version](https://shield.deno.dev/x/trellis)
[![Actions status](https://github.com/charliermarsh/trellis/workflows/CI/badge.svg)](https://github.com/charliermarsh/trellis/actions)

_Write Dockerfiles and CI pipelines in TypeScript._

Trellis is a portable CI/CD tool. With Trellis, you can define your Dockerfiles
and CI/CD pipelines in TypeScript, and run them anywhere (locally or on a hosted
platform).

## Usage

### Installation

First, [install Deno](https://deno.land/#installation) with `brew install deno`
(or comparable).

Second, install the Trellis CLI with:

```shell
deno install \
    --allow-run=docker \
    --allow-net \
    --allow-write \
    --allow-env \
    --allow-read \
    https://deno.land/x/trellis@v0.0.6/cli.ts
```

Run `trellis --help` to verify your installation:

```shell
>>> trellis --help
Usage: trellis build mod.ts

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  ls [file]                 List all Images and Tasks available in a
                            TypeScript module
  preview [options] [file]  Generate a Dockerfile defined in a TypeScript
                            module
  build [options] [file]    Build an Image defined in a TypeScript module
  run [options] [file]      Run a Task defined in a TypeScript module
  help [command]            display help for command
```

### Define a Docker image

Export any `Image` to enable Dockerfile generation and image building with
Trellis.

For example, to define an Ubuntu image with a few useful utilities installed,
you could write the following `mod.ts` file:

```typescript
import { Image } from "https://deno.land/x/trellis@v0.0.6/mod.ts";

const UBUNTU_VERSION = "20.04";

export const buildStage = Image.from(`ubuntu:${UBUNTU_VERSION}`)
  .workDir("/root")
  .aptInstall([
    "curl",
    "jq",
    "git",
  ]);
```

Running `trellis ls mod.ts` lists the buildable Images:

```shell
>>> trellis ls mod.ts
Images:
- buildStage (trellis build --target buildStage)
```

We can preview the generated Dockerfile with
`trellis preview mod.ts --target buildStage`:

```shell
>>> trellis preview --target buildStage
#syntax=docker/dockerfile:1.4

FROM ubuntu:20.04 AS stage-0
WORKDIR /root
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked --mount=type=cache,target=/var/lib/apt,sharing=locked apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends curl git jq
```

We can build the image with `trellis build --target buildStage`:

```shell
>>> trellis build --target buildStage
[+] Building 0.6s (11/11) FINISHED
 => [internal] load build definition from Dockerfile                                                 0.0s
 => => transferring dockerfile: 335B                                                                 0.0s
 => [internal] load .dockerignore                                                                    0.0s
 => => transferring context: 2B                                                                      0.0s
 => resolve image config for docker.io/docker/dockerfile:1.4                                         0.2s
 => CACHED docker-image://docker.io/docker/dockerfile:1.4@sha256:9ba7531bd80fb0a858632727cf7a112fbf  0.0s
 => [internal] load build definition from Dockerfile                                                 0.0s
 => [internal] load .dockerignore                                                                    0.0s
 => [internal] load metadata for docker.io/library/ubuntu:20.04                                      0.2s
 => [stage-0 1/3] FROM docker.io/library/ubuntu:20.04@sha256:35ab2bf57814e9ff49e365efd5a5935b6915ee  0.0s
 => CACHED [stage-0 2/3] WORKDIR /root                                                               0.0s
 => CACHED [stage-0 3/3] RUN --mount=type=cache,target=/var/cache/apt,sharing=locked --mount=type=c  0.0s
 => exporting to image                                                                               0.0s
 => => exporting layers                                                                              0.0s
 => => writing image sha256:17f750ba9a4becf38ce4d584d0de4793bfd6a8139674c3b332cdcdf6525ea8d9         0.0s
 => => naming to docker.io/trellis/db112e211de238c035a9fd3bbcbd5c417aafc5ee96a8c24d99d4caf81a759903  0.0s
√ Build: trellis/db112e211de238c035a9fd3bbcbd5c417aafc5ee96a8c24d99d4caf81a759903
```

### Define a CI/CD pipeline

Export any function from a TypeScript module to enable task execution with
Trellis.

For example, to define a CI pipeline to verify that our command-line utilities
were successfully installed, you could write the following `tasks.ts` file:

```typescript
import { build, Image, run } from "https://deno.land/x/trellis@v0.0.6/mod.ts";
import { buildStage } from "./mod.ts";

export default async function runChecks() {
  await build(buildStage);

  const checkCurl = Image.from(buildStage).run(
    "curl --help",
  );
  const checkJq = Image.from(buildStage).run(
    "jq --help",
  );
  const checkGit = Image.from(buildStage).run(
    "git --help",
  );

  await Promise.all([
    run(checkCurl),
    run(checkJq),
    run(checkGit),
  ]);
}
```

Running `trellis ls tasks.ts` lists the executable Tasks:

```shell
>>> trellis ls tasks.ts
Tasks:
- default (trellis run tasks.ts)
```

We can execute the task locally with `trellis run tasks.ts`:

```shell
>>> trellis run tasks.ts
[+] Building 1.1s (13/13) FINISHED
 => [internal] load build definition from Dockerfile                                                 0.0s
 => => transferring dockerfile: 335B                                                                 0.0s
 => [internal] load .dockerignore                                                                    0.0s
 => => transferring context: 2B                                                                      0.0s
 => resolve image config for docker.io/docker/dockerfile:1.4                                         0.5s
 => [auth] docker/dockerfile:pull token for registry-1.docker.io                                     0.0s
 => CACHED docker-image://docker.io/docker/dockerfile:1.4@sha256:9ba7531bd80fb0a858632727cf7a112fbf  0.0s
 => [internal] load .dockerignore                                                                    0.0s
 => [internal] load build definition from Dockerfile                                                 0.0s
 => [internal] load metadata for docker.io/library/ubuntu:20.04                                      0.3s
 => [auth] library/ubuntu:pull token for registry-1.docker.io                                        0.0s
 => [stage-0 1/3] FROM docker.io/library/ubuntu:20.04@sha256:35ab2bf57814e9ff49e365efd5a5935b6915ee  0.0s
 => CACHED [stage-0 2/3] WORKDIR /root                                                               0.0s
 => CACHED [stage-0 3/3] RUN --mount=type=cache,target=/var/cache/apt,sharing=locked --mount=type=c  0.0s
 => exporting to image                                                                               0.0s
 => => exporting layers                                                                              0.0s
 => => writing image sha256:17f750ba9a4becf38ce4d584d0de4793bfd6a8139674c3b332cdcdf6525ea8d9         0.0s
 => => naming to docker.io/trellis/adf8a603d1ab539848d89f68491e1b9213c1ca498f3f68d871e1b59c4c7de601  0.0s
√ Build: trellis/adf8a603d1ab539848d89f68491e1b9213c1ca498f3f68d871e1b59c4c7de601
√ Run: git --help
√ Run: jq --help
√ Run: curl --help
```

### Configuration

Trellis can be configured via a `trellis.config.ts` file, the basic semantics of
which are modelled after [Vite](https://vitejs.dev/config/).

The `trellis.config.ts` should contain a single default export consisting of a
`defineConfig` invocation, like this:

```typescript
import { defineConfig } from "https://deno.land/x/trellis@v0.0.6/mod.ts";

export default defineConfig({
  engine: "docker",
});
```

Trellis will use the closest `trellis.config.ts`, looking first in the current
working directory, and then in each subsequent parent directory.

### Depot

Trellis is compatible with [depot.dev](https://depot.dev/), which can be used to
enable cloud-accelerated builds with zero configuration. Run through the Depot
installation (`brew install depot/tap/depot` or similar, followed by
`depot login`), then define a `trellis.config.ts` like so:

```typescript
import { defineConfig } from "https://deno.land/x/trellis@v0.0.6/mod.ts";

export default defineConfig({
  engine: {
    type: "depot",
    project: "${YOUR_PROJECT_ID}",
  },
});
```

From there, all Trellis builds will run through Depot.

### Trellis on GitHub Actions

Trellis runs on Deno, making it a one-step installation on GitHub Actions:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  DOCKER_BUILDKIT: 1

jobs:
  build:
    name: "Build"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: "Install Deno"
        uses: denoland/setup-deno@v1
        with:
          deno-version: "1.25.2"
      - name: "Install Trellis"
        working-directory: ./trellis
        run: deno install --allow-run=docker --allow-net --allow-write --allow-env --allow-read https://deno.land/x/trellis@v0.0.6/cli.ts
      - name: "Build the image"
        working-directory: ./examples/typescript
        run: trellis build trellis/mod.ts
```

## Motivation

Trellis is motivated by the following observations, drawn from the experience of
maintaining large, containerized CI/CD systems.

1. **Dockerfiles are hard to _maintain_.** Over time, large systems tend to
   accumulate collections of Dockerfiles with similar subsections, but no shared
   abstractions.

2. **_Efficient_ Dockerfiles are hard to _write_.** Writing a Dockerfile that's
   maximally cacheable, with a minimal footprint, requires significant
   expertise. For example, to `apt-get install`, the
   [Docker documentation](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#sort-multi-line-arguments)
   recommends the following:

```shell
RUN apt-get update && apt-get install -y \
  # Be sure to sort dependencies to maximize cacheability.
  bzr \
  cvs \
  git \
  mercurial \
  subversion \
  # Clear the apt cache to minimize disk size.
  && rm -rf /var/lib/apt/lists/*
```

3. **The CI/CD iteration loop is _too slow_.** The common workflow for writing a
   new GitHub Actions pipeline, Jenkinsfile, etc., is to commit, push, wait for
   the system to acknowledge your change, then wait for your task to fail —
   tens, or even hundreds of times in a row. With existing CI solutions, you're
   writing code to run on an unfamiliar system, outside your control, without a
   first-class development workflow.

4. **CI/CD systems create _significant lock-in_.** Porting your Jenkinsfiles or
   YAML files to GitHub Actions, or vice versa, requires grappling with
   platform-specific abstractions.

Trellis solves these problems through a few significant design decisions.

First: **With Trellis, you define your Dockerfiles and CI/CD pipelines in
TypeScript.** This gives you the power of a "full" programming language while
retaining a declarative API. With TypeScript, we get the following benefits:

1. Autocompletion out-of-the-box.
2. Certain mistakes become "impossible" (e.g., copying non-existent artifacts
   between stages).
3. Access to abstraction, modularity, and composability: define common build
   stages and higher-level primitives to avoid writing complex `apt-get install`
   steps by hand.
4. Immediate access to a rich, familiar ecosystem. Pinging Slack from a CI
   pipeline is as simple as importing the Slack client from `deno.land`.

Second: **Trellis makes local execution a first-class primitive.** CI/CD
shouldn't feel like an entirely separate system; it should feel like running
code. Trellis is built on Deno and highly portable. You can run `trellis build`
locally just as you would on GitHub Actions or elsewhere. In this way, Trellis
takes inspiration from tools like [Earthly](https://earthly.dev/) and
[Dagger](https://dagger.io/).

Trellis has a few aspirational goals that aren't yet realized:

- **Enable cloud-accelerated builds out-of-the-box.** Make cloud-based execution
  feel local. Kicking off a build locally should resolve to the same compute
  resources as on the cloud. Builds should initialize in milliseconds.
- **Provide a full CI/CD system out-of-the-box.** Define your CI/CD workflows
  (cron jobs, build triggers, etc.) in code, and deploy them to a hosted Trellis
  server with zero configuration.

## CLI

Trellis is both a library and a command-line interface. With Trellis, you export
`Image` definitions and runnable functions (called "Tasks") from your TypeScript
modules, then execute them via the `trellis` CLI.

### `trellis preview`

Generate a Dockerfile defined in a TypeScript module.

```shell
Usage: trellis preview [options] [file]

Generate a Dockerfile defined in a TypeScript module

Options:
  -t, --target <TARGET>  Image to build within the TypeScript module
  -h, --help             display help for command
```

### `trellis build`

Build an Image defined in a TypeScript module.

```shell
Usage: trellis build [options] [file]

Build an Image defined in a TypeScript module

Options:
  -t, --target <TARGET>  Image to build within the TypeScript module
  --push                 Whether to push the image to a remote registry
  -h, --help             display help for command
```

### `trellis ls`

List all Images and Tasks available in a TypeScript module.

```shell
Usage: trellis ls [options] [file]

List all Images and Tasks available in a TypeScript module

Options:
  -h, --help  display help for command
```

### `trellis run`

Run a Task defined in a TypeScript module.

```Usage: trellis run [options] [file]
Run a Task defined in a TypeScript module

Options:
  -t, --target <TARGET>  Task to run within the TypeScript module
  -h, --help             display help for command
```

## Examples

The `./examples` directory demonstrates a variety of use-cases for Trellis.
Trellis is flexible and can be used solely to generate Dockerfiles for other
systems, or for defining entire CI/CD pipelines.

- `rocket`: A Rust webserver atop the [Rocket](https://rocket.rs/) framework.
  Demonstrates multi-stage builds and deployment via [Fly.io](https://fly.io/)
  by leveraging `trellis preview`.
- `ruff`: A Rust command-line tool. Demonstrates efficient builds and CI checks.
- `runc`: A Linux development container. Demonstrates generating artifacts with
  Trellis and copying them back to the host machine.
- `turborepo`: Turborepo's own Docker example, modified to generate Dockerfiles
  with Trellis.
- `typescript`: A TypeScript monorepo. Demonstrates efficient builds and CI
  checks, along with consolidating constants (like the list of TypeScript
  workspaces).
- `wasm`: A "Hello, world!" Rust binary that's compiled to Wasm and tested on
  [Wasmtime](https://wasmtime.dev/).

## Architecture

Trellis is built on Deno, which is distributed as a single binary executable
with no external dependencies. Using Deno means that installing Trellis
_anywhere_) is as simple as `deno install ...` — there's no `package.json`, no
`npm install`, and no TypeScript transpilation step.

Similar to [Nixpacks](https://nixpacks.com/docs/how-it-works), Trellis generates
Dockerfiles. This simplifies Trellis's implementation, but also enables users to
leverage Trellis for Dockerfile generation alone, rather than as a complete
CI/CD solution.

`trellis build` and `trellis run` depend on Docker and assume that the Docker
daemon is locally accessible.

## Roadmap

1. Automatically connect to (extremely fast) cloud compute for build and task
   execution. Make cloud-based builds feel local. (Today, you can accelerate
   Trellis builds via [depot.dev](https://depot.dev/). See: ["Depot"](#Depot).)
2. Create abstractions around "job configuration" and "workflow state", with
   infrastructure-as-code and one-click deployments, turning Trellis into a
   standalone CI solution.
3. Auto-generate Trellis files from source code (like
   [Nixpacks](https://github.com/railwayapp/nixpacks)).

## License

MIT
