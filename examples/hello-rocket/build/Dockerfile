#syntax=docker/dockerfile:experimental

FROM ubuntu:20.04 AS stage-0f903578-2c17-4676-be5f-322d0445ab9d
WORKDIR /root
RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
      apt-get update \
      && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential ca-certificates curl libssl-dev pkg-config software-properties-common
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain 1.63.0
ENV PATH $PATH:/root/.cargo/bin
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock
COPY ./src ./src
RUN --mount=type=cache,sharing=locked,target=/root/.cargo/registry cargo build --release

FROM ubuntu:20.04 AS stage-407e0f63-556b-4b34-8932-62fb852c9166
WORKDIR /root
RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
      apt-get update \
      && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ca-certificates
EXPOSE 8000
ENV ROCKET_ADDRESS 0.0.0.0
ENV ROCKET_CLI_COLORS 0
ENV ROCKET_PORT 8080
COPY --from=stage-0f903578-2c17-4676-be5f-322d0445ab9d /root/target/release/hello-rocket ./bin
CMD ["./bin"]
