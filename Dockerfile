#syntax=docker/dockerfile:experimental

FROM ubuntu:20.04 AS stage-a982a9ff-f8e2-44e7-bd77-ef5b0bcf3055
WORKDIR /root
RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
      apt-get update \
      && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential ca-certificates curl libssl-dev pkg-config software-properties-common
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain 1.63.0
ENV PATH $PATH:/root/.cargo/bin
COPY ./ ./
RUN --mount=type=cache,sharing=locked,target=/root/.cargo/registry cargo build --release

FROM ubuntu:20.04 AS stage-5f58a5de-a605-416e-ad9c-be9e5492cc38
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
COPY --from=stage-a982a9ff-f8e2-44e7-bd77-ef5b0bcf3055 /root/target/release/hello-rocket ./bin
RUN ["./bin"]
