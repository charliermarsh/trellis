#syntax=docker/dockerfile:1.4

FROM ubuntu:20.04 AS stage-0
WORKDIR /root
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked --mount=type=cache,target=/var/lib/apt,sharing=locked apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends build-essential ca-certificates curl libssl-dev pkg-config software-properties-common
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain 1.63.0
ENV PATH $PATH:/root/.cargo/bin
COPY --link ./Cargo.toml ./Cargo.toml
COPY --link ./Cargo.lock ./Cargo.lock
COPY --link ./src ./src
RUN --mount=type=cache,target=/root/.cargo/registry,sharing=locked cargo build --release
