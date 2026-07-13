import {
  ReadingRecovery,
  ReadingReportLoader,
} from "../../components/reading-report";
import { parseReadingParams } from "../../features/routing/reading-params";

type SearchValue = string | string[] | undefined;

interface ReadingPageProps {
  searchParams: Promise<Record<string, SearchValue>>;
}

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

  return <ReadingReportLoader values={parsed.values} domain={parsed.domain} />;
}
