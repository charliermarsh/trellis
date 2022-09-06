import { solve } from "./buildkit";
import { DockerImage } from "./image";
import { Cargo, InstallRustToolchain } from "./layers";

const binary = DockerImage.from("ubuntu:20.04")
  .workDir("/root")
  .aptInstall([
    "build-essential",
    "ca-certificates",
    "curl",
    "libssl-dev",
    "pkg-config",
    "software-properties-common",
  ])
  .addLayer(new InstallRustToolchain("1.63.0"))
  .copy("./", "./")
  .addLayer(new Cargo("build --release"))
  .saveArtifact("/root/target/release/hello-rocket");

const appStage = DockerImage.from("ubuntu:20.04")
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

console.log(solve([appStage]));
