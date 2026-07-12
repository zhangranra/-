import type { LineValue } from "../divination/types";
import { DOMAIN_PROFILES, type ReadingDomain } from "../reading/domain-profiles";

export type ReadingLineValues = readonly [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue];

export interface ReadingParams {
  values: ReadingLineValues;
  domain: ReadingDomain;
}

export type ParsedReadingParams = ReadingParams | { error: "报告参数不完整，请重新起卦。" };

const RECOVERY_ERROR = "报告参数不完整，请重新起卦。" as const;
const LINE_VALUES = new Set<string>(["6", "7", "8", "9"]);

function isReadingDomain(value: string | null): value is ReadingDomain {
  return value !== null && Object.prototype.hasOwnProperty.call(DOMAIN_PROFILES, value);
}

export function encodeReadingParams({ values, domain }: ReadingParams): URLSearchParams {
  return new URLSearchParams({
    lines: values.join(","),
    domain,
  });
}

export function parseReadingParams(params: URLSearchParams): ParsedReadingParams {
  const lineParts = params.get("lines")?.split(",") ?? [];
  const domain = params.get("domain");

  if (lineParts.length !== 6 || !lineParts.every((value) => LINE_VALUES.has(value)) || !isReadingDomain(domain)) {
    return { error: RECOVERY_ERROR };
  }

  return {
    values: lineParts.map(Number) as unknown as ReadingLineValues,
    domain,
  };
}
