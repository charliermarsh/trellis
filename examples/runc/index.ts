import { build, Image, save } from "../../trellis/index.ts";

export const runc = Image.from("golang:1.19.1-bullseye")
  .withTag("runc:latest")
  .aptInstall(["libseccomp-dev"])
  .workDir("/github.com/opencontainers")
  .run("git clone https://github.com/opencontainers/runc.git")
  .workDir("/github.com/opencontainers/runc")
  .run("make")
  .run("make install")
  .run("/usr/local/sbin/runc --help");

export default async function createSpec() {
  const image = await build(runc);

  const specArtifact = Image.from(image)
    .workDir("/mycontainer")
    .copy("rootfs", "rootfs")
    .run("runc spec")
    .saveArtifact("/mycontainer/config.json");

  await save(specArtifact, ".");
}
