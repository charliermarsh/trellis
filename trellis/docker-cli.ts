/**
 * Low-level interface to the Docker CLI.
 */

/**
 * Run `docker build`.
 */
export async function dockerBuild(
  path: string,
  dockerfile: string,
  flags: {
    tag?: string;
    quiet?: boolean;
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
      "docker",
      "build",
      ...(flags.quiet ? ["--quiet"] : []),
      ...(flags.tag ? ["-t", flags.tag] : []),
      ...(flags.output
        ? ["--output", `type=${flags.output.type},dest=${flags.output.dest}`]
        : []),
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
