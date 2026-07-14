import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HEXAGRAMS } from "../features/content/hexagrams";
import { HexagramBrowser } from "./hexagram-browser";

afterEach(cleanup);

describe("HexagramBrowser", () => {
  it("searches by hexagram identity and restores all 64 results when cleared", () => {
    render(<HexagramBrowser hexagrams={HEXAGRAMS} />);

    expect(screen.getByText("64 个结果")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "搜索六十四卦" }), {
      target: { value: "乾" },
    });

    const cards = screen.getAllByTestId("hexagram-card");
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByRole("heading", { name: "乾为天" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "清除筛选" }));
    expect(screen.getByText("64 个结果")).toBeInTheDocument();
    expect(screen.getAllByTestId("hexagram-card")).toHaveLength(64);
  });

  it.each([
    ["qian", "乾为天"],
    ["shi he", "火雷噬嗑"],
  ])("matches ASCII pinyin query %s against tone-marked catalog content", (query, fullName) => {
    render(<HexagramBrowser hexagrams={HEXAGRAMS} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "搜索六十四卦" }), {
      target: { value: query },
    });

    expect(screen.getByRole("heading", { name: fullName })).toBeInTheDocument();
  });

  it("filters every visible card by upper trigram and clears back to 64", () => {
    render(<HexagramBrowser hexagrams={HEXAGRAMS} />);

    fireEvent.change(screen.getByRole("combobox", { name: "上卦" }), {
      target: { value: "坎" },
    });

    const filteredCards = screen.getAllByTestId("hexagram-card");
    expect(filteredCards).toHaveLength(8);
    for (const card of filteredCards) {
      expect(within(card).getByText("上卦·坎")).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "清除筛选" }));
    expect(screen.getByText("64 个结果")).toBeInTheDocument();
  });
});
