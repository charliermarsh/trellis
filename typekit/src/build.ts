import { Image, InstallRustToolchain, Cargo, solve } from "./index.js";

const UBUNTU_VERSION = "20.04";
const RUST_VERSION = "1.63.0";

const buildStage = Image.from(`ubuntu:${UBUNTU_VERSION}`)
  .workDir("/root")
  .aptInstall([
    "build-essential",
    "ca-certificates",
    "curl",
    "libssl-dev",
    "pkg-config",
    "software-properties-common",
  ])
  .with(new InstallRustToolchain(RUST_VERSION))
  .copy("./Cargo.toml", "./Cargo.toml")
  .copy("./Cargo.lock", "./Cargo.lock")
  .copy("./src", "./src")
  .with(new Cargo("build --release"));

const binary = buildStage.saveArtifact("/root/target/release/hello-rocket");

const appStage = Image.from(`ubuntu:${UBUNTU_VERSION}`)
  .workDir("/root")
  .aptInstall(["ca-certificates"])
  .expose(8000)
  .env({
    ROCKET_PORT: 8080,
    ROCKET_CLI_COLORS: 0,
    ROCKET_ADDRESS: "0.0.0.0",
  })
  .copyArtifact(binary, "./bin")
  .cmd(["./bin"]);

console.log(solve(appStage));
