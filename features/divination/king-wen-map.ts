import type { TrigramCode } from "./types";

type KingWenKey = `${TrigramCode}/${TrigramCode}`;

interface KingWenEntry {
  readonly sequence: number;
  readonly name: string;
  readonly slug: string;
}

const entry = (sequence: number, name: string, slug: string): KingWenEntry =>
  Object.freeze({ sequence, name, slug });

export const KING_WEN_BY_TRIGRAMS = Object.freeze({
  "111/111": entry(1, "乾", "qian"),
  "111/110": entry(10, "履", "lu"),
  "111/101": entry(13, "同人", "tong-ren"),
  "111/100": entry(25, "无妄", "wu-wang"),
  "111/011": entry(44, "姤", "gou"),
  "111/010": entry(6, "讼", "song"),
  "111/001": entry(33, "遁", "dun"),
  "111/000": entry(12, "否", "pi"),

  "110/111": entry(43, "夬", "guai"),
  "110/110": entry(58, "兑", "dui"),
  "110/101": entry(49, "革", "ge"),
  "110/100": entry(17, "随", "sui"),
  "110/011": entry(28, "大过", "da-guo"),
  "110/010": entry(47, "困", "kun-47"),
  "110/001": entry(31, "咸", "xian"),
  "110/000": entry(45, "萃", "cui"),

  "101/111": entry(14, "大有", "da-you"),
  "101/110": entry(38, "睽", "kui"),
  "101/101": entry(30, "离", "li"),
  "101/100": entry(21, "噬嗑", "shi-ke"),
  "101/011": entry(50, "鼎", "ding"),
  "101/010": entry(64, "未济", "wei-ji"),
  "101/001": entry(56, "旅", "lu-56"),
  "101/000": entry(35, "晋", "jin"),

  "100/111": entry(34, "大壮", "da-zhuang"),
  "100/110": entry(54, "归妹", "gui-mei"),
  "100/101": entry(55, "丰", "feng"),
  "100/100": entry(51, "震", "zhen"),
  "100/011": entry(32, "恒", "heng"),
  "100/010": entry(40, "解", "jie"),
  "100/001": entry(62, "小过", "xiao-guo"),
  "100/000": entry(16, "豫", "yu"),

  "011/111": entry(9, "小畜", "xiao-xu"),
  "011/110": entry(61, "中孚", "zhong-fu"),
  "011/101": entry(37, "家人", "jia-ren"),
  "011/100": entry(42, "益", "yi-42"),
  "011/011": entry(57, "巽", "xun"),
  "011/010": entry(59, "涣", "huan"),
  "011/001": entry(53, "渐", "jian-53"),
  "011/000": entry(20, "观", "guan"),

  "010/111": entry(5, "需", "xu"),
  "010/110": entry(60, "节", "jie-60"),
  "010/101": entry(63, "既济", "ji-ji"),
  "010/100": entry(3, "屯", "zhun"),
  "010/011": entry(48, "井", "jing"),
  "010/010": entry(29, "坎", "kan"),
  "010/001": entry(39, "蹇", "jian"),
  "010/000": entry(8, "比", "bi"),

  "001/111": entry(26, "大畜", "da-xu"),
  "001/110": entry(41, "损", "sun"),
  "001/101": entry(22, "贲", "bi-22"),
  "001/100": entry(27, "颐", "yi"),
  "001/011": entry(18, "蛊", "gu"),
  "001/010": entry(4, "蒙", "meng"),
  "001/001": entry(52, "艮", "gen"),
  "001/000": entry(23, "剥", "bo"),

  "000/111": entry(11, "泰", "tai"),
  "000/110": entry(19, "临", "lin"),
  "000/101": entry(36, "明夷", "ming-yi"),
  "000/100": entry(24, "复", "fu"),
  "000/011": entry(46, "升", "sheng"),
  "000/010": entry(7, "师", "shi"),
  "000/001": entry(15, "谦", "qian-15"),
  "000/000": entry(2, "坤", "kun"),
} satisfies Record<KingWenKey, KingWenEntry>);
