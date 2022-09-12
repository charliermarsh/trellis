#!/usr/bin/env ts-node-script --esm

import chalk from "chalk";
import { spawn } from "child_process";
import { Command } from "commander";
import * as fs from "fs";
import * as Module from "module";
import * as path from "path";
import { temporaryFile } from "tempy";
import { solve } from "./buildkit.js";
import { build } from "./docker";
import { Image } from "./image.js";

/**
 * Load a TypeScript module.
 */
async function loadModule(file: string): Promise<Module | null> {
  const buildFile = path.join(process.cwd(), file);
  if (!fs.existsSync(buildFile)) {
    console.error(
      `${chalk.red(chalk.bold("error"))}: ${chalk.white(
        "File not found:"
      )} ${buildFile}`
    );
    return null;
  }

  try {
    return await import(buildFile);
  } catch (err) {
    console.error(
      `${chalk.red(chalk.bold("error"))}: ${chalk.white(
        "Failed to import:"
      )} ${buildFile}`
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
        console.log(`- ${chalk.bold(chalk.green(taskName))}`);
      } else {
        console.log(`- ${chalk.green(taskName)}`);
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
        `${chalk.red(chalk.bold("error"))}: ${chalk.white(
          `Export \`${target}\` not found in ${file}`
        )}`
      );
    } else {
      console.error(
        `${chalk.red(chalk.bold("error"))}: ${chalk.white(
          `No default export found in ${file}`
        )}`
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
        `${chalk.red(chalk.bold("error"))}: ${chalk.white(
          `Export \`${target}\` not found in ${file}`
        )}`
      );
    } else {
      console.error(
        `${chalk.red(chalk.bold("error"))}: ${chalk.white(
          `No default export found in ${file}`
        )}`
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
      "build.ts"
    )
    .option("-t, --target <TARGET>", "target to build within the TypeKit file")
    .action((options) => previewCommand(options.file, options.target));

  program
    .command("build")
    .description("Build a Dockerfile to execute a specified task")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: build.ts)",
      "build.ts"
    )
    .option("-t, --target <TARGET>", "target to build within the TypeKit file")
    .action((options) => buildCommand(options.file, options.target));

  program
    .command("ls")
    .description("List all tasks available in a specified typekit file")
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: build.ts)",
      "build.ts"
    )
    .action((options) => lsCommand(options.file));

  await program.parseAsync(process.argv);
}

await main();
