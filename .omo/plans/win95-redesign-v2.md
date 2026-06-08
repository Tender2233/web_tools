# Windows 95 风格改造计划 v2 — 真·98.css 风格

## TL;DR

> **Quick Summary**: 基于 98.css 和 React95 的设计模式，重新实现真正的 Windows 95/98 视觉语言。双层 box-shadow 凹凸边框、teal 桌面背景、MS Sans Serif 像素字体、标题栏渐变、丰富配色体系。
> 
> **Deliverables**:
> - 98.css 风格 CSS 变量体系（15+ 色，双层 bevel shadow 变量）
> - MS Sans Serif 像素字体（woff2，11px 基准）
> - 真·3D 凹凸按钮（双层 box-shadow 技术）
> - Teal 桌面背景 (#008080)
> - 标题栏蓝→浅蓝渐变
> - 98.css 风格输入框/下拉框/滚动条
> - 7 组件重新设计
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: CSS 变量 → 组件重设计 → 快照测试

---

## Context

### 第一版回顾
第一版 Win95 改造基于简化的理解，用 `outline` 做 3D 边框（CSS 不支持四色），配色单调（仅灰白黑），缺少 Win95 的视觉丰富性。

### 研究来源
- **98.css** (jdan): 纯 CSS Win98 设计系统，双层 `box-shadow` 技术，完整组件样式
- **React95**: React 组件库，15+ 色主题系统，MS Sans Serif 字体
- **Curve Finance**: 现代 Win95 混搭风格参考

### v2 核心突破
```css
/* 98.css 的双层 box-shadow 技术 —— 真正的 3D 凹凸 */
--border-raised-outer: inset -1px -1px var(--border-darkest), inset 1px 1px var(--border-lightest);
--border-raised-inner: inset -2px -2px var(--border-dark), inset 2px 2px var(--material);

button {
  box-shadow: var(--border-raised-outer), var(--border-raised-inner);
}
/* 这会在每个边缘产生 4 种不同颜色 —— 真正的 Win95 深度感 */
```

---

## Work Objectives

### Core Objective
基于 98.css 设计模式重新实现全部前端视觉，达到可与 React95 媲美的真实 Windows 95 美学。

### Concrete Deliverables
- `public/fonts/` — MS Sans Serif woff2 字体文件
- `app/app.style.css` — 完全重写：98.css 风格 CSS 变量 + 双层 bevel 按钮 + 布局
- `app/app.vue` — 标题栏渐变、工具栏、状态栏重新设计
- 所有 6 个工具组件 — 使用新 CSS 变量和按钮类
- 更新 7 个快照测试

### Definition of Done
- [ ] `npm run build` 零错误
- [ ] `npm test` 全部通过
- [ ] 按钮具有双层 box-shadow 3D 凹凸效果
- [ ] 桌面背景为 teal #008080
- [ ] MS Sans Serif 字体加载并渲染
- [ ] 标题栏有蓝→浅蓝渐变
- [ ] 输入框有 98.css 风格 field-border
- [ ] 无旧 CSS 变量残留

### Must Have
- 双层 box-shadow 凹凸边框（outer + inner）
- Teal 桌面背景 (#008080)
- MS Sans Serif 像素字体（11px 基准）
- 标题栏渐变（#000080 → #1084d0）
- 丰富配色（15+ 个 CSS 变量）
- 98.css 风格按钮（min-width: 75px, min-height: 23px）
- 98.css 风格输入框（field-border box-shadow）
- 状态栏字段（status-bar-field 凹陷样式）
- 虚线焦点环（outline: 1px dotted #000）

### Must NOT Have
- ❌ 简化版灰白风格（第一版的问题）
- ❌ `outline` 做四色边框（CSS 不支持）
- ❌ 单层 `border` 做凹凸（深度不够）
- ❌ 灰色桌面背景
- ❌ 现代系统字体（改用 MS Sans Serif）
- ❌ 窗口 chrome（关闭/最小化按钮等）

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest + @nuxt/test-utils)
- **Automated tests**: Tests-after（更新现有快照）
- **Framework**: vitest + @vue/test-utils + @nuxt/test-utils

### QA Policy
每个任务 agent-executed QA 场景。Playwright 截图，Bash 构建验证。

---

## Execution Strategy

```
Wave 1 (Start Immediately - 基础):
├── Task 1: 下载 MS Sans Serif 字体 + @font-face 定义 [quick]
├── Task 2: 重写 app.style.css — CSS 变量 + bevel 系统 [quick]
├── Task 3: 重写 app.style.css — 按钮 + 输入框 + 布局 + 状态栏 [quick]
└── Task 4: 更新 app.vue Shell（标题栏渐变、teal 桌面、工具栏）[quick]

Wave 2 (After Wave 1 - 组件重设计，最大并行):
├── Task 5: 重设计 json-formatter（field-border 输入框、双层按钮）[quick]
├── Task 6: 重设计 base64-encoder [quick]
├── Task 7: 重设计 timestamp-converter [quick]
├── Task 8: 重设计 json-tree-view + json-node [quick]
└── Task 9: 重设计 tool-placeholder [quick]

Wave 3 (After Wave 2):
└── Task 10: 更新 7 个快照测试 + 全局验证 [quick]

Wave FINAL (4 并行审查):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Code Quality Review (unspecified-high)
├── Task F3: Real Manual QA (unspecified-high + playwright)
└── Task F4: Scope Fidelity Check (deep)
```

---

## TODOs

- [x] 1. 下载 MS Sans Serif 字体 + 定义 @font-face

  **What to do**:
  - 从 98.css GitHub 仓库获取字体文件：
    `wget https://raw.githubusercontent.com/jdan/98.css/main/fonts/converted/ms_sans_serif.woff2`
    `wget https://raw.githubusercontent.com/jdan/98.css/main/fonts/converted/ms_sans_serif_bold.woff2`
  - 保存到 `public/fonts/ms_sans_serif.woff2` 和 `public/fonts/ms_sans_serif_bold.woff2`
  - 在 `app/app.style.css` 顶部添加 `@font-face` 声明：
    ```css
    @font-face {
      font-family: "MS Sans Serif";
      src: url("/fonts/ms_sans_serif.woff2") format("woff2");
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: "MS Sans Serif";
      src: url("/fonts/ms_sans_serif_bold.woff2") format("woff2");
      font-weight: bold;
      font-style: normal;
    }
    ```
  - 全局字体改为 `font-family: "MS Sans Serif", "Pixelated MS Sans Serif", Arial, sans-serif`

  **Must NOT do**:
  - 不要用 npm 安装字体包
  - 不要改变字体大小基准（保持 11px 如 98.css）

  **Parallelization**: Wave 1 (with Tasks 2, 3, 4)
  **Blocked By**: None | **Blocks**: All component tasks

  **Acceptance Criteria**:
  - [ ] 两个 woff2 文件存在于 `public/fonts/`
  - [ ] @font-face 在 app.style.css 中定义
  - [ ] body 使用 MS Sans Serif 字体栈

  **QA**:
  ```
  Scenario: Font files downloaded and @font-face defined
    Tool: Bash
    Steps:
      1. ls public/fonts/ms_sans_serif*.woff2 → two files
      2. grep "@font-face" app/app.style.css → 2 matches
      3. grep "MS Sans Serif" app/app.style.css → >= 3 matches
    Evidence: .omo/evidence/task-v2-1-fonts.txt
  ```

  **Commit**: `feat: add MS Sans Serif pixel font`

- [x] 2. 重写 `app.style.css` Part A+B — CSS 变量体系 + 全局基础

  **What to do**:
  - 完全重写 CSS 变量，基于 React95 主题 + 98.css 变量体系：
  ```css
  :root {
    /* 98.css style two-layer bevel variables */
    --border-raised-outer: inset -1px -1px var(--border-darkest), inset 1px 1px var(--border-lightest);
    --border-raised-inner: inset -2px -2px var(--border-dark), inset 2px 2px var(--material);
    --border-sunken-outer: inset -1px -1px var(--border-lightest), inset 1px 1px var(--border-darkest);
    --border-sunken-inner: inset -2px -2px var(--material), inset 2px 2px var(--border-dark);
    --border-window-outer: inset -1px -1px var(--border-darkest), inset 1px 1px var(--material);
    --border-window-inner: inset -2px -2px var(--border-dark), inset 2px 2px var(--border-lightest);
    --border-field: inset -1px -1px var(--border-lightest), inset 1px 1px var(--border-dark), inset -2px -2px var(--material), inset 2px 2px var(--border-darkest);

    /* React95-inspired full color palette */
    --desktop: #008080;
    --surface: #c0c0c0;
    --material: #c6c6c6;
    --canvas: #ffffff;
    --canvas-text: #0a0a0a;
    --border-darkest: #0a0a0a;
    --border-dark: #848584;
    --border-light: #dfdfdf;
    --border-lightest: #ffffff;
    --header-bg: #000080;
    --header-bg-light: #1084d0;
    --header-text: #ffffff;
    --header-inactive-bg: #7f787f;
    --header-inactive-text: #c6c6c6;
    --hover-bg: #000080;
    --hover-text: #ffffff;
    --link: #0000ff;
    --focus: #000000;
    --tooltip: #fefbcc;

    /* Syntax highlighting */
    --syn-key: #800080;
    --syn-string: #008000;
    --syn-number: #0000ff;
    --syn-boolean: #808000;
    --syn-null: #808080;

    /* Spacing */
    --element-spacing: 8px;
    --grouped-element-spacing: 6px;
  }
  ```
  - 全局 `body` 样式：MS Sans Serif 字体，11px 字号，teal 桌面背景
  ```css
  body {
    margin: 0;
    font-family: "MS Sans Serif", Arial, sans-serif;
    font-size: 11px;
    background: var(--desktop);
    color: var(--canvas-text);
    -webkit-font-smoothing: none;
  }
  ```

  **Must NOT do**: 不要保留旧的 `--win95-*` 变量，不要灰色桌面

  **Parallelization**: Wave 1 | **Blocks**: All component tasks

  **Acceptance Criteria**:
  - [ ] `:root` 包含 20+ CSS 变量
  - [ ] `--border-raised-outer/inner` 和 `--border-sunken-outer/inner` 定义
  - [ ] `--border-field` 变量定义
  - [ ] `--desktop: #008080`
  - [ ] body font-family 为 MS Sans Serif
  - [ ] body background 为 teal
  - [ ] `-webkit-font-smoothing: none` 保持像素感

  **QA**:
  ```
  Scenario: CSS variables and global styles correct
    Tool: Bash
    Steps:
      1. grep -c "^  --" app/app.style.css → >= 18
      2. grep "desktop.*#008080" app/app.style.css → 1 match
      3. grep "MS Sans Serif" app/app.style.css → >= 3 matches
      4. grep "font-smoothing: none" app/app.style.css → 1 match
    Evidence: .omo/evidence/task-v2-2-vars.txt
  ```

  **Commit**: `style: 98.css CSS variable system with double-bevel shadows`

- [x] 3. 重写 `app.style.css` Part C+D+E — 按钮 + 输入框 + 布局 + 状态栏

  **What to do**:
  - **Part C: 按钮** — 使用 98.css 双层 box-shadow 技术：
  ```css
  .btn {
    box-sizing: border-box;
    border: none;
    color: transparent;
    text-shadow: 0 0 var(--canvas-text);
    background: var(--surface);
    box-shadow: var(--border-raised-outer), var(--border-raised-inner);
    border-radius: 0;
    min-width: 75px;
    min-height: 23px;
    padding: 0 12px;
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .btn:active:not(:disabled) {
    box-shadow: var(--border-sunken-outer), var(--border-sunken-inner);
    text-shadow: 1px 1px var(--canvas-text);
    padding: 1px 11px 0 13px;
  }
  .btn:focus {
    outline: 1px dotted var(--focus);
    outline-offset: -4px;
  }
  .btn:disabled {
    text-shadow: 1px 1px 0 var(--border-lightest);
    color: var(--border-dark);
  }
  .btn-primary {
    box-shadow: inset -2px -2px var(--border-darkest), inset 1px 1px var(--border-darkest), inset 2px 2px var(--border-lightest), inset -3px -3px var(--border-dark), inset 3px 3px var(--material);
  }
  .btn-primary:active:not(:disabled) {
    box-shadow: inset 2px 2px var(--border-darkest), inset -1px -1px var(--border-darkest), inset -2px -2px var(--border-lightest), inset 3px 3px var(--border-dark), inset -3px -3px var(--material);
  }
  .btn-ghost { background: transparent; box-shadow: none; }
  .btn-ghost:hover:not(:disabled) {
    background: var(--surface);
    box-shadow: var(--border-raised-outer), var(--border-raised-inner);
  }
  ```
  - **Part D: 输入框** — 98.css field-border 模式：
  ```css
  textarea, input, select {
    padding: 3px 4px;
    border: none;
    box-shadow: var(--border-field);
    background: var(--border-lightest);
    box-sizing: border-box;
    border-radius: 0;
    font-family: inherit;
    font-size: 11px;
  }
  textarea:focus, input:focus, select:focus { outline: none; }
  textarea:disabled, input:disabled { background: var(--surface); }
  textarea:read-only { background: var(--surface); }
  select {
    appearance: none;
    padding-right: 24px;
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='black' d='M4 6h8l-4 4z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 4px center;
  }
  ```
  - **Part E: 页面布局**：
    - `.page` — teal 桌面背景 `background: var(--desktop)`
    - `.shell` — 居中，flex column
    - `.topbar` — 无背景（融入桌面），仅排列按钮
    - `.brand-chip` — 如果使用，改为标题栏样式
    - `.tool-btn` — 使用 `.btn` 样式 + tab 样式
    - `.workspace` — flex: 1
    - `.surface` — 98.css 窗口风格 `box-shadow: var(--border-window-outer), var(--border-window-inner); background: var(--surface)`
  - **Part F: 状态栏** — 98.css status-bar 风格：
  ```css
  .statusbar {
    display: flex;
    gap: 1px;
    margin: 0 1px;
  }
  .statusbar__tool, .statusbar__status {
    box-shadow: inset -1px -1px var(--material), inset 1px 1px var(--border-dark);
    padding: 2px 3px;
    margin: 0;
    flex: 1;
  }
  ```

  **Must NOT do**: 不要用 `outline`、不要灰色桌面、不要单层 border

  **Parallelization**: Wave 1 (with Tasks 1, 2, 4)
  **Blocked By**: Task 2 | **Blocks**: All component tasks

  **Acceptance Criteria**:
  - [ ] `.btn` 使用双层 box-shadow
  - [ ] 按钮 min-width: 75px, min-height: 23px
  - [ ] 输入框使用 `--border-field` box-shadow
  - [ ] 页面背景为 teal
  - [ ] 状态栏使用 98.css status-bar 风格
  - [ ] `npm run build` 成功

  **QA**:
  ```
  Scenario: Buttons use double-layer box-shadow
    Tool: Bash
    Steps:
      1. grep "border-raised-outer\|border-raised-inner" app/app.style.css → >= 3 matches
      2. grep "min-width: 75px" app/app.style.css → 1 match
      3. grep "border-field" app/app.style.css → >= 2 matches
    Evidence: .omo/evidence/task-v2-3-buttons.txt
  ```

  **Commit**: `style: 98.css buttons, inputs, and teal desktop layout`

- [ ] 4. 更新 `app.vue` Shell — 标题栏渐变 + teal 桌面

  **What to do**:
  - 编辑 `app/app.vue` 模板：
    - 将 `brand-chip` 改为 98.css 标题栏风格：
      ```html
      <div style="background: linear-gradient(90deg, var(--header-bg), var(--header-bg-light)); color: var(--header-text); padding: 3px 2px 3px 3px; font-weight: bold; font-size: 11px;">
        Web Tools
      </div>
      ```
    - 工具栏按钮使用 `.btn` 类 + tab 样式
    - 工作区保持 `.surface` → 98.css 窗口风格
    - 状态栏使用 98.css 布局
    - 移除 `topbar` 的 `border`/`box-shadow`（工具栏回归桌面原生感）
  - 从 `useAppShell()` 解构保持 `activeToolMeta`

  **Must NOT do**: 不要添加窗口 chrome（关闭/最大化按钮）

  **Parallelization**: Wave 1 | **Blocked By**: Tasks 2, 3
  **Blocks**: Task 10

  **Acceptance Criteria**:
  - [ ] 标题栏使用蓝→浅蓝渐变
  - [ ] 桌面背景为 teal
  - [ ] 工具栏按钮使用 `.btn` 类
  - [ ] 表面板使用窗口风格 box-shadow

  **QA**:
  ```
  Scenario: Shell renders with teal desktop and gradient title bar
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Screenshot: .omo/evidence/task-v2-4-shell.png
      3. Assert: desktop background is teal
      4. Assert: title bar has gradient
    Evidence: .omo/evidence/task-v2-4-shell.png
  ```

  **Commit**: `style: Win95 shell with gradient title bar and teal desktop`

- [ ] 5. 重设计 `json-formatter` 组件为 98.css 风格

  **What to do**:
  - 编辑 `json-formatter.vue` — 按钮使用 `.btn` 类
  - 编辑 `json-formatter.style.css`:
    - 工具栏: 使用 `.btn` 基础样式
    - 面板 `.json-formatter__pane` → `box-shadow: var(--border-window-outer), var(--border-window-inner)`
    - 输入框: 使用 `--border-field` box-shadow
    - 下拉框: `appearance: none` + 自定义箭头
    - 树视图切换按钮: 98.css 风格
    - 错误提示: 保留白底红字但用新变量
    - 全部 `border-radius: 0`，`font-size: 11px`
    - 移除所有旧 CSS 变量引用
  - 保持布局结构和功能逻辑不变

  **Parallelization**: Wave 2 (with Tasks 6-9)
  **Blocked By**: Tasks 2, 3 | **Blocks**: Task 10

  **Acceptance Criteria**:
  - [ ] 无旧 CSS 变量
  - [ ] 输入框使用 field-border box-shadow
  - [ ] 面板使用窗口风格双层 shadow
  - [ ] `npm run build` 成功

  **QA**:
  ```
  Scenario: JSON formatter with 98.css styling
    Tool: Playwright
    Steps:
      1. Enter {"a":1}, click 格式化
      2. Screenshot evidence
      3. Assert: input/output panes have window-style borders
    Evidence: .omo/evidence/task-v2-5-json.png
  ```

  **Commit**: `style: redesign json-formatter with 98.css patterns`

- [ ] 6. 重设计 `base64-encoder` 为 98.css 风格

  **What to do**: 同模式——field-border 输入框，双层 bevel 面板，`.btn` 按钮类。编辑 `base64-encoder.vue` 的 scoped 样式。

  **Parallelization**: Wave 2 | **Blocked By**: Tasks 2, 3

  **Acceptance Criteria**: 无旧 CSS 变量，98.css 输入框模式，构建通过
  **QA**: Playwright 截图 + encode/decode 功能验证

  **Commit**: `style: redesign base64-encoder with 98.css patterns`

- [ ] 7. 重设计 `timestamp-converter` 为 98.css 风格

  **What to do**: 同模式。特别注意 Teleported 下拉菜单的 `:global()` 样式使用 98.css 风格。

  **Parallelization**: Wave 2 | **Blocked By**: Tasks 2, 3

  **Acceptance Criteria**: 无旧变量，下拉菜单 98.css 风格，field-border 输入
  **QA**: Playwright 截图 + 时间戳转换验证

  **Commit**: `style: redesign timestamp-converter with 98.css patterns`

- [ ] 8. 重设计 `json-tree-view` + `json-node` 为 98.css 风格

  **What to do**:
  - 编辑 `json-tree-view.vue` — 树形容器用 `box-shadow: var(--border-field)`（98.css tree-view 凹陷白底）
  - 编辑 `json-node.vue`:
    - 展开/折叠按钮用 98.css details 风格：`[+]` `[-]` 文字或三角 + `border: 1px solid #808080; background: #fff`
    - 语法高亮颜色用新的 `--syn-*` 变量
    - 行高、字号对齐 11px 系统

  **Parallelization**: Wave 2 | **Blocked By**: Tasks 2, 3

  **Acceptance Criteria**: 树容器用 field-border，toggle 按钮 98.css 风格，无旧变量
  **QA**: Bash grep 验证无硬编码颜色，Playwright 验证树展开/折叠

  **Commit**: `style: redesign tree-view components with 98.css patterns`

- [ ] 9. 重设计 `tool-placeholder` 为 98.css 风格

  **What to do**: 窗口风格面板 + 虚线边框保留 + 11px 字体

  **Parallelization**: Wave 2 | **Blocked By**: Tasks 2, 3

  **Acceptance Criteria**: 无旧变量，构建通过
  **QA**: Playwright 截图

  **Commit**: `style: redesign tool-placeholder with 98.css patterns`

- [ ] 10. 更新 7 个快照测试 + 全局验证

  **What to do**:
  - 运行 `npm test -- --update` 更新所有快照
  - 运行 `npm test` 确认全部通过
  - 全局 grep 验证：
    ```bash
    grep -r "var(--win95-\|var(--bg)\|var(--fg)\|var(--muted)" app/  # 期望: 0
    grep -r "outline-color.*var.*var.*var.*var" app/  # 期望: 0
    grep -r "backdrop-filter" app/  # 期望: 0
    ```
  - `npm run build` 确认成功

  **Parallelization**: Wave 3 (sequential after Wave 2)
  **Blocked By**: Tasks 4-9

  **Acceptance Criteria**:
  - [ ] 7 快照测试通过
  - [ ] 无旧 CSS 变量残留
  - [ ] 无 `outline-color` 四色残留
  - [ ] 构建成功

  **QA**:
  ```
  Scenario: All tests pass, zero old patterns
    Tool: Bash
    Steps:
      1. npm test → 7 passed
      2. grep old vars → 0
      3. npm run build → exit 0
    Evidence: .omo/evidence/task-v2-10-final.txt
  ```

  **Commit**: `test: update snapshots for 98.css v2 design`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify: double-layer box-shadow buttons, teal desktop, MS Sans Serif font, title bar gradient, field-border inputs, status bar fields. Search for forbidden patterns. Check evidence files.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + `npm test`. Review for: old CSS variables, `outline` four-color attempts, AI slop, hardcoded colors.
  Output: `Build [PASS/FAIL] | Test [N/N] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright`
  Execute all QA scenarios. Verify: teal desktop visible, title bar gradient, double-bevel buttons, MS Sans Serif rendering, all tools functional. Test 375px and 1440px.
  Output: `Scenarios [N/N] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Verify 1:1 compliance. Must Have/Must NOT Have. Cross-task contamination.
  Output: `Tasks [N/N] | Contamination [CLEAN/N] | Unaccounted [CLEAN/N] | VERDICT`

## Commit Strategy

- **1**: `feat: add MS Sans Serif pixel font`
- **2**: `style: 98.css CSS variable system with double-bevel shadows`
- **3**: `style: 98.css buttons, inputs, and teal desktop layout`
- **4**: `style: Win95 shell with gradient title bar and teal desktop`
- **5**: `style: redesign json-formatter with 98.css patterns`
- **6**: `style: redesign base64-encoder with 98.css patterns`
- **7**: `style: redesign timestamp-converter with 98.css patterns`
- **8**: `style: redesign tree-view components with 98.css patterns`
- **9**: `style: redesign tool-placeholder with 98.css patterns`
- **10**: `test: update snapshots for 98.css v2 design`

## Success Criteria

### Verification Commands
```bash
npm run build                                    # Expected: zero errors
npm test                                         # Expected: 7 tests pass
grep -r "var(--win95-" app/                     # Expected: NO results
grep -r "outline-color.*var.*var.*var" app/      # Expected: NO results
grep -r "backdrop-filter" app/                   # Expected: NO results
```

