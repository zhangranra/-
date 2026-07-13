import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveRecentReading } from "../features/storage/reading-store";
import { CastingExperience } from "./casting-experience";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const question = "是否适合推进这个项目？";

function renderCasting(onComplete = vi.fn()) {
  render(
    <CastingExperience
      initialQuestion={question}
      initialDomain="career"
      onComplete={onComplete}
    />,
  );
  return onComplete;
}

describe("CastingExperience", () => {
  beforeEach(() => {
    window.localStorage.clear();
    push.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("records six manual lines from bottom to top and completes in the same order", () => {
    const onComplete = renderCasting();

    expect(screen.getByText("第 1/6 爻")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "老阳 9" }));
    const firstLine = screen.getByText("初爻").closest("li");
    expect(firstLine).not.toBeNull();
    expect(within(firstLine as HTMLElement).getByText("老阳 · 动爻")).toBeInTheDocument();
    expect(screen.getByText("第 2/6 爻")).toBeInTheDocument();

    for (let count = 0; count < 5; count += 1) {
      fireEvent.click(screen.getByRole("button", { name: "少阳 7" }));
    }

    expect(screen.getByText("第 6/6 爻")).toBeInTheDocument();
    expect(screen.getByText("六爻已完成")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith([9, 7, 7, 7, 7, 7]);

    const displayedPositions = screen
      .getAllByTestId("cast-line")
      .map((line) => within(line).getByTestId("line-position").textContent);
    expect(displayedPositions).toEqual(["上爻", "五爻", "四爻", "三爻", "二爻", "初爻"]);
  });

  it("keeps casting state when browser storage rejects a draft save", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    renderCasting();
    fireEvent.click(screen.getByRole("button", { name: "少阴 8" }));

    expect(screen.getByText("初爻")).toBeInTheDocument();
    expect(screen.getByText("第 2/6 爻")).toBeInTheDocument();
    setItem.mockRestore();
  });

  it("navigates with only ordered line values and the domain", () => {
    render(<CastingExperience initialQuestion={question} initialDomain="career" />);

    fireEvent.click(screen.getByRole("button", { name: "老阳 9" }));
    for (let count = 0; count < 5; count += 1) {
      fireEvent.click(screen.getByRole("button", { name: "少阳 7" }));
    }

    expect(push).toHaveBeenCalledWith("/reading?lines=9%2C7%2C7%2C7%2C7%2C7&domain=career");
    expect(push.mock.calls[0]?.[0]).not.toContain("question");
  });

  it("cancels an in-flight random toss when the experience unmounts", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { unmount } = render(
      <CastingExperience
        initialQuestion={question}
        initialDomain="career"
        onComplete={onComplete}
      />,
    );

    for (let count = 0; count < 5; count += 1) {
      fireEvent.click(screen.getByRole("button", { name: "少阳 7" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "随机投掷三枚铜钱" }));
    expect(screen.getByRole("button", { name: "铜钱翻转中…" })).toBeDisabled();

    unmount();
    act(() => vi.advanceTimersByTime(620));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("announces every random coin face and point value with the line result", () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.2);
    const { container } = render(
      <CastingExperience
        initialQuestion={question}
        initialDomain="career"
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "随机投掷三枚铜钱" }));
    act(() => vi.advanceTimersByTime(620));

    const announcement = container.querySelector('[aria-live="polite"]');
    expect(announcement).toHaveTextContent("第一枚背（2 点）");
    expect(announcement).toHaveTextContent("第二枚字（3 点）");
    expect(announcement).toHaveTextContent("第三枚背（2 点）");
    expect(announcement).toHaveTextContent("总数 7，少阳");
  });

  it("shows locally saved recent readings with their casting times", async () => {
    saveRecentReading(window.localStorage, {
      question: "是否接受新的合作邀请？",
      domain: "cooperation",
      values: [8, 7, 8, 7, 8, 7],
      timestamp: new Date("2026-07-12T08:30:00+08:00").getTime(),
      originalSequence: 12,
      changedSequence: 45,
    });
    saveRecentReading(window.localStorage, {
      question: "是否适合调整学习计划？",
      domain: "study",
      values: [7, 8, 7, 8, 7, 8],
      timestamp: new Date("2026-07-13T09:45:00+08:00").getTime(),
      originalSequence: 11,
    });

    renderCasting();

    const recent = await screen.findByRole("region", { name: "最近记录" });
    expect(within(recent).getByText("是否接受新的合作邀请？")).toBeInTheDocument();
    expect(within(recent).getByText("是否适合调整学习计划？")).toBeInTheDocument();
    expect(within(recent).getAllByText(/起卦时间：/)).toHaveLength(2);
    expect(within(recent).getByText("第 12 卦 → 第 45 卦")).toBeInTheDocument();
    expect(within(recent).getByText("第 11 卦 · 无变卦")).toBeInTheDocument();
  });

  it("shows an empty recent-reading state", async () => {
    renderCasting();

    expect(await screen.findByText("还没有保存的卦例")).toBeInTheDocument();
  });

  it.each([
    ["negative", -1],
    ["fractional", 1_789_000_000_000.5],
  ])("recovers from a %s recent-reading timestamp without rendering it", async (_label, timestamp) => {
    window.localStorage.setItem("guanyi:recent-readings:v1", JSON.stringify([{
      question: "损坏的本地记录",
      domain: "career",
      values: [7, 7, 7, 7, 7, 7],
      timestamp,
      originalSequence: 1,
    }]));

    renderCasting();

    expect(await screen.findByText("还没有保存的卦例")).toBeInTheDocument();
    expect(screen.queryByText("损坏的本地记录")).not.toBeInTheDocument();
  });
});
