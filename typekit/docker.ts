/**
 * Interface to the Docker CLI.
 */
import { join } from "https://deno.land/std@0.156.0/path/mod.ts";
import { bold, red, white } from "https://deno.land/std@0.156.0/fmt/colors.ts";
import { Image } from "./image.ts";
import { solve } from "./solver.ts";

export async function build(image: Image): Promise<string> {
  if (image.tag == null) {
    console.error(
      `${red(bold("error"))}: ${
        white(
          "Unable to build image without a tag. Provide a tag for the image via `.withTag(...)`.",
        )
      }`,
    );
    Deno.exit(1);
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
    console.error(
      `${red(bold("error"))}: ${
        white(
          "Unable to push image without a tag. Provide a tag for the image via `.withTag(...)`.",
        )
      }`,
    );
    Deno.exit(1);
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
