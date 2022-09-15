/**
 * Low-level interface to the Docker CLI.
 */
import { join } from "https://deno.land/std@0.156.0/path/mod.ts";
import Kia from "https://deno.land/x/kia@0.4.1/kia.ts";
import { Image } from "./image.ts";
import { Run } from "./instructions.ts";
import { solve } from "./solver.ts";

/**
 * Run `docker build`.
 */
export async function dockerBuild(
  path: string,
  dockerfile: string,
  flags: {
    tag?: string;
    quiet?: boolean;
  },
  options?: {
    stdout?: "inherit" | "piped" | "null" | number;
    stderr?: "inherit" | "piped" | "null" | number;
    stdin?: "inherit" | "piped" | "null" | number;
  },
): Promise<Deno.ProcessStatus> {
  // Build the Docker image.
  const process = Deno.run({
    cmd: [
      "docker",
      "build",
      ...(flags.quiet ? ["--quiet"] : []),
      ...(flags.tag ? ["-t", flags.tag] : []),
      "-f",
      dockerfile,
      path,
    ],
    env: {
      "DOCKER_SCAN_SUGGEST": "false",
    },
    ...options,
  });
  return await process.status();
}

/**
 * Run `docker push`.
 */
export async function dockerPush(nameTag: string, options?: {
  stdout?: "inherit" | "piped" | "null" | number;
  stderr?: "inherit" | "piped" | "null" | number;
  stdin?: "inherit" | "piped" | "null" | number;
}): Promise<Deno.ProcessStatus> {
  // Push the built Docker image.
  const process = Deno.run({
    cmd: ["docker", "push", nameTag],
    env: {
      "DOCKER_SCAN_SUGGEST": "false",
    },
    ...options,
  });
  return await process.status();
}

export async function run(image: Image): Promise<Deno.ProcessStatus> {
  let text = "Run task";
  const layer = image.layers[image.layers.length - 1];
  if (layer instanceof Run) {
    text = `Run: ${layer.sh}`;
  }
  const kia = new Kia({
    text,
  });
  kia.start();

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  // Build the Docker image.
  const process = Deno.run({
    cmd: ["docker", "build", "--quiet", "-f", tempFilePath, ".."],
    env: {
      "DOCKER_SCAN_SUGGEST": "false",
    },
    stdout: "null",
  });
  const status = await process.status();

  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
  }

  return status;
}
