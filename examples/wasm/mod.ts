import { join } from "../../trellis/deps.ts";
import { build, Image, run, save } from "../../trellis/mod.ts";

const MANIFEST = "./manifest.txt";

const buildStage = Image.from("rust:1.63")
  .run("rustup target add wasm32-wasi")
  .copy("./hello-world", ".")
  .run("cargo build --target wasm32-wasi --tests")
  .run(`cargo test -- --list --format terse > ${MANIFEST}`);

const wasmArtifact = buildStage.saveArtifact(
  "./target/wasm32-wasi/debug/deps/",
);

const manifestArtifact = buildStage.saveArtifact(MANIFEST);

const wasmtimeStage = Image.from("ubuntu:latest")
  .aptInstall(["curl", "ca-certificates", "xz-utils"])
  .run("curl https://wasmtime.dev/install.sh -sSf | bash")
  .copyArtifact(wasmArtifact, "./");

export default async function runTests() {
  // Get the list of tests from the manifest.
  const tempDirPath = await Deno.makeTempDir();
  await save(manifestArtifact, tempDirPath);
  const data = await Deno.readTextFile(join(tempDirPath, MANIFEST));
  const tests = data.trim().split("\n").map((test: string) =>
    test.substring(0, test.length - ": test".length)
  );

  // Build the base image.
  await build(wasmtimeStage);

  // Run each test.
  await Promise.all(tests.map((test) =>
    run(
      Image.from(wasmtimeStage).run(
        `/root/.wasmtime/bin/wasmtime ./hello_world-*.wasm ${test}`,
      ),
    )
  ));
}
