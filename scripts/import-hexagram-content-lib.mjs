import { execFileSync } from "node:child_process";

export function readFileAtRevision(directory, revision, relativePath) {
  return execFileSync("git", ["-C", directory, "show", `${revision}:${relativePath}`], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}
