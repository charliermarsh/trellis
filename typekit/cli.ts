#!/usr/bin/env deno
import { parse } from "https://deno.land/std@0.155.0/flags/mod.ts";
import {
  bold,
  cyan,
  green,
  red,
  white,
} from "https://deno.land/std@0.155.0/fmt/colors.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/commander/index.ts";
import { existsSync } from "https://deno.land/std@0.155.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.155.0/path/mod.ts";
import { solve } from "./solver.ts";
import { build } from "./docker.ts";
import { Image } from "./image.ts";

type Module = {
  [K: string]: Image | ((options: { [K: string]: any }) => void);
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

/**
 * List the buildable Images and runnable Tasks in a TypeKit file.
 */
async function lsCommand(file: string) {
  const module = await loadModule(file);
  if (module == null) {
    return;
  }

  const images = Object.entries(module).filter(([taskName, root]) =>
    root instanceof Image
  );
  if (images.length > 0) {
    console.log(green("Images:"));
    for (const [taskName, root] of images) {
      if (taskName === "default") {
        if (file === "index.ts") {
          console.log(`- ${bold(green(taskName))} (typekit build)`);
        } else {
          console.log(`- ${bold(green(taskName))} (typekit build -f ${file})`);
        }
      } else {
        if (file === "index.ts") {
          console.log(
            `- ${green(taskName)} (typekit build -t ${taskName})`,
          );
        } else {
          console.log(
            `- ${green(taskName)} (typekit build -f ${file} -t ${taskName})`,
          );
        }
      }
    }
  }

  const tasks = Object.entries(module).filter(([taskName, root]) =>
    typeof root === "function"
  );
  if (tasks.length > 0) {
    console.log(cyan("Tasks:"));
    for (const [taskName, root] of tasks) {
      if (taskName === "default") {
        if (file === "index.ts") {
          console.log(`- ${bold(cyan(taskName))} (typekit run)`);
        } else {
          console.log(`- ${bold(cyan(taskName))} (typekit run -f ${file})`);
        }
      } else {
        if (file === "index.ts") {
          console.log(
            `- ${cyan(taskName)} (typekit run -t ${taskName})`,
          );
        } else {
          console.log(
            `- ${cyan(taskName)} (typekit run -f ${file} -t ${taskName})`,
          );
        }
      }
    }
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
    return;
  }

  // Print out the resolved Dockerfile.
  console.log(solve(exportedTarget));
}

/**
 * Build an Image defined in a TypeKit file.
 */
async function buildCommand(file: string, target?: string) {
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
    return;
  }

  // Build the Docker image.
  await build(exportedTarget, "typekit:latest");
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
    return;
  }

  if (typeof exportedTarget !== "function") {
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
  program.usage("-f typekit.ts");
  program.version("0.0.1");

  program
    .command("ls")
    .description("List all Images and Tasks available in a TypeKit file")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: index.ts)",
      "index.ts",
    )
    .action((options: { file: string }) => lsCommand(options.file));

  program
    .command("preview")
    .description("Preview a Dockerfile")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: index.ts)",
      "index.ts",
    )
    .option("-t, --target <TARGET>", "Image to build within the TypeKit file")
    .action((options: { file: string; target?: string }) =>
      previewCommand(options.file, options.target)
    );

  program
    .command("build")
    .description("Build an Image defined in a TypeKit file")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: index.ts)",
      "index.ts",
    )
    .option("-t, --target <TARGET>", "Image to build within the TypeKit file")
    .action((options: { file: string; target?: string }) =>
      buildCommand(options.file, options.target)
    );

  program
    .command("run")
    .description("Run a Task defined in a TypeKit file")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: index.ts)",
      "index.ts",
    )
    .option("-t, --target <TARGET>", "Task to run within the TypeKit file")
    .action((options: { file: string; target?: string }) =>
      runCommand(options.file, options.target)
    );

  await program.parseAsync(Deno.args);
}

if (import.meta.main) {
  await main();
}
