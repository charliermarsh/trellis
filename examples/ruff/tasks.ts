import { build, Image, run } from "../../trellis/mod.ts";
import { Cargo } from "./commands.ts";
import { buildStage } from "./mod.ts";

export default async function runChecks() {
  await build(buildStage);
  await run(
    Image.from(buildStage).with(
      Cargo("fmt --locked --check"),
    ),
  );
  await run(
    Image.from(buildStage).with(
      Cargo("test --locked"),
    ),
  );
  await run(
    Image.from(buildStage).with(
      Cargo("clippy --locked -- -D warnings"),
    ),
  );
}
