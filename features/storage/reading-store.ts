import type { LineValue } from "../divination/types";
import { DOMAIN_PROFILES, type ReadingDomain } from "../reading/domain-profiles";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CastingDraft {
  question: string;
  domain: ReadingDomain;
  values: readonly LineValue[];
  timestamp: number;
}

export interface RecentReading extends CastingDraft {
  originalSequence: number;
  changedSequence?: number;
}

const DRAFT_KEY = "guanyi:casting-draft:v1";
const RECENT_KEY = "guanyi:recent-readings:v1";
const RECENT_LIMIT = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReadingDomain(value: unknown): value is ReadingDomain {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(DOMAIN_PROFILES, value);
}

function isLineValue(value: unknown): value is LineValue {
  return value === 6 || value === 7 || value === 8 || value === 9;
}

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSequence(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 64;
}

function toDraft(value: unknown): CastingDraft | null {
  if (
    !isRecord(value) ||
    typeof value.question !== "string" ||
    !isReadingDomain(value.domain) ||
    !Array.isArray(value.values) ||
    value.values.length > 6 ||
    !value.values.every(isLineValue) ||
    !isTimestamp(value.timestamp)
  ) {
    return null;
  }

  return {
    question: value.question,
    domain: value.domain,
    values: value.values,
    timestamp: value.timestamp,
  };
}

function toRecentReading(value: unknown): RecentReading | null {
  const draft = toDraft(value);
  if (!draft || draft.values.length !== 6 || !isRecord(value) || !isSequence(value.originalSequence)) {
    return null;
  }

  if (value.changedSequence !== undefined && !isSequence(value.changedSequence)) {
    return null;
  }

  return {
    ...draft,
    originalSequence: value.originalSequence,
    ...(value.changedSequence === undefined ? {} : { changedSequence: value.changedSequence }),
  };
}

export function saveDraft(storage: StorageLike, draft: CastingDraft): void {
  try {
    storage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        question: draft.question,
        domain: draft.domain,
        values: [...draft.values],
        timestamp: draft.timestamp,
      }),
    );
  } catch {
    // Browser storage can be disabled, full, or unavailable in private contexts.
  }
}

export function loadDraft(storage: StorageLike): CastingDraft | null {
  try {
    const serialized = storage.getItem(DRAFT_KEY);
    return serialized === null ? null : toDraft(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export function saveRecentReading(storage: StorageLike, reading: RecentReading): void {
  const storedReading = toRecentReading(reading);
  if (!storedReading) return;

  const recentReadings = [storedReading, ...loadRecentReadings(storage)].slice(0, RECENT_LIMIT);

  try {
    storage.setItem(RECENT_KEY, JSON.stringify(recentReadings));
  } catch {
    // Saving history is best-effort and must never interrupt the reading flow.
  }
}

export function loadRecentReadings(storage: StorageLike): RecentReading[] {
  try {
    const serialized = storage.getItem(RECENT_KEY);
    if (serialized === null) return [];

    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];

    const readings = parsed.map(toRecentReading);
    return readings.every((reading): reading is RecentReading => reading !== null)
      ? readings.slice(0, RECENT_LIMIT)
      : [];
  } catch {
    return [];
  }
}
