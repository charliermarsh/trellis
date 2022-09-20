import { build, Image, run } from "../../trellis/index.ts";
import { devStage } from "./mod.ts";

export default async function runChecks() {
  const image = await build(devStage);

  const checkFormat = Image.from(image).run(
    "cargo fmt --check",
  );
  const checkLint = Image.from(image).run(
    "cargo clippy -- -D warnings",
  );
  const checkTests = Image.from(image).run(
    "cargo test",
  );

  await Promise.all([
    run(checkFormat),
    run(checkLint),
    run(checkTests),
  ]);
}
