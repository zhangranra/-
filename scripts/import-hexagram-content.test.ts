import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readFileAtRevision } from "./import-hexagram-content-lib.mjs";

describe("hexagram source importer", () => {
  it("reads the pinned revision instead of a dirty tracked source file", () => {
    const directory = mkdtempSync(join(tmpdir(), "guanyi-import-test-"));

    try {
      execFileSync("git", ["init", "--quiet", directory]);
      execFileSync("git", ["-C", directory, "config", "user.email", "test@example.com"]);
      execFileSync("git", ["-C", directory, "config", "user.name", "Guanyi Test"]);
      writeFileSync(join(directory, "source.txt"), "pinned content\n");
      execFileSync("git", ["-C", directory, "add", "source.txt"]);
      execFileSync("git", ["-C", directory, "commit", "--quiet", "-m", "fixture"]);
      const revision = execFileSync("git", ["-C", directory, "rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim();

      writeFileSync(join(directory, "source.txt"), "dirty content\n");

      expect(readFileAtRevision(directory, revision, "source.txt")).toBe("pinned content\n");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
