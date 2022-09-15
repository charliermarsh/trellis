import {
  bold,
  cyan,
  green,
  red,
  white,
} from "https://deno.land/std@0.156.0/fmt/colors.ts";
import { existsSync } from "https://deno.land/std@0.156.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.156.0/path/mod.ts";
import { Image } from "./image.ts";

type Module = {
  [K: string]:
    | Image
    | ((options: { [K: string]: string | boolean | number }) => void);
};

/**
 * Load a TypeScript module.
 */
export async function loadModule(file: string): Promise<Module> {
  const buildFile = join(Deno.cwd(), file);
  if (!existsSync(buildFile)) {
    console.error(
      `${red(bold("error"))}: ${white("File not found:")} ${buildFile}`,
    );
    Deno.exit(1);
  }

  try {
    return await import(buildFile);
  } catch (err) {
    console.error(
      `${red(bold("error"))}: ${white("Failed to import:")} ${buildFile}`,
    );
    console.error();
    console.error(err);
    Deno.exit(1);
  }
}

/**
 * Log all available Image targets in a file.
 */
export function showImages(file: string, exportNames: string[]) {
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

/**
 * Log all available Task targets in a file.
 */
export function showTasks(file: string, exportNames: string[]) {
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

/**
 * Log all available targets in a file by parsing the module exports.
 */
export function showTargets(file: string, module: Module) {
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