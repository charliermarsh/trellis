#!/usr/bin/env deno
import { Sha256 } from "https://deno.land/std@0.156.0/hash/sha256.ts";
import { parse } from "https://deno.land/std@0.156.0/flags/mod.ts";
import {
  bold,
  cyan,
  green,
  red,
  white,
} from "https://deno.land/std@0.156.0/fmt/colors.ts";
import { existsSync } from "https://deno.land/std@0.156.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.156.0/path/mod.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/commander/index.ts";
import { build as buildImage, push as pushImage } from "./docker.ts";
import { Image } from "./image.ts";
import { solve } from "./solver.ts";

type Module = {
  [K: string]:
    | Image
    | ((options: { [K: string]: string | boolean | number }) => void);
};

/**
 * Load a TypeScript module.
 */
async function loadModule(file: string): Promise<Module | null> {
  const buildFile = join(Deno.cwd(), file);
  if (!existsSync(buildFile)) {
    console.error(
      `${red(bold("error"))}: ${white("File not found:")} ${buildFile}`,
    );
    return null;
  }

  try {
    return await import(buildFile);
  } catch (err) {
    console.error(
      `${red(bold("error"))}: ${white("Failed to import:")} ${buildFile}`,
    );
    console.error();
    console.error(err);
    return null;
  }
}

function showImages(file: string, exportNames: string[]) {
  for (const exportName of exportNames) {
    if (exportName === "default") {
      if (file === "index.ts") {
        console.log(`- ${bold(green(exportName))} (typekit build)`);
      } else {
        console.log(`- ${bold(green(exportName))} (typekit build ${file})`);
      }
    } else {
      if (file === "index.ts") {
        console.log(
          `- ${green(exportName)} (typekit build --target ${exportName})`,
        );
      } else {
        console.log(
          `- ${
            green(exportName)
          } (typekit build ${file} --target ${exportName})`,
        );
      }
    }
  }
}

function showTasks(file: string, exportNames: string[]) {
  for (const exportName of exportNames) {
    if (exportName === "default") {
      if (file === "index.ts") {
        console.log(`- ${bold(cyan(exportName))} (typekit run)`);
      } else {
        console.log(`- ${bold(cyan(exportName))} (typekit run ${file})`);
      }
    } else {
      if (file === "index.ts") {
        console.log(
          `- ${cyan(exportName)} (typekit run --target ${exportName})`,
        );
      } else {
        console.log(
          `- ${cyan(exportName)} (typekit run ${file} --target ${exportName})`,
        );
      }
    }
  }
}

function showTargets(file: string, module: Module) {
  const images = Object.entries(module).filter(([, root]) =>
    root instanceof Image
  ).map(([exportName]) => exportName);
  const tasks = Object.entries(module).filter(([, root]) =>
    typeof root === "function"
  ).map(([exportName]) => exportName);
  if (images.length > 0 || tasks.length > 0) {
    console.log();
    console.log(white(`Found the following targets in ${file}:`));
    showImages(file, images);
    showTasks(file, tasks);
  }
}

/**
 * List the buildable Images and runnable Tasks in a TypeKit file.
 */
async function lsCommand(file: string) {
  const module = await loadModule(file);
  if (module == null) {
    return;
  }

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
  if (module == null) {
    return;
  }

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
    return;
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
    return;
  }

  // Print out the resolved Dockerfile.
  console.log(solve(exportedTarget));
}

/**
 * Build an Image defined in a TypeKit file.
 */
async function buildCommand(file: string, target?: string, push?: boolean) {
  const module = await loadModule(file);
  if (module == null) {
    return;
  }

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
    return;
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
    return;
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
  await buildImage(image);
  if (push) {
    await pushImage(image);
  }
}

/**
 * Run a Task defined in a TypeKit file.
 */
async function runCommand(file: string, target?: string) {
  const module = await loadModule(file);
  if (module == null) {
    return;
  }

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
    return;
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
    return;
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
