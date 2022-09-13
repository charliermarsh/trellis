#!/usr/bin/env deno
import {
  bold,
  green,
  red,
  white,
} from "https://deno.land/std@0.154.0/fmt/colors.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/commander/index.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { solve } from "./solver.ts";
import { build } from "./docker.ts";
import { Image } from "./image.ts";

/**
 * Load a TypeScript module.
 */
async function loadModule(file: string): Promise<any | null> {
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
 * List the buildable targets in a typekit file.
 */
async function lsCommand(file: string) {
  const module = await loadModule(file);
  if (module == null) {
    return;
  }

  for (const [taskName, root] of Object.entries(module)) {
    if (root instanceof Image) {
      if (taskName === "default") {
        console.log(`- ${bold(green(taskName))}`);
      } else {
        console.log(`- ${green(taskName)}`);
      }
    }
  }
}

/**
 * Preview the Dockerfile for a buildable target defined in a typekit file.
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

  // Print out the resolved Dockerfile.
  console.log(solve(exportedTarget));
}

/**
 * Build a target defined in a typekit file.
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

  // Build the Docker image.
  await build(exportedTarget);
}

/**
 * Entrypoint to the typekit CLI.
 */
async function main() {
  const program = new Command("typekit");
  program.usage("-f typekit.ts");
  program.version("0.0.1");

  program
    .command("preview")
    .description("Preview a Dockerfile")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: build.ts)",
      "build.ts",
    )
    .option("-t, --target <TARGET>", "target to build within the TypeKit file")
    .action((options: { file: string; target?: string }) =>
      previewCommand(options.file, options.target)
    );

  program
    .command("build")
    .description("Build a Dockerfile to execute a specified task")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: build.ts)",
      "build.ts",
    )
    .option("-t, --target <TARGET>", "target to build within the TypeKit file")
    .action((options: { file: string; target?: string }) =>
      buildCommand(options.file, options.target)
    );

  program
    .command("ls")
    .description("List all tasks available in a specified typekit file")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: build.ts)",
      "build.ts",
    )
    .action((options: { file: string }) => lsCommand(options.file));

  await program.parseAsync(Deno.args);
}

if (import.meta.main) {
  await main();
}
