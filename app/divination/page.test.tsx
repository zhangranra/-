import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DivinationPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("divination page", () => {
  it("reads promised search parameters and starts a valid casting session", async () => {
    render(
      await DivinationPage({
        searchParams: Promise.resolve({
          question: "是否适合推进这个项目？",
          domain: "career",
        }),
      }),
    );

    expect(screen.getByText("“是否适合推进这个项目？”")).toBeInTheDocument();
    expect(screen.getByText("所问 · 事业")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "随机投掷三枚铜钱" })).toBeInTheDocument();
  });

  it.each([
    { domain: "finance", label: "所问 · 财运" },
    { domain: "general", label: "所问 · 一般决策" },
  ])("accepts the homepage $domain domain alias", async ({ domain, label }) => {
    render(
      await DivinationPage({
        searchParams: Promise.resolve({ question: "是否适合推进这个项目？", domain }),
      }),
    );

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "随机投掷三枚铜钱" })).toBeInTheDocument();
  });

  it.each([
    { question: "  一 二 三  ", domain: "career" },
    { question: "是否适合推进这个项目？", domain: "unknown" },
  ])("shows an editable form for invalid parameters: $question / $domain", async (params) => {
    render(await DivinationPage({ searchParams: Promise.resolve(params) }));

    expect(screen.getByRole("heading", { name: "先写下一个具体问题" })).toBeInTheDocument();
    expect(screen.getByLabelText("你想厘清什么？")).toHaveValue(params.question);
    expect(screen.getByRole("button", { name: "确认问题，开始起卦" })).toBeInTheDocument();
  });

  it("shows only domain feedback when the question is valid and the domain is invalid", async () => {
    render(
      await DivinationPage({
        searchParams: Promise.resolve({
          question: "是否适合推进这个项目？",
          domain: "unknown",
        }),
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent("问题领域无效，请重新选择。");
    expect(screen.queryByText("请输入至少四个非空白字符，并尽量写清正在权衡的行动。")).not.toBeInTheDocument();
    expect(screen.getByLabelText("问题领域")).toHaveAttribute("aria-describedby", "domain-requirement");
  });
});
