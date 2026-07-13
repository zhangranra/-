import { CastingExperience } from "../../components/casting-experience";
import {
  DOMAIN_PROFILES,
  type ReadingDomain,
} from "../../features/reading/domain-profiles";

type SearchValue = string | string[] | undefined;

interface DivinationPageProps {
  searchParams: Promise<Record<string, SearchValue>>;
}

function firstValue(value: SearchValue): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function isReadingDomain(value: string): value is ReadingDomain {
  return Object.prototype.hasOwnProperty.call(DOMAIN_PROFILES, value);
}

function normalizeDomain(value: string): ReadingDomain | null {
  if (value === "finance") return "wealth";
  if (value === "general") return "decision";
  return isReadingDomain(value) ? value : null;
}

function isSpecificQuestion(question: string): boolean {
  return question.replace(/\s/g, "").length >= 4;
}

export default async function DivinationPage({ searchParams }: DivinationPageProps) {
  const params = await searchParams;
  const question = firstValue(params.question);
  const domainValue = firstValue(params.domain);
  const domain = normalizeDomain(domainValue);
  const questionIsValid = isSpecificQuestion(question);

  if (!questionIsValid || domain === null) {
    const selectedDomain = domain ?? "decision";

    return (
      <main className="divination-page section-shell" id="main-content">
        <section className="question-entry-card" aria-labelledby="question-entry-title">
          <p className="eyebrow">起卦前 · 静心设问</p>
          <h1 id="question-entry-title">先写下一个具体问题</h1>
          <p className="question-entry-lead">
            一次只问一件正在权衡的事。请至少写下四个非空白字符，再从初爻开始六次投掷。
          </p>

          <form className="divination-question-form" action="/divination" method="get">
            <div className="field-group">
              <label htmlFor="divination-question">你想厘清什么？</label>
              <input
                id="divination-question"
                name="question"
                type="text"
                defaultValue={question}
                minLength={4}
                required
                placeholder="例如：是否适合在这个季度推进新的项目？"
                aria-describedby={questionIsValid ? undefined : "question-requirement"}
              />
              {!questionIsValid && (
                <p id="question-requirement" className="form-error" role="alert">
                  请输入至少四个非空白字符，并尽量写清正在权衡的行动。
                </p>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="divination-domain">问题领域</label>
              <select
                id="divination-domain"
                name="domain"
                defaultValue={selectedDomain}
                aria-describedby={domain === null ? "domain-requirement" : undefined}
              >
                {Object.entries(DOMAIN_PROFILES).map(([value, profile]) => (
                  <option value={value} key={value}>{profile.label}</option>
                ))}
              </select>
              {domain === null && (
                <p id="domain-requirement" className="form-error" role="alert">
                  问题领域无效，请重新选择。
                </p>
              )}
            </div>

            <button className="primary-button" type="submit">确认问题，开始起卦</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="divination-page section-shell" id="main-content">
      <CastingExperience initialQuestion={question.trim()} initialDomain={domain} />
    </main>
  );
}
