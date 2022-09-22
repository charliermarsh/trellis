import { Codegen } from "./codegen.ts";
import { aptInstall } from "./commands.ts";
import {
  Arg,
  Cmd,
  Copy,
  Entrypoint,
  Env,
  Expose,
  Instruction,
  Label,
  Run,
  Shell,
  User,
  Volume,
  WorkDir,
} from "./instructions.ts";
import { Mount } from "./mount.ts";
import { EnvVars } from "./types.ts";

let counter = 0;

export class Image implements Codegen {
  name: string;
  source: string;
  tag: string | null;
  layers: Instruction[];
  dependencies: Image[];

  constructor(
    name: string,
    source: string,
    tag: string | null,
    layers: Instruction[],
    dependencies: Image[],
  ) {
    this.name = name;
    this.source = source;
    this.tag = tag;
    this.layers = layers;
    this.dependencies = dependencies;
  }

  static from(source: string | Image): Image {
    return new Image(
      `stage-${counter++}`,
      typeof source === "string" ? source : source.name,
      null,
      [],
      typeof source === "string" ? [] : [source],
    );
  }

  with(
    layers:
      | Instruction
      | Instruction[]
      | (() => Instruction)
      | (() => Instruction[]),
  ): Image {
    const resolved: Instruction | Instruction[] = typeof layers === "function" ? layers() : layers;
    return new Image(
      this.name,
      this.source,
      this.tag,
      [
        ...this.layers,
        ...(Array.isArray(resolved) ? resolved : [resolved]),
      ],
      this.dependencies,
    );
  }

  /**
   * Instructions.
   */
  run(sh: string, mount?: Mount[]): Image {
    return this.with(new Run(sh, mount));
  }

  cmd(instruction: string | string[]): Image {
    return this.with(new Cmd(instruction));
  }

  label(vars: EnvVars): Image {
    return this.with(new Label(vars));
  }

  expose(port: number): Image {
    return this.with(new Expose(port));
  }

  env(vars: EnvVars): Image {
    return this.with(new Env(vars));
  }

  copy(
    source: string,
    destination: string,
    chown?: { user: string; group: string },
  ): Image {
    return this.with(new Copy(source, destination, chown));
  }

  entrypoint(instruction: string | string[]): Image {
    return this.with(new Entrypoint(instruction));
  }

  volume(instruction: string | string[]): Image {
    return this.with(new Volume(instruction));
  }

  user(name: string, group?: string): Image {
    return this.with(new User(name, group));
  }

  workDir(dirName: string): Image {
    return this.with(new WorkDir(dirName));
  }

  arg(name: string, defaultValue?: string | number): Image {
    return this.with(new Arg(name, defaultValue));
  }

  shell(instruction: string[]): Image {
    return this.with(new Shell(instruction));
  }

  /**
   * Custom layers.
   */
  aptInstall(dependencies: string[]): Image {
    return this.with(aptInstall(dependencies));
  }

  /**
   * Tagging API.
   */
  withTag(tag: string): Image {
    return new Image(
      this.name,
      this.source,
      tag,
      this.layers,
      this.dependencies,
    );
  }

  /**
   * Artifact API.
   */
  saveArtifact(fileName: string): Artifact {
    return new Artifact(this, fileName);
  }

  copyArtifact(
    artifact: Artifact,
    destination: string,
    chown?: { user: string; group: string },
  ): Image {
    return new Image(
      this.name,
      this.source,
      this.tag,
      [
        ...this.layers,
        new Copy(artifact.fileName, destination, chown, artifact.source),
      ],
      [...this.dependencies, artifact.source],
    );
  }

  /**
   * Codegen API.
   */
  codegen(): string {
    return [
      `FROM ${this.source} AS ${this.name}`,
      ...this.layers.map((layer) => layer.codegen()),
    ].join("\n");
  }
}

export class Artifact {
  source: Image;
  fileName: string;

  constructor(source: Image, fileName: string) {
    this.source = source;
    this.fileName = fileName;
  }
}

export function taskNameFor(image: Image): string | null {
  const layer = image.layers[image.layers.length - 1];
  return layer instanceof Run ? layer.sh : null;
}
