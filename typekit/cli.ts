#!/usr/bin/env deno
import { parse } from "https://deno.land/std@0.156.0/flags/mod.ts";
import {
  bold,
  cyan,
  green,
  red,
  white,
} from "https://deno.land/std@0.156.0/fmt/colors.ts";
import { Sha256 } from "https://deno.land/std@0.156.0/hash/sha256.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/commander/index.ts";
import { loadModule, showImages, showTargets, showTasks } from "./cli-utils.ts";
import { build, push } from "./docker.ts";
import { Image } from "./image.ts";
import { solve } from "./solver.ts";

/**
 * List the buildable Images and runnable Tasks in a TypeKit file.
 */
async function lsCommand(file: string) {
  const module = await loadModule(file);

  const images = Object.entries(module).filter(([, root]) =>
    root instanceof Image
  ).map(([taskName]) => taskName);
  if (images.length > 0) {
    console.log(green("Images:"));
    showImages(file, images);
  }

  const tasks = Object.entries(module).filter(([, root]) =>
    typeof root === "function"
  ).map(([taskName]) => taskName);
  if (tasks.length > 0) {
    console.log(cyan("Tasks:"));
    showTasks(file, tasks);
  }
}

/**
 * Preview the Dockerfile for an Image defined in a TypeKit file.
 */
async function previewCommand(file: string, target?: string) {
  const module = await loadModule(file);

  const exportedTarget = module[target || "default"];
  if (exportedTarget == null) {
    if (target) {
      console.error(
        `${red(bold("error"))}: ${
          white(
            `Export \`${target}\` not found in ${file}`,
          )
        }`,
      );
    } else {
      console.error(
        `${red(bold("error"))}: ${white(`No default export found in ${file}`)}`,
      );
    }
    showTargets(file, module);
    Deno.exit(1);
  }

  if (!(exportedTarget instanceof Image)) {
    if (target) {
      console.error(
        `${red(bold("error"))}: ${
          white(
            `Export \`${target}\` is not an Image`,
          )
        }`,
      );
    } else {
      console.error(
        `${red(bold("error"))}: ${white(`Default export is not an Image`)}`,
      );
    }
    showTargets(file, module);
    Deno.exit(1);
  }

  // Print out the resolved Dockerfile.
  console.log(solve(exportedTarget));
}

/**
 * Build an Image defined in a TypeKit file.
 */
async function buildCommand(
  file: string,
  target?: string,
  shouldPush?: boolean,
) {
  const module = await loadModule(file);

  const exportedTarget = module[target || "default"];
  if (exportedTarget == null) {
    if (target) {
      console.error(
        `${red(bold("error"))}: ${
          white(
            `Export \`${target}\` not found in ${file}`,
          )
        }`,
      );
    } else {
      console.error(
        `${red(bold("error"))}: ${white(`No default export found in ${file}`)}`,
      );
    }
    showTargets(file, module);
    Deno.exit(1);
  }

  if (!(exportedTarget instanceof Image)) {
    if (target) {
      console.error(
        `${red(bold("error"))}: ${
          white(
            `Export \`${target}\` is not an Image`,
          )
        }`,
      );
    } else {
      console.error(
        `${red(bold("error"))}: ${white(`Default export is not an Image`)}`,
      );
    }
    showTargets(file, module);
    Deno.exit(1);
  }

  // To build (and push), we need a tag. Generate one based on the file and target.
  let image = exportedTarget;
  if (image.tag == null) {
    const sha = new Sha256().update(Deno.cwd()).update(file).update(
      target || "default",
    ).hex();
    image = image.withTag(`typekit/${sha}`);
  }

  // Build (and push) the Docker image.
  try {
    await build(image);
    if (shouldPush) {
      await push(image);
    }
  } catch (e) {
    console.error(
      `${red(bold("error"))}: ${white(e.message)}`,
    );
    Deno.exit(1);
  }
}

/**
 * Run a Task defined in a TypeKit file.
 */
async function runCommand(file: string, target?: string) {
  const module = await loadModule(file);

  const exportedTarget = module[target || "default"];
  if (exportedTarget == null) {
    // TODO(charlie): List other Tasks in the file.
    if (target) {
      console.error(
        `${red(bold("error"))}: ${
          white(
            `Export \`${target}\` not found in ${file}`,
          )
        }`,
      );
    } else {
      console.error(
        `${red(bold("error"))}: ${white(`No default export found in ${file}`)}`,
      );
    }
    showTargets(file, module);
    Deno.exit(1);
  }

  if (typeof exportedTarget !== "function") {
    // TODO(charlie): List other Tasks in the file.
    if (target) {
      console.error(
        `${red(bold("error"))}: ${
          white(`Export \`${target}\` is not a runnable function`)
        }`,
      );
    } else {
      console.error(
        `${red(bold("error"))}: ${
          white(`Default export is not a runnable function`)
        }`,
      );
    }
    showTargets(file, module);
    Deno.exit(1);
  }

  // Extract options for the command.
  const parsedArgs = parse(Deno.args, { "--": true });
  const parsedSubArgs = parse(parsedArgs["--"]);

  // Build the Docker image.
  await exportedTarget(parsedSubArgs);
}

/**
 * Entrypoint to the typekit CLI.
 */
async function main() {
  const program = new Command("typekit");
  program.usage("build index.ts");
  program.version("0.0.1");

  program
    .command("ls [file]")
    .description("List all Images and Tasks available in a TypeKit file")
    .action((file: string | undefined) => {
      lsCommand(file || "index.ts");
    });

  program
    .command("preview [file]")
    .description("Preview a Dockerfile")
    .option("-t, --target <TARGET>", "Image to build within the TypeKit file")
    .action((file: string | undefined, options: { target?: string }) =>
      previewCommand(file || "index.ts", options.target)
    );

  program
    .command("build [file]")
    .description("Build an Image defined in a TypeKit file")
    .option("-t, --target <TARGET>", "Image to build within the TypeKit file")
    .option("--push", "Whether to push the image to a remote registry")
    .action((
      file: string | undefined,
      options: { target?: string; push?: boolean },
    ) => buildCommand(file || "index.ts", options.target, options.push));

  program
    .command("run [file]")
    .description("Run a Task defined in a TypeKit file")
    .option("-t, --target <TARGET>", "Task to run within the TypeKit file")
    .action((file: string | undefined, options: { target?: string }) =>
      runCommand(file || "index.ts", options.target)
    );

  await program.parseAsync(Deno.args);
}

if (import.meta.main) {
  await main();
}
