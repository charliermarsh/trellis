import { Image } from "../../../trellis/mod.ts";

export const NODE_VERSION = "alpine";

export function buildApp(app: string): Image {
  const buildStage: Image = Image.from(`node:${NODE_VERSION}`)
    .run("apk update").workDir("/app").run("yarn global add turbo").copy(
      ".",
      ".",
    )
    .run(`turbo prune --scope=${app} --docker`);

  const jsonArtifact = buildStage.saveArtifact("/app/out/json/");
  const lockfileArtifact = buildStage.saveArtifact("/app/out/yarn.lock");
  const fullArtifact = buildStage.saveArtifact("/app/out/full/");

  return Image.from(`node:${NODE_VERSION}`)
    .run("apk update")
    .workDir("/app")
    .copy(".gitignore", ".gitignore")
    .copyArtifact(jsonArtifact, ".")
    .copyArtifact(lockfileArtifact, "./yarn.lock")
    .run("yarn install")
    .copyArtifact(fullArtifact, ".")
    .copy("turbo.json", "turbo.json")
    .run(`yarn turbo run build --filter=${app}...`);
}
