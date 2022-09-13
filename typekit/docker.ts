import { join } from "https://deno.land/std/path/mod.ts";
import { solve } from "./solver.ts";
import { BuiltImage, Image } from "./image.ts";
import { Task } from "./task.ts";

export async function build(image: Image): Promise<BuiltImage> {
  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  // Build the Docker image.
  const tag = "typekit:latest";
  const process = Deno.run({
    cmd: ["docker", "build", "-t", tag, "-f", tempFilePath, ".."],
  });
  await process.status();
  return new BuiltImage(tag);
}

export async function run(
  task: Task,
  image: BuiltImage,
): Promise<Deno.ProcessStatus> {
  // Run a command within a Docker image.
  const process = Deno.run({
    cmd: ["docker", "run", "-t", image.tag, ...task.instruction],
  });
  return await process.status();
}
