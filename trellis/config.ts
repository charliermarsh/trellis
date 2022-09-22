import { dirname, existsSync, join } from "./deps.ts";
import { Engine } from "./engine.ts";

export type Config = {
  engine: Engine;
};

function defaultConfig(): Config {
  return { engine: "docker" };
}

export function defineConfig(config: Partial<Config>): Config {
  return { ...defaultConfig(), ...config };
}

/**
 * Find the `trellis.config.ts` file in the nearest parent directory (or `null`).
 */
function findConfig(): string | null {
  let cwd = Deno.cwd();
  if (existsSync(join(cwd, "trellis.config.ts"))) {
    return join(cwd, "trellis.config.ts");
  }

  while (cwd !== dirname(cwd)) {
    cwd = dirname(cwd);
    if (existsSync(join(cwd, "trellis.config.ts"))) {
      return join(cwd, "trellis.config.ts");
    }
  }
  return null;
}

/**
 * Load the Trellis configuration based on the current working directory.
 */
export async function loadConfig(): Promise<Config> {
  const path = findConfig();
  if (path == null) {
    return defaultConfig();
  } else {
    const module = await import(`file://${path}`);
    return module["default"] as Config;
  }
}
