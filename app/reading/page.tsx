import {
  ReadingRecovery,
  ReadingReportLoader,
} from "../../components/reading-report";
import { castHexagram } from "../../features/divination/cast";
import { buildReading } from "../../features/reading/build-reading";
import { parseReadingParams } from "../../features/routing/reading-params";

type SearchValue = string | string[] | undefined;

interface ReadingPageProps {
  searchParams: Promise<Record<string, SearchValue>>;
}

const MISSING_QUESTION = "本次问题未能从当前浏览器恢复";

function firstValue(value: SearchValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function ReadingPage({ searchParams }: ReadingPageProps) {
  const params = await searchParams;
  const parsed = parseReadingParams(new URLSearchParams({
    lines: firstValue(params.lines),
    domain: firstValue(params.domain),
  }));

  if ("error" in parsed) {
    return <ReadingRecovery message={parsed.error} />;
  }

  const cast = castHexagram(parsed.values);
  const reading = buildReading({
    question: MISSING_QUESTION,
    domain: parsed.domain,
    cast,
  });

  return <ReadingReportLoader values={parsed.values} cast={cast} reading={reading} />;
}
