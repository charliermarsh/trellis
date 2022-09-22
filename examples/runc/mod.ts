import { build, Image, save } from "../../trellis/mod.ts";
import { runc } from "./build.ts";

export default async function createSpec() {
  await build(runc);

  const specArtifact = Image.from(runc)
    .workDir("/mycontainer")
    .copy("rootfs", "rootfs")
    .run("runc spec")
    .saveArtifact("/mycontainer/config.json");

  await save(specArtifact, ".");
}
