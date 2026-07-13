import { describe, expect, it } from "vitest";
import type { ReadingDomain } from "../reading/domain-profiles";
import {
  loadDraft,
  loadRecentReadings,
  saveDraft,
  saveRecentReading,
  type CastingDraft,
  type RecentReading,
  type StorageLike,
} from "./reading-store";

const DRAFT_KEY = "guanyi:casting-draft:v1";
const RECENT_KEY = "guanyi:recent-readings:v1";

class MemoryStorage implements Storage {
  readonly #items = new Map<string, string>();

  get length() {
    return this.#items.size;
  }

  clear() {
    this.#items.clear();
  }

  getItem(key: string) {
    return this.#items.get(key) ?? null;
  }

  key(index: number) {
    return [...this.#items.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.#items.delete(key);
  }

  setItem(key: string, value: string) {
    this.#items.set(key, value);
  }
}

const draft: CastingDraft = {
  question: "是否适合推进这个项目？",
  domain: "career",
  values: [9, 7, 8],
  timestamp: 1_789_000_000_000,
};

function recent(index: number, domain: ReadingDomain = "career"): RecentReading {
  return {
    question: `问题 ${index}`,
    domain,
    values: [9, 7, 8, 6, 7, 8],
    timestamp: 1_789_000_000_000 + index,
    originalSequence: index + 1,
    changedSequence: index + 2,
  };
}

describe("reading store", () => {
  it("round-trips a casting draft under the versioned key", () => {
    const storage = new MemoryStorage();

    saveDraft(storage, draft);

    expect(loadDraft(storage)).toEqual(draft);
    expect(storage.getItem(DRAFT_KEY)).not.toBeNull();
  });

  it("persists only approved draft fields", () => {
    const storage = new MemoryStorage();
    const draftWithExtra = { ...draft, privateNote: "do not persist" };

    saveDraft(storage, draftWithExtra);

    expect(JSON.parse(storage.getItem(DRAFT_KEY) ?? "null")).toEqual(draft);
  });

  it("returns null for malformed or invalid draft data", () => {
    const storage = new MemoryStorage();
    storage.setItem(DRAFT_KEY, "not-json");
    expect(loadDraft(storage)).toBeNull();

    storage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, domain: "unknown" }));
    expect(loadDraft(storage)).toBeNull();
  });

  it.each([
    ["negative", -1],
    ["fractional", 1_789_000_000_000.5],
    ["out-of-range", 8_640_000_000_000_001],
  ])("rejects a %s draft timestamp before it reaches date rendering", (_label, timestamp) => {
    const storage = new MemoryStorage();
    storage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, timestamp }));

    expect(loadDraft(storage)).toBeNull();
  });

  it("returns safe fallbacks when storage access throws", () => {
    const throwingStorage: StorageLike = {
      getItem() {
        throw new Error("storage unavailable");
      },
      setItem() {
        throw new Error("storage unavailable");
      },
    };

    expect(() => saveDraft(throwingStorage, draft)).not.toThrow();
    expect(saveRecentReading(throwingStorage, recent(0))).toBe(false);
    expect(loadDraft(throwingStorage)).toBeNull();
    expect(loadRecentReadings(throwingStorage)).toEqual([]);
  });

  it("returns true only after the complete recent-reading list is written", () => {
    const storage = new MemoryStorage();

    expect(saveRecentReading(storage, recent(0))).toBe(true);
    expect(loadRecentReadings(storage)).toEqual([recent(0)]);
  });

  it("keeps the ten newest recent readings under the versioned key", () => {
    const storage = new MemoryStorage();

    for (let index = 0; index < 12; index += 1) {
      saveRecentReading(storage, recent(index));
    }

    const records = loadRecentReadings(storage);
    expect(records).toHaveLength(10);
    expect(records.map((record) => record.question)).toEqual([
      "问题 11",
      "问题 10",
      "问题 9",
      "问题 8",
      "问题 7",
      "问题 6",
      "问题 5",
      "问题 4",
      "问题 3",
      "问题 2",
    ]);
    expect(storage.getItem(RECENT_KEY)).not.toBeNull();
  });

  it("returns an empty list for malformed or invalid recent data", () => {
    const storage = new MemoryStorage();
    storage.setItem(RECENT_KEY, "not-json");
    expect(loadRecentReadings(storage)).toEqual([]);

    storage.setItem(RECENT_KEY, JSON.stringify([{ ...recent(0), values: [7, 7] }]));
    expect(loadRecentReadings(storage)).toEqual([]);
  });

  it.each([
    ["negative", -1],
    ["fractional", 1_789_000_000_000.5],
    ["out-of-range", 8_640_000_000_000_001],
  ])("rejects a %s recent-reading timestamp before it reaches date rendering", (_label, timestamp) => {
    const storage = new MemoryStorage();
    storage.setItem(RECENT_KEY, JSON.stringify([{ ...recent(0), timestamp }]));

    expect(loadRecentReadings(storage)).toEqual([]);
  });

  it("persists only approved recent-reading fields", () => {
    const storage = new MemoryStorage();
    const recordWithExtra = { ...recent(0), privateNote: "do not persist" };

    saveRecentReading(storage, recordWithExtra);

    expect(JSON.parse(storage.getItem(RECENT_KEY) ?? "null")).toEqual([recent(0)]);
  });
});
