#!/usr/bin/env deno

import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { Command } from "https://deno.land/x/cmd@v1.2.0/commander/index.ts";
import { solve } from "./core/buildkit.ts";
import { bold, red, white } from "https://deno.land/std@0.154.0/fmt/colors.ts";

async function main() {
  const program = new Command("typekit");
  program.usage("-f typekit.ts");
  program.version("0.0.1");
  program
    .option(
      "-f, --file <FILE>",
      "path to local TypeKit file (default: typekit.ts)",
    )
    .option("-t, --target <TARGET>", "target to build within the TypeKit file");

  const options = program.parse();

  const buildFile = join(Deno.cwd(), options.file);
  if (!existsSync(buildFile)) {
    console.error(
      `${red(bold("error"))}: ${white("File not found:")} ${buildFile}`,
    );
    return;
  }

  let module;
  try {
    module = await import(buildFile);
  } catch (err) {
    console.error(
      `${red(bold("error"))}: ${white("Failed to import:")} ${buildFile}`,
    );
    console.error();
    console.error(err);

    return;
  }

  const target = module[options.target || "default"];
  if (target == null) {
    if (options.target) {
      console.error(
        `${red(bold("error"))}: ${
          white(`Export \`${options.target}\` not found in ${buildFile}`)
        }`,
      );
    } else {
      console.error(
        `${red(bold("error"))}: ${
          white(`No default export found in ${buildFile}`)
        }`,
      );
    }

    return;
  }

  console.log(solve(target));
}

if (import.meta.main) {
  main();
}
