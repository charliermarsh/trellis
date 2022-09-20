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
    rm?: boolean;
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
      "depot",
      "build",
        "--load",
        "--project",
        'fmnn23f0bz',
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
    cmd: ["depot", "push", nameTag],
    env: {
      "DOCKER_BUILDKIT": "1",
      "DOCKER_SCAN_SUGGEST": "false",
    },
    ...options,
  });
  return await process.status();
}
