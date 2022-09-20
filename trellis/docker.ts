/**
 * High-level interface to the Docker CLI.
 */
import { join } from "https://deno.land/std@0.156.0/path/mod.ts";
import Kia from "https://deno.land/x/kia@0.4.1/kia.ts";
import { dockerBuild, dockerPush } from "./docker-cli.ts";
import { Artifact, Image } from "./image.ts";
import { Run } from "./instructions.ts";
import { solve } from "./solver.ts";
import { Sha256 } from "https://deno.land/std@0.156.0/hash/sha256.ts";

/**
 * Build an image.
 */
export async function build(image: Image): Promise<string> {
  const tag = image.tag
    ? image.tag
    : `trellis/${new Sha256().update(solve(image)).hex()}`;

  const kia = new Kia({ text: `Build: ${tag}` });
  if (!(Deno.env.get("CI") === "true")) kia.start();

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  const status = await dockerBuild(".", tempFilePath, { tag: tag });
  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
    throw Error(`Failed to build ${tag}`);
  }

  return tag;
}

/**
 * Push an image.
 */
export async function push(image: Image): Promise<void> {
  const tag = image.tag
    ? image.tag
    : `trellis/${new Sha256().update(solve(image)).hex()}`;

  const kia = new Kia({ text: `Push: ${tag}` });
  if (!(Deno.env.get("CI") === "true")) kia.start();

  // Push the built Docker image.
  const status = await dockerPush(tag);
  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
    throw Error(`Failed to push ${tag}`);
  }
}

/**
 * "Run" an image. This consists of building the image silently without tags.
 */
export async function run(image: Image): Promise<Deno.ProcessStatus> {
  const layer = image.layers[image.layers.length - 1];
  const kia = new Kia({
    text: layer instanceof Run ? `Run: ${layer.sh}` : "Run task",
  });
  if (!(Deno.env.get("CI") === "true")) kia.start();

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  const status = await dockerBuild(".", tempFilePath, { quiet: true }, {
    "stdout": "null",
  });
  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
  }

  return status;
}

/**
 * Save an artifact locally.
 */
export async function save(
  artifact: Artifact,
  destPath: string,
): Promise<Deno.ProcessStatus> {
  const kia = new Kia({ text: `Save: ${artifact.fileName}` });
  if (!(Deno.env.get("CI") === "true")) kia.start();

  const copyStage = Image.from("scratch").copyArtifact(artifact, "./");
  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(copyStage));

  const status = await dockerBuild(".", tempFilePath, {
    quiet: true,
    output: { type: "local", dest: destPath },
  }, {
    "stdout": "null",
  });
  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
  }

  return status;
}
