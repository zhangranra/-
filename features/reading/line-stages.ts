export const LINE_STAGES = {
  1: "事情仍在萌芽与准备阶段",
  2: "事情进入内部发展与稳定执行阶段",
  3: "事情来到容易进退失据的转折处",
  4: "事情开始进入外部环境并接近关键位置",
  5: "事情来到承担主导责任与作出决定的阶段",
  6: "事情已到极处，需要留意结束、转向与物极必反",
} as const;

export type LinePosition = keyof typeof LINE_STAGES;
