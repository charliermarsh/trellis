import { Config, defineConfig } from "./config.ts";
import { Command } from "./commands.ts";
import { build, run, save } from "./docker.ts";
import { Image } from "./image.ts";
import {
  Arg,
  Cmd,
  Copy,
  Entrypoint,
  Env,
  Expose,
  Label,
  Run,
  Shell,
  User,
  Volume,
  WorkDir,
} from "./instructions.ts";
import { solve } from "./solver.ts";

export {
  Arg,
  build,
  Cmd,
  Command,
  Copy,
  defineConfig,
  Entrypoint,
  Env,
  Expose,
  Image,
  Label,
  Run,
  run,
  save,
  Shell,
  solve,
  User,
  Volume,
  WorkDir,
};

export type { Config };
