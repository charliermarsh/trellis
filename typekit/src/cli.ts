#!/usr/bin/env ts-node-script --esm

import chalk from "chalk";
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { solve } from "./buildkit.js";

async function main() {
  const program = new Command("typekit");
  program.usage("-f typekit.ts");
  program.version("0.0.1");
  program
    .requiredOption(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: build.ts)",
      "build.ts"
    )
    .option("-t, --target <TARGET>", "target to build within the TypeKit file");

  program.parse();

  const options = program.opts<{ file: string; target?: string }>();

  const buildFile = path.join(process.cwd(), options.file);
  if (!fs.existsSync(buildFile)) {
    console.error(
      `${chalk.red(chalk.bold("error"))}: ${chalk.white(
        "File not found:"
      )} ${buildFile}`
    );
    return;
  }

  let module;
  try {
    module = await import(buildFile);
  } catch (err) {
    console.error(
      `${chalk.red(chalk.bold("error"))}: ${chalk.white(
        "Failed to import:"
      )} ${buildFile}`
    );
    console.error();
    console.error(err);
    return;
  }

  const target = module[options.target || "default"];
  if (target == null) {
    if (options.target) {
      console.error(
        `${chalk.red(chalk.bold("error"))}: ${chalk.white(
          `Export \`${options.target}\` not found in ${buildFile}`
        )}`
      );
    } else {
      console.error(
        `${chalk.red(chalk.bold("error"))}: ${chalk.white(
          `No default export found in ${buildFile}`
        )}`
      );
    }
    return;
  }

  console.log(solve(target));
}

main();
