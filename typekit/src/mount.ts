// TODO(charlie): Implement other mount types.
export type Mount = {
  type: "cache";
  target: string;
  from?: string;
  gid?: number;
  id?: string;
  mode?: string;
  readOnly?: boolean;
  sharing?: "shared" | "private" | "locked";
  source?: string;
  uid?: number;
};

export function serialize(mount: Mount): string {
  switch (mount.type) {
    case "cache": {
      const { from, gid, id, mode, readOnly, sharing, source, target, uid } =
        mount;
      return [
        `type=cache`,
        `target=${target}`,
        from != null ? `from=${from}` : null,
        gid != null ? `gid=${gid}` : null,
        id != null ? `id=${id}` : null,
        mode != null ? `mode=${mode}` : null,
        readOnly ? "readonly" : null,
        sharing != null ? `sharing=${sharing}` : null,
        source != null ? `source=${source}` : null,
        uid != null ? `uid=${uid}` : null,
      ]
        .filter((part) => part != null)
        .join(",");
    }
  }
}
