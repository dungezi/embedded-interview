# embedded-interview v0.3.0

React + TypeScript + Vite 的嵌入式面试复习工具，无后端或数据库。

[在线体验](https://dungezi.github.io/embedded-interview/)

## 使用

- 首页：多方向 OR 匹配，未选任何方向为 0 道，叠加难度与题型筛选；统一使用随机刷题，每次开始重新打乱符合条件的题目顺序。
- 题库：按标题、相关知识点和总体解析搜索，忽略大小写和首尾空白；组合一级分类、二级标签、难度、题型。展开查看答案、逐项解析与主观关键点，可收藏。浏览不产生答题或错题记录。
- 练习：选择题与判断题自动判分；简答题和代码题提交后显示关键点匹配度、遗漏及错误概念，再自评掌握/部分掌握/不会或跳过。低匹配度或不会进入错题，部分掌握进入待复习。
- 错题本：重练答对或自评掌握后移除，历史作答保留。
- 学习中心：完成量按不同题目计数，正确率只计算客观题作答与重练，主观题独立统计匹配度和自评；清空需确认。
- 备份：学习中心可下载 JSON，或选择文件校验、预览后确认覆盖恢复。第一版仅支持覆盖，不合并；导入失败或取消保留当前数据。

学习数据只保存在当前浏览器的 localStorage，站点和浏览器改变后不会自动同步。

## 本地开发与检查

```bash
npm ci
npm run dev
npm run build
npm run lint
npm run check:data
npm run check:subjective
npm run check:backup
```

Vite base 为 `/embedded-interview/`，本地开发地址包含此路径。main 分支推送由 GitHub Actions 构建并部署；Pages 的 Source 应设置为 GitHub Actions。

## 题库维护

目前 200 道题，覆盖全部 34 个二级标签。其中单选 61、多选 39、判断 11、简答 75、代码 14；简单 45、中等 125、困难 30。统一入口为 `src/data/questions.ts`，新增内容按领域放在 `src/data/question-bank/`。

题目 ID 是本地记录的关联键，已发布 ID 不得重排或复用。二级标签 ID 来自 categories.ts。选择题每项必须提供原因解析；简答分口述版和详细说明；代码题需注明边界条件及常见错误。

`npm run check:data` 检查 ID、标签、答案、逐项解析、题型结构，验证组合筛选、随机化及浏览模式的数据隔离，并输出题目分布。分类按“题目含该类任一标签”计数，一道题可能计入多个分类，分类合计不等于总题数。

[内容核对与适用边界](docs/question-bank.md)

## 备份格式

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-09-26T00:00:00.000Z",
  "data": { "records": [], "wrongIds": [], "reviewIds": [], "favoriteIds": [] }
}
```

`records` 保留用户答案、作答时间、半自动评分细节与自评。文件名为 `embedded-interview-backup-YYYY-MM-DD.json`。仅导出本项目字段，文件在本地读取，不上传。备份版本与校验集中在 `src/utils/backup.ts`；导入先验证所有字段，再确认和保存，成功后立即更新页面。

localStorage 键仍为 `embedded-interview:study:v1`；旧记录缺少评分、自评或 `reviewIds` 时仍可读取。导入不丢弃未知题目 ID，避免较新版本记录在旧版本中被损坏。
