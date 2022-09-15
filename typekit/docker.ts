/**
 * High-level interface to the Docker CLI.
 */
import { join } from "https://deno.land/std@0.156.0/path/mod.ts";
import { bold, red, white } from "https://deno.land/std@0.156.0/fmt/colors.ts";
import Kia from "https://deno.land/x/kia@0.4.1/kia.ts";
import { dockerBuild, dockerPush } from "./docker-cli.ts";
import { Image } from "./image.ts";
import { Run } from "./instructions.ts";
import { solve } from "./solver.ts";

export async function build(image: Image): Promise<string> {
  if (image.tag == null) {
    console.error(
      `${red(bold("error"))}: ${
        white(
          "Unable to build image without a tag. " +
            "Provide a tag for the image via `.withTag(...)`.",
        )
      }`,
    );
    Deno.exit(1);
  }

  const kia = new Kia({ text: `Build: ${image.tag}` });
  kia.start();

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  const status = await dockerBuild("..", tempFilePath, { tag: image.tag });
  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
  }

  return image.tag;
}

export async function push(image: Image): Promise<Deno.ProcessStatus> {
  if (image.tag == null) {
    console.error(
      `${red(bold("error"))}: ${
        white(
          "Unable to push image without a tag. " +
            "Provide a tag for the image via `.withTag(...)`.",
        )
      }`,
    );
    Deno.exit(1);
  }

  const kia = new Kia({ text: `Push: ${image.tag}` });
  kia.start();

  // Push the built Docker image.
  const status = await dockerPush(image.tag);
  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
  }

  return status;
}

export async function run(image: Image): Promise<Deno.ProcessStatus> {
  const layer = image.layers[image.layers.length - 1];
  const kia = new Kia({
    text: layer instanceof Run ? `Run: ${layer.sh}` : "Run task",
  });
  kia.start();

  const tempDirPath = await Deno.makeTempDir();
  const tempFilePath = join(tempDirPath, "Dockerfile");
  await Deno.writeTextFile(tempFilePath, solve(image));

  const status = await dockerBuild("..", tempFilePath, { quiet: true }, {
    "stdout": "null",
  });
  if (status.success) {
    kia.succeed();
  } else {
    kia.fail();
  }

  return status;
}
