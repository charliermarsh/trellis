# runc

Using Trellis to generate container specification files via
[`runc`](https://github.com/opencontainers/runc).

## Usage

To generate the `busybox` rootfs, run:

```shell
make init
```

Then, to generate a specification file for `busybox`, run:

```shell
trellis run
```
