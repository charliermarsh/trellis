import { Config, defineConfig } from "./config.ts";
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
import { id } from "./mount.ts";
import { solve } from "./solver.ts";

export {
  Arg,
  build,
  Cmd,
  Copy,
  defineConfig,
  Entrypoint,
  Env,
  Expose,
  id,
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
