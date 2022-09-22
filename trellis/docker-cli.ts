/**
 * Low-level interface to the Docker CLI.
 */

import { commandFor, Engine } from "./engine.ts";

/**
 * Run `docker buildx build`.
 */
export async function dockerBuild(
  engine: Engine,
  path: string,
  dockerfile: string,
  flags: {
    tag?: string;
    quiet?: boolean;
    rm?: boolean;
    push?: boolean;
    output?: { type: "local"; dest: string };
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
      ...commandFor(engine),
      ...(flags.push ? ["--push"] : []),
      ...(flags.quiet ? ["--quiet"] : []),
      ...(flags.rm ? ["--rm"] : []),
      ...(flags.tag ? ["-t", flags.tag] : []),
      ...(flags.output
        ? ["--output", `type=${flags.output.type},dest=${flags.output.dest}`]
        : []),
      "-f",
      dockerfile,
      path,
    ],
    env: {
      "DOCKER_BUILDKIT": "1",
      "DOCKER_SCAN_SUGGEST": "false",
    },
    ...options,
  });
  return await process.status();
}
