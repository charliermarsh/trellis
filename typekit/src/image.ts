import { Codegen } from "./codegen.js";
import { AptInstall } from "./commands.js";
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
} from "./instructions.js";
import { Mount } from "./mount.js";
import { EnvVars } from "./types.js";

let counter = 0;

export class Image implements Codegen {
  name: string;
  source: string;
  layers: Codegen[];
  dependencies: Image[];

  constructor(
    name: string,
    source: string,
    layers: Codegen[],
    dependencies: Image[]
  ) {
    this.name = name;
    this.source = source;
    this.layers = layers;
    this.dependencies = dependencies;
  }

  static from(source: string | Image): Image {
    return new Image(
      `stage-${counter++}`,
      typeof source === "string" ? source : source.name,
      [],
      typeof source === "string" ? [] : [source]
    );
  }

  with(layer: Codegen): Image {
    return new Image(
      this.name,
      this.source,
      [...this.layers, layer],
      this.dependencies
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

  copy(source: string, destination: string): Image {
    return this.with(new Copy(source, destination));
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
    return this.with(new AptInstall(dependencies));
  }

  /**
   * Artifact API.
   */
  saveArtifact(fileName: string): Artifact {
    return new Artifact(this, fileName);
  }

  copyArtifact(artifact: Artifact, destination: string): Image {
    return new Image(
      this.name,
      this.source,
      [
        ...this.layers,
        new Copy(artifact.fileName, destination, artifact.source),
      ],
      [...this.dependencies, artifact.source]
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
