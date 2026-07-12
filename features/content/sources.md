# 六十四卦内容来源与处理说明

## 主要来源与授权

- 题名：Kanseki Repository（Kanripo）`KR1a0001`《周易》，源文件标注 `BASEEDITION tls`。
- 仓库：<https://github.com/kanripo/KR1a0001>
- 固定版本：[`8284adbf9e3435d713180e24f05bf75f8b7d1d96`](https://github.com/kanripo/KR1a0001/tree/8284adbf9e3435d713180e24f05bf75f8b7d1d96)
- 使用范围：`KR1a0001_001.txt` 至 `KR1a0001_064.txt`，对应文王卦序 1–64。
- 获取日期：2026-07-12。
- 授权：Kanseki Repository 内容按 [Creative Commons Attribution-ShareAlike 4.0 International（CC BY-SA 4.0）](https://creativecommons.org/licenses/by-sa/4.0/) 提供。经典文本数据归属注明为 “Kanseki Repository (Kanripo), KR1a0001《周易》”；本项目对该数据的结构化改编亦按相同授权条件提供。转载或再改编时应保留署名、版本链接、改动说明，并遵守相同方式共享要求。

## 字段与转换规则

`scripts/import-hexagram-content.mjs` 只接受上述固定提交；本地来源目录的 `HEAD` 不一致时立即失败。生成文件为 `features/content/hexagram-records.ts`，不提交外部仓库副本。

- 保留源本的繁体字、异体字与原有标点，不把经典原文转换为简体；仅移除 Mandoku 元数据、页码标签、段落标记 `¶` 和排版换行。
- 卦辞、彖传、大象传、爻辞分字段保存；小象传存入对应爻的 `smallImage` 字段。
- 爻题（如“初九”“六二”）与爻辞正文分开保存，分隔符不进入 `classic`。
- 乾卦采用状态化拆分：同一《象》块依次拆为大象、六条小象与用九象；其余卦按爻辞、小象交错顺序配对。
- 产品主体严格保存 64 × 6 = 384 条普通爻。乾“用九”和坤“用六”另存于可选 `specialLine` 元数据，不计入 384 条数组。
- `name` 与 `slug` 沿用 `features/divination/king-wen-map.ts` 的产品标识，因此部分展示卦名使用简体；这不改变 `judgment`、`tuan`、`greatImage`、`classic`、`smallImage` 中的传统原文。
- `theme`、`stage`、`judgmentPlain`、`opportunity`、`risk`、`advice` 及各爻的 `plain`、`stage`、`advice` 为本项目独立撰写的简短现代提示，不是古文翻译，也未复制任何外部现代解读。

## 独立校验

以 Project Gutenberg [#25501《易經》](https://www.gutenberg.org/ebooks/25501)（获取日期 2026-07-12）作第二版本的自动结构校验，不作为生成来源。按每个“第…卦”区段识别卦名与首次出现的六条普通爻，结果为 64 个顺序区段、64 个唯一卦名、384 条普通爻及 2 条用爻；首卦为乾、末卦为未濟。两个版本存在断句、用字和个别异文差异，因此没有用第二版本覆盖 Kanseki 文本。

## 文本 caveat

本内容层是对指定数字底本的确定性结构化结果，不等同于校勘本。源本可能保留传世版本的异文、通假字、异体字或录入差异；例如“无／無”、断句和引号位置不应被理解为本项目作出的校勘判断。现代提示仅用于产品导航，不构成学术译注、确定性预测或现实决策依据。
