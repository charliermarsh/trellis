import { join } from "https://deno.land/std/path/mod.ts";
import { Image } from "./image.ts";
import { solve } from "./solver.ts";

export async function build(image: Image): Promise<string> {
  if (image.tag == null) {
    throw Error("Provide a tag for the image via `.withTag(...)`.");
  }

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  // Build the Docker image.
  const process = Deno.run({
    cmd: [
      "docker",
      "build",
      "-t",
      image.tag,
      "-f",
      tempFilePath,
      "..",
    ],
    env: {
      "DOCKER_SCAN_SUGGEST": "false",
    },
  });
  await process.status();
  return image.tag;
}

export async function push(image: Image): Promise<Deno.ProcessStatus> {
  if (image.tag == null) {
    throw Error("Provide a tag for the image via `.withTag(...)`.");
  }

  // Push the built Docker image.
  const process = Deno.run({
    cmd: ["docker", "push", image.tag],
    env: {
      "DOCKER_SCAN_SUGGEST": "false",
    },
  });
  return await process.status();
}

export async function run(image: Image): Promise<Deno.ProcessStatus> {
  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  // Build the Docker image.
  const process = Deno.run({
    cmd: ["docker", "build", "--quiet", "-f", tempFilePath, ".."],
    env: {
      "DOCKER_SCAN_SUGGEST": "false",
    },
  });
  return await process.status();
}
