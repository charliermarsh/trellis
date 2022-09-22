import { Env, Run } from "../../../trellis/mod.ts";

export function InstallRustToolchain(version: string) {
  return [
    new Env({
      CARGO_HOME: "/",
      RUSTUP_HOME: "/",
    }),
    new Run(
      `curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain ${version}`,
    ),
  ];
}

export function Cargo(subCommand: string) {
  return [
    new Run(`cargo ${subCommand}`, [
      {
        type: "cache",
        target: "/.cargo/registry",
        sharing: "locked",
      },
    ]),
  ];
}
