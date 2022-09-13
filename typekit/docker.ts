import { join } from "https://deno.land/std/path/mod.ts";
import { Image } from "./image.ts";
import { solve } from "./solver.ts";

export async function build(image: Image, tag: string): Promise<string> {
  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  // Build the Docker image.
  const process = Deno.run({
    cmd: [
      "docker",
      "build",
      ...(tag ? ["-t", tag] : []),
      "-f",
      tempFilePath,
      "..",
    ],
    env: {
      "DOCKER_SCAN_SUGGEST": "false",
    },
  });
  await process.status();
  return tag;
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
