#syntax=docker/dockerfile:experimental

ARG UBUNTU_VERSION=20.04

FROM ubuntu:${UBUNTU_VERSION} AS Build

# Install build dependencies.
RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
      apt-get update \
      && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        curl \
        libssl-dev \
        pkg-config \
        software-properties-common

# Install the Rust compiler.
WORKDIR /root
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain 1.63.0

# Copy over all the code needed to build the webapp.
COPY ./ ./

# Run `cargo build`.
RUN --mount=type=cache,sharing=locked,target=/root/.cargo/registry \
      "$HOME/.cargo/bin/cargo" build --release

FROM ubuntu:${UBUNTU_VERSION} AS App

# Install runtime dependencies.
RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
    --mount=type=cache,sharing=locked,target=/var/lib/apt \
      apt-get update \
      && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ca-certificates

EXPOSE 8080
ENV ROCKET_PORT 8080
ENV ROCKET_CLI_COLORS=0
ENV ROCKET_ADDRESS=0.0.0.0
WORKDIR /app
COPY --from=Build /root/target/release/hello-rocket ./

# Set entrypoint.
CMD ["/app/hello-rocket"]
