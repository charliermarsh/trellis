import { build, Image, run } from "../../trellis/mod.ts";
import { devStage } from "./mod.ts";

export default async function runChecks() {
  const checkFormat = Image.from(devStage).run(
    "cargo fmt --check",
  );
  const checkLint = Image.from(devStage).run(
    "cargo clippy -- -D warnings",
  );
  const checkTests = Image.from(devStage).run(
    "cargo test",
  );

  await build(devStage);
  await Promise.all([
    run(checkFormat),
    run(checkLint),
    run(checkTests),
  ]);
}
