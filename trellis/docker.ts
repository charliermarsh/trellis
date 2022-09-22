/**
 * High-level interface to the Docker CLI.
 */
import { useContext } from "./context.ts";
import { join, Kia, Sha256 } from "./deps.ts";
import { dockerBuild } from "./docker-cli.ts";
import { Artifact, Image, taskNameFor } from "./image.ts";
import { solve } from "./solver.ts";

/**
 * Build an image.
 */
export async function build(image: Image, push?: boolean): Promise<string> {
  const tag = image.tag
    ? image.tag
    : `trellis/${new Sha256().update(solve(image)).hex()}`;

  const kia = new Kia({ text: `Build: ${tag}` });
  if (!(Deno.env.get("CI") === "true")) kia.start();

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  const { engine } = useContext();
  const status = await dockerBuild(engine, ".", tempFilePath, {
    tag: tag,
    push: push,
  });

  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
    throw Error(`Failed to build ${tag}`);
  }

  return tag;
}

/**
 * "Run" an image. This consists of building the image silently without tags.
 */
export async function run(image: Image): Promise<Deno.ProcessStatus> {
  const taskName = taskNameFor(image);
  const kia = new Kia({
    text: taskName ? `Run: ${taskName}` : "Run task",
  });
  if (!(Deno.env.get("CI") === "true")) kia.start();

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  const { engine } = useContext();
  const status = await dockerBuild(
    engine,
    ".",
    tempFilePath,
    { quiet: false },
    {
      "stdout": "null",
    },
  );

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

  const { engine } = useContext();
  const status = await dockerBuild(engine, ".", tempFilePath, {
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
