import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReadingReport } from "./reading-report";
import * as castModule from "../features/divination/cast";
import type { LineValue } from "../features/divination/types";
import { buildReading } from "../features/reading/build-reading";
import { loadRecentReadings, saveDraft, saveRecentReading } from "../features/storage/reading-store";

const question = "是否适合现在开始新的合作？";
const movingValues = [9, 7, 7, 7, 7, 7] as const;

function renderReading(values: readonly LineValue[] = movingValues, timestamp?: number) {
  const cast = castModule.castHexagram(values);
  const reading = buildReading({ question, domain: "cooperation", cast });

  render(<ReadingReport cast={cast} reading={reading} values={values} timestamp={timestamp} />);
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ReadingReport", () => {
  it("renders a complete and traceable Qian-to-Gou report", () => {
    renderReading();

    expect(screen.getByText(question)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本卦 乾为天" })).toBeInTheDocument();
    expect(screen.getAllByText("初爻 · 动爻")).not.toHaveLength(0);
    expect(screen.getByRole("heading", { name: "变卦 天风姤" })).toBeInTheDocument();

    for (const title of ["当前处境", "核心矛盾", "发展趋势", "有利因素", "风险提示", "行动参考"]) {
      const section = screen.getByRole("heading", { name: title }).closest("article");
      expect(section).not.toBeNull();
      expect(within(section as HTMLElement).getByText(/^依据：/)).toBeInTheDocument();
    }

    expect(screen.getByRole("heading", { name: "经典卦辞" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "彖传" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "大象传" })).toBeInTheDocument();
    expect(screen.getByText("潛龍勿用。")).toBeInTheDocument();
    expect(screen.queryByText("見龍在田，利見大人。")).not.toBeInTheDocument();
    expect(screen.getByText(/不构成专业意见/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存记录" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "再次起卦" })).toHaveAttribute("href", "/divination");
  });

  it("renders the original judgment and an explicit no-change note without moving lines", () => {
    renderReading([7, 7, 7, 7, 7, 7]);

    expect(screen.getByText("《乾》元亨，利貞。")).toBeInTheDocument();
    expect(screen.getByText("无动爻，局势以本卦主题为主。")).toBeInTheDocument();
    expect(screen.queryByText(/· 动爻/)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /变卦/ })).not.toBeInTheDocument();
  });

  it("appends a recent local record when saving", () => {
    renderReading();

    fireEvent.click(screen.getByRole("button", { name: "保存记录" }));

    expect(loadRecentReadings(window.localStorage)).toEqual([
      expect.objectContaining({
        question,
        domain: "cooperation",
        values: movingValues,
        originalSequence: 1,
        changedSequence: 44,
      }),
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("已保存到当前浏览器");
  });

  it("reports a failed write even when an older record has matching visible fields", () => {
    const timestamp = 1_789_000_000_000;
    saveRecentReading(window.localStorage, {
      question,
      domain: "cooperation",
      values: movingValues,
      timestamp,
      originalSequence: 1,
      changedSequence: 44,
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    renderReading(movingValues, timestamp);

    fireEvent.click(screen.getByRole("button", { name: "保存记录" }));

    expect(screen.getByRole("status")).toHaveTextContent("当前浏览器未能保存记录");
  });
});

describe("reading page", () => {
  it("awaits promised params and recovers the matching question from guarded browser storage", async () => {
    const castSpy = vi.spyOn(castModule, "castHexagram");
    const { default: ReadingPage } = await import("../app/reading/page");
    saveDraft(window.localStorage, {
      question,
      domain: "cooperation",
      values: movingValues,
      timestamp: 1_789_000_000_000,
    });

    const page = await ReadingPage({
      searchParams: Promise.resolve({
        lines: "9,7,7,7,7,7",
        domain: "cooperation",
      }),
    });

    expect(castSpy).toHaveBeenCalledOnce();
    render(page);

    expect(await screen.findByText(question)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本卦 乾为天" })).toBeInTheDocument();
    expect(castSpy).toHaveBeenCalledOnce();
  });

  it("keeps valid hexagram params when the private question cannot be recovered", async () => {
    const { default: ReadingPage } = await import("../app/reading/page");
    render(
      await ReadingPage({
        searchParams: Promise.resolve({
          lines: "9,7,7,7,7,7",
          domain: "cooperation",
        }),
      }),
    );

    expect(await screen.findByText("本次问题未能从当前浏览器恢复")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "本卦 乾为天" })).toBeInTheDocument();
  });

  it("recovers from an out-of-range local draft timestamp without date rendering", async () => {
    const { default: ReadingPage } = await import("../app/reading/page");
    window.localStorage.setItem("guanyi:casting-draft:v1", JSON.stringify({
      question,
      domain: "cooperation",
      values: movingValues,
      timestamp: 8_640_000_000_000_001,
    }));

    render(
      await ReadingPage({
        searchParams: Promise.resolve({
          lines: "9,7,7,7,7,7",
          domain: "cooperation",
        }),
      }),
    );

    expect(await screen.findByText("本次问题未能从当前浏览器恢复")).toBeInTheDocument();
    expect(screen.queryByText(question)).not.toBeInTheDocument();
  });

  it("shows recovery actions and never casts invalid parameters", async () => {
    const { default: ReadingPage } = await import("../app/reading/page");
    const castSpy = vi.spyOn(castModule, "castHexagram");

    render(
      await ReadingPage({
        searchParams: Promise.resolve({ lines: "9,7", domain: "unknown" }),
      }),
    );

    expect(screen.getByText("报告参数不完整，请重新起卦。")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "重新起卦" })).toHaveAttribute("href", "/divination");
    expect(screen.getByRole("link", { name: "查看六十四卦" })).toHaveAttribute("href", "/hexagrams");
    expect(castSpy).not.toHaveBeenCalled();
  });
});
