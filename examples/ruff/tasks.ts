import { build, Image, run } from "../../trellis/mod.ts";
import { Cargo } from "./commands.ts";
import { buildStage } from "./mod.ts";

export default async function runChecks() {
  await build(buildStage);
  await run(
    Image.from(buildStage).with(
      new Cargo("fmt --locked --check"),
    ),
  );
  await run(
    Image.from(buildStage).with(
      new Cargo("test --locked"),
    ),
  );
  await run(
    Image.from(buildStage).with(
      new Cargo("clippy --locked -- -D warnings"),
    ),
  );
}
