import { spawn } from "child_process";
import * as fs from "fs";
import { temporaryFile } from "tempy";
import { solve } from "./buildkit.js";
import { BuiltImage, Image } from "./image.js";
import { Task } from "./task.js";

export async function build(image: Image): Promise<BuiltImage> {
  const dockerfilePath = temporaryFile({ name: "Dockerfile" });
  fs.writeFileSync(dockerfilePath, solve(image));

  // Build the Docker image.
  const tag = "typekit:latest";
  return new Promise((resolve, reject) => {
    const process = spawn(
      "docker",
      ["build", "-t", tag, "-f", dockerfilePath, ".."],
      {
        stdio: "inherit",
      }
    );
    process.on("close", () => {
      resolve(new BuiltImage(tag));
    });
    process.on("error", (err) => {
      reject(err);
    });
  });
}

export async function run(task: Task, image: BuiltImage): Promise<number> {
  return new Promise((resolve, reject) => {
    const process = spawn(
      "docker",
      ["run", "-t", image.tag, ...task.instruction],
      {
        stdio: "inherit",
      }
    );
    process.on("close", (code) => {
      resolve(code);
    });
    process.on("error", (err) => {
      reject(err);
    });
  });
}
