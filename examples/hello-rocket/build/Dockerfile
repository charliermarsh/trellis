#syntax=docker/dockerfile:experimental

FROM ubuntu:20.04 AS stage-ec6aa79ae6
WORKDIR /root
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked --mount=type=cache,target=/var/lib/apt,sharing=locked apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends build-essential ca-certificates curl libssl-dev pkg-config software-properties-common
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain 1.63.0
ENV PATH $PATH:/root/.cargo/bin
COPY --link ./Cargo.toml ./Cargo.toml
COPY --link ./Cargo.lock ./Cargo.lock
COPY --link ./src ./src
RUN --mount=type=cache,target=/root/.cargo/registry,sharing=locked cargo build --release

FROM ubuntu:20.04 AS stage-a2c91858c5
WORKDIR /root
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked --mount=type=cache,target=/var/lib/apt,sharing=locked apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ca-certificates
EXPOSE 8000
ENV ROCKET_ADDRESS 0.0.0.0
ENV ROCKET_CLI_COLORS 0
ENV ROCKET_PORT 8080
COPY --link --from=stage-ec6aa79ae6 /root/target/release/hello-rocket ./bin
CMD ["./bin"]
