# rocket

Using Trellis to build and deploy a Rust web application (via the
[Rocket](https://rocket.rs/) web framework) to fly.io.

## Usage

To generate the Dockerfile, run:

```shell
trellis preview trellis/image.ts > trellis/Dockerfile
```

To deploy to Fly.io, configure [Flyctl](https://fly.io/docs/getting-started/),
then run:

```shell
flyctl launch --dockerfile trellis/Dockerfile
```
