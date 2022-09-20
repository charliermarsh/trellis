import { build, Image, save } from "../../trellis/index.ts";
import { runc } from "./build.ts";

export default async function createSpec() {
  const image = await build(runc);

  const specArtifact = Image.from(image)
    .workDir("/mycontainer")
    .copy("rootfs", "rootfs")
    .run("runc spec")
    .saveArtifact("/mycontainer/config.json");

  await save(specArtifact, ".");
}
