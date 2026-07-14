export type ReadingDomain =
  | "career"
  | "relationship"
  | "wealth"
  | "study"
  | "health"
  | "cooperation"
  | "decision";

export interface DomainProfile {
  label: string;
  focus: string;
  opportunityLead: string;
  riskLead: string;
  disclaimer: string;
}

const CULTURAL_REFERENCE = "仅供传统文化学习与自我反思参考，不构成专业意见。";

export const DOMAIN_PROFILES: Readonly<Record<ReadingDomain, DomainProfile>> = {
  career: {
    label: "事业",
    focus: "关注职责、节奏与发展空间",
    opportunityLead: "可留意有利于职责推进与能力发挥的条件",
    riskLead: "需留意职责边界、推进节奏与现实阻力",
    disclaimer: CULTURAL_REFERENCE,
  },
  relationship: {
    label: "感情",
    focus: "关注沟通、边界与双方感受",
    opportunityLead: "可留意增进理解与坦诚沟通的条件",
    riskLead: "需留意误解、失衡与边界模糊",
    disclaimer: CULTURAL_REFERENCE,
  },
  wealth: {
    label: "财运",
    focus: "关注资源安排、风险承受与长期节奏",
    opportunityLead: "可留意资源配置与收支节奏中的有利条件",
    riskLead: "需留意冲动、信息不足与超出承受范围的选择",
    disclaimer: "财运相关内容只作为传统文化与自我反思参考，不涉及具体证券、仓位、收益或借贷指令。",
  },
  study: {
    label: "学业",
    focus: "关注目标、方法与持续投入",
    opportunityLead: "可留意有助于理解、练习与反馈的条件",
    riskLead: "需留意目标分散、方法失配与节奏中断",
    disclaimer: CULTURAL_REFERENCE,
  },
  health: {
    label: "健康",
    focus: "只关注日常节奏、压力、休息与寻求专业帮助",
    opportunityLead: "可留意改善休息、减轻压力与稳定节奏的条件",
    riskLead: "需留意持续压力、休息不足与忽视明显不适",
    disclaimer: "健康相关内容只作为传统文化与自我反思参考，不能替代医疗专业意见；如有持续不适，请及时寻求专业帮助。",
  },
  cooperation: {
    label: "合作",
    focus: "关注共同目标、分工、承诺与沟通",
    opportunityLead: "可留意目标一致、分工清晰与互信增强的条件",
    riskLead: "需留意责任不清、信息不对称与承诺落差",
    disclaimer: CULTURAL_REFERENCE,
  },
  decision: {
    label: "一般决策",
    focus: "关注目标、条件、代价与可逆性",
    opportunityLead: "可留意条件成熟、信息充分与保留调整空间的选择",
    riskLead: "需留意仓促定论、忽略代价与缺少备选方案",
    disclaimer: CULTURAL_REFERENCE,
  },
};
