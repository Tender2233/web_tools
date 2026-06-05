# Windows 95 风格前端改造计划

## TL;DR

> **Quick Summary**: 将 web_tools 前端从现代玻璃态风格整体改造为 Windows 95 经典美学（现代混搭版），使用纯 CSS 变量实现。保留全部功能逻辑，仅变更视觉呈现。
> 
> **Deliverables**:
> - Win95 CSS 变量体系（替换现有 8 个变量，新定义 12 个）
> - 共享按钮样式类（消除 3 处重复代码）
> - 7 个 Vue 组件的 Win95 重新设计
> - vitest 快照测试基础设施 + 7 个组件快照测试
> - 删除死代码 `app.setup.ts`
> - 新增 Win95 状态栏
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: CSS 变量定义 → 组件重新设计 → 快照测试更新

---

## Context

### Original Request
用户要求将前端页面风格改为类似 Curve Finance 的 Windows 95 风格，追求极客、简洁、直观、高信息密度。

### Interview Summary
**Key Discussions**:
- 范围：全部页面统一改造，不保留旧主题
- 视觉策略：现代混搭 — Win95 设计语言（凹凸边框、扁平配色、紧凑布局）+ 现代系统字体 + 现代可用性
- 配色：经典 Win95 灰白方案 (#c0c0c0 背景, #ffffff 工作区, #000080 深蓝强调色)
- 装饰元素：仅 Win95 配色/边框/按钮 — 不加入任务栏、开始菜单、窗口 chrome
- 动画：微妙的现代过渡（轻柔淡入淡出，最小化悬停效果）
- 字体：现代系统字体栈（system-ui, -apple-system, BlinkMacSystemFont）
- 主题：单一 Win95 经典主题（替换深色/浅色切换）
- 响应式：桌面优先，移动端简化
- 测试：实现后编写快照测试（vitest + @nuxt/test-utils）+ Agent QA
- CSS 方案：纯自定义 CSS 变量，零新增依赖

**Research Findings**:
- 项目为 Nuxt 4 + Vue 3，零 UI 依赖，纯自定义 CSS
- 当前 7 个 Vue 组件，4 个 composable，按钮样式在 3 处重复
- `app.setup.ts` 为死代码（89 行，零导入引用），`app.vue` 实际引用 `useAppShell.ts`
- 现有 8 个 CSS 变量在 95 处被引用，需全部替换
- 9 处 `backdrop-filter: blur()` 声明，37 处 `border-radius > 0` 声明
- `json-node.vue` 有 5 个硬编码颜色值需转为 CSS 变量
- `timestamp-converter.vue` 使用 `<Teleport to="body">` + `:global()` 样式，需特殊处理

### Metis Review
**Identified Gaps** (addressed):
- 按钮 CSS 重复（3 处 ~80 行）→ 提取共享类到 `app.style.css`
- `app.setup.ts` 死代码 → 删除
- 硬编码语法高亮颜色 → 转为 CSS 变量
- Teleported 下拉菜单全局样式 → 特殊命名空间处理
- `@keyframes` 跨组件共享 → 移至全局样式
- 状态栏内容未定义 → 显示工具名称 + "就绪"
- 测试基础设施不存在 → 作为 Wave 1 前置任务

---

## Work Objectives

### Core Objective
将所有页面的视觉风格从现代玻璃态改造为 Windows 95 经典美学（现代混搭），纯 CSS 变量实现，零功能逻辑变更，零新增运行时依赖。

### Concrete Deliverables
- `app/app.style.css` — 完全重写：Win95 CSS 变量 + 共享按钮类 + 全局基础样式
- `app/app.vue` — 移除主题绑定，Win95 Shell 布局，新增状态栏
- `app/composables/useAppShell.ts` — 移除主题切换逻辑（toggleTheme, localStorage, watch）
- `app/components/tools/json-formatter.vue` — Win95 按钮替换为共享类
- `app/components/tools/json-formatter.style.css` — 完整 Win95 重新设计，移除重复按钮样式
- `app/components/tools/base64-encoder.vue` — Win95 重新设计，移除重复按钮样式
- `app/components/tools/timestamp-converter.vue` — Win95 重新设计，移除重复按钮样式
- `app/components/tools/json-tree-view.vue` — Win95 样式调整
- `app/components/tools/json-node.vue` — 硬编码颜色转 CSS 变量 + Win95 样式
- `app/components/tools/tool-placeholder.vue` — Win95 重新设计
- `vitest.config.ts` — 新建，vitest 配置
- `app/**/*.test.ts` — 7 个组件快照测试文件
- `app/app.setup.ts` — 删除
- `package.json` — 新增 `test` 脚本 + devDependencies

### Definition of Done
- [ ] `npm run build` 零错误
- [ ] `npm test` 全部通过（7 个组件快照测试）
- [ ] `grep -r "backdrop-filter" app/` 零结果
- [ ] `grep -r "var(--bg)\|var(--fg)\|var(--muted)\|var(--surface-strong)\|var(--accent)" app/` 零结果（旧变量全部替换）
- [ ] `grep -r "toggleTheme\|data-theme" app/` 零结果
- [ ] `grep -r "linear-gradient" app/` 零结果（或在仅保留错误提示渐变时 ≤2 结果）
- [ ] 所有 4 个工具页面功能正常（格式化/编码/转换/占位）
- [ ] 桌面端 (1440px) 和移动端 (375px) 截图验证视觉一致性

### Must Have
- Win95 配色体系（CSS 变量: `--win95-bg`, `--win95-surface`, `--win95-button-face`, `--win95-button-highlight`, `--win95-button-shadow`, `--win95-button-dark-shadow`, `--win95-title-bar`, `--win95-title-text`, `--win95-border-dark`, `--win95-border-light`, `--win95-text`, `--win95-text-disabled`）
- 3D 凹凸边框效果（按钮、面板、输入框）
- 共享按钮类系统（`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`）
- 扁平纯色背景（无渐变、无毛玻璃）
- 紧凑信息密度（减少 padding/margin，对齐 Win95 比例）
- 单一主题（无深色/浅色切换）
- Win95 风格状态栏

### Must NOT Have (Guardrails)
- ❌ 任务栏、开始菜单、窗口标题栏、关闭/最小化/最大化按钮（Metis: SC2/SC6）
- ❌ 像素字体（用户选择现代系统字体栈）
- ❌ 毛玻璃效果（`backdrop-filter: blur()`）— 全部移除
- ❌ 圆角（`border-radius` > 2px）— Win95 为直角或微小圆角
- ❌ 渐变背景（`linear-gradient`）— 全部替换为纯色
- ❌ 深色/浅色主题切换按钮
- ❌ Composable 业务逻辑变更（`useJsonFormatter`, `useBase64`, `useTimestamp` 为只读）
- ❌ 文本内容 / 翻译变更（i18n 超出范围）
- ❌ 新增运行时 npm 依赖
- ❌ 重写过度抽象（"设计系统"、"token 库"）— 保持简洁（Metis: SC6）
- ❌ Win95 音效、启动动画或彩蛋

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO（当前项目无任何测试基础设施）
- **Automated tests**: Tests-after（实现后编写快照测试）
- **Framework**: vitest + @vue/test-utils + @nuxt/test-utils
- **Coverage target**: 7 个组件快照测试

### QA Policy
每个任务必须包含 agent-executed QA 场景。证据保存到 `.omo/evidence/task-{N}-{scenario-slug}.{ext}`。

- **Frontend/UI**: 使用 Playwright — 截图、导航、断言 DOM
- **CLI**: 使用 Bash — 构建命令、测试命令、grep 验证
- **API**: N/A（纯前端项目，无 API 端点）

---

## Execution Strategy

### Parallel Execution Waves

> 最大化并行度：共享依赖（CSS 变量、测试基础设施）在 Wave 1 定义，Wave 2 所有组件并行重设计（不同文件，零冲突）。

```
Wave 1 (Start Immediately - 基础 + 前置):
├── Task 1: vitest + @nuxt/test-utils 搭建 [quick]
├── Task 2: 删除死代码 app.setup.ts [quick]
├── Task 3: 重写 app.style.css (Win95 CSS 变量 + 共享按钮类) [quick]
└── Task 4: 移除 useAppShell.ts 主题切换逻辑 [quick]

Wave 2 (After Wave 1 - 组件重设计 + 快照测试，最大并行):
├── Task 5: 重设计 app.vue Shell + 新增状态栏 (依赖: 3, 4) [quick]
├── Task 6: 重设计 json-formatter 组件 (依赖: 3) [quick]
├── Task 7: 重设计 base64-encoder 组件 (依赖: 3) [quick]
├── Task 8: 重设计 timestamp-converter 组件 (依赖: 3) [quick]
├── Task 9: 重设计 json-tree-view + json-node (依赖: 3) [quick]
├── Task 10: 重设计 tool-placeholder 组件 (依赖: 3) [quick]
└── Task 11: 编写 7 个组件快照测试 (依赖: 1, 5-10) [quick]

Wave FINAL (After ALL tasks — 4 并行审查):
├── Task F1: 计划合规审查 (oracle)
├── Task F2: 代码质量审查 (unspecified-high)
├── Task F3: 实际手动 QA (unspecified-high + playwright)
└── Task F4: 范围保真度检查 (deep)
-> 展示合并结果 -> 等待用户确认

关键路径: Task 3 → Task 6 → Task 11 → F1-F4 → 用户确认
并行加速: ~70% 比串行更快
最大并发: 7 (Wave 2)
```

### Dependency Matrix

- **1**: - - 11, 1
- **2**: - - -, 1
- **3**: - - 5-10, 1
- **4**: - - 5, 1
- **5**: 3, 4 - 11, 2
- **6**: 3 - 11, 2
- **7**: 3 - 11, 2
- **8**: 3 - 11, 2
- **9**: 3 - 11, 2
- **10**: 3 - 11, 2
- **11**: 1, 5, 6, 7, 8, 9, 10 - -, 3

### Agent Dispatch Summary

- **1**: **4** - T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **2**: **7** - T5-T10 → `quick`, T11 → `quick`
- **FINAL**: **4** - F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**
> **FORMAT**: Task labels MUST use bare numbers: `1.`, `2.`, `3.` — NOT `T1.`, `Task 1.`, `Phase 1:`.

- [x] 1. 搭建 vitest + @nuxt/test-utils 测试基础设施

  **What to do**:
  - 在 `package.json` 中添加 devDependencies: `vitest`, `@vue/test-utils`, `@nuxt/test-utils`
  - 创建 `vitest.config.ts`，配置 Nuxt 环境（`environment: 'nuxt'`）
  - 在 `package.json` 的 `scripts` 中添加 `"test": "vitest run"`
  - 创建 `app/components/tools/__tests__/tool-placeholder.test.ts` 作为示例测试文件：
    ```ts
    import { describe, it, expect } from 'vitest'
    import { mount } from '@vue/test-utils'
    import ToolPlaceholder from '../tool-placeholder.vue'

    describe('ToolPlaceholder', () => {
      it('renders title and description', () => {
        const wrapper = mount(ToolPlaceholder, {
          props: { title: 'Test Tool', description: 'A test tool' }
        })
        expect(wrapper.text()).toContain('Test Tool')
        expect(wrapper.text()).toContain('A test tool')
      })
    })
    ```
  - 运行 `npm test` 确认测试通过
  - 运行 `npm install` 安装依赖

  **Must NOT do**:
  - 不要安装 vitest 以外的测试框架（jest, mocha 等）
  - 不要创建复杂的测试配置——保持最小化
  - 不要修改任何源代码文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准测试配置任务，文件创建 + npm install，无复杂逻辑
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 11 (snapshot tests depend on vitest setup)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `package.json:1-18` - 当前依赖列表，确认添加位置
  - Official docs: `https://nuxt.com/docs/getting-started/testing` - Nuxt 测试配置指南

  **Acceptance Criteria**:
  - [ ] `vitest.config.ts` 文件存在，配置正确
  - [ ] `package.json` 包含 `test` 脚本和 devDependencies
  - [ ] `npm test` 运行成功（至少 1 个测试通过）
  - [ ] 示例测试文件存在，测试通过

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: vitest setup verification - test runs and passes
    Tool: Bash
    Preconditions: vitest, @vue/test-utils, @nuxt/test-utils installed
    Steps:
      1. Run: npm test
      2. Assert: exit code is 0
      3. Assert: output contains "Tests 1 passed"
    Expected Result: All tests pass, zero failures
    Failure Indicators: exit code != 0, "FAIL" in output
    Evidence: .omo/evidence/task-1-vitest-verify.txt

  Scenario: Verify test infrastructure does not break build
    Tool: Bash
    Preconditions: Test files created
    Steps:
      1. Run: npm run build
      2. Assert: exit code 0
      3. Assert: no test files in build output
    Expected Result: Build succeeds, tests excluded from production build
    Evidence: .omo/evidence/task-1-build-verify.txt
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `chore(test): set up vitest + @nuxt/test-utils`
  - Files: `vitest.config.ts`, `package.json`, `package-lock.json`, `app/components/tools/__tests__/tool-placeholder.test.ts`
  - Pre-commit: `npm test`

- [x] 2. 删除死代码 `app/app.setup.ts`

  **What to do**:
  - 删除文件 `app/app.setup.ts`（89 行）
  - 确认该文件无任何导入引用：`grep -r "app.setup" app/ --include="*.ts" --include="*.vue"`
  - 该文件是 `useAppShell.ts` 的旧版本，工具定义不同（3 工具 vs 4 工具），`app.vue` 实际引用的是 `useAppShell.ts`

  **Must NOT do**:
  - 不要删除 `app/app.vue` 或其他任何文件
  - 不要修改 `useAppShell.ts`（那是 Task 4）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件删除 + grep 验证，trivial 操作
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:
  - `app/app.setup.ts:1-89` - 待删除的死代码
  - `app/composables/useAppShell.ts:1-109` - 当前活跃版本

  **Acceptance Criteria**:
  - [ ] `app/app.setup.ts` 文件已删除
  - [ ] `grep -r "app.setup" app/` 返回零结果
  - [ ] `npm run build` 成功（无导入错误）

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Dead code deletion verified
    Tool: Bash
    Preconditions: app.setup.ts exists before deletion
    Steps:
      1. Run: ls app/app.setup.ts 2>&1
      2. Assert: "No such file or directory" error
      3. Run: grep -r "app.setup" app/ --include="*.ts" --include="*.vue"
      4. Assert: zero matches
    Expected Result: File deleted, no references remain
    Evidence: .omo/evidence/task-2-dead-code.txt

  Scenario: Build still passes after deletion
    Tool: Bash
    Steps:
      1. Run: npm run build
      2. Assert: exit code 0, no import errors
    Expected Result: Clean build
    Evidence: .omo/evidence/task-2-build.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `chore: delete dead code app.setup.ts`
  - Files: `app/app.setup.ts`

- [x] 3. 重写 `app.style.css` — 定义 Win95 CSS 变量 + 共享按钮类 + 全局基础样式

  **What to do**:
  - 完全重写 `app/app.style.css`（当前 182 行）
  - **Part A: Win95 CSS 变量**（定义在 `:root`，替代当前 `[data-theme='dark']` / `[data-theme='light']` 块）:
    ```css
    :root {
      /* Win95 Classic Color Palette */
      --win95-bg: #c0c0c0;
      --win95-surface: #ffffff;
      --win95-button-face: #c0c0c0;
      --win95-button-highlight: #ffffff;
      --win95-button-shadow: #808080;
      --win95-button-dark-shadow: #000000;
      --win95-title-bar: #000080;
      --win95-title-text: #ffffff;
      --win95-border-dark: #808080;
      --win95-border-light: #ffffff;
      --win95-text: #000000;
      --win95-text-disabled: #808080;

      /* Syntax highlighting (json-node.vue) */
      --syn-key: #800080;        /* purple for keys */
      --syn-string: #008000;     /* green for strings */
      --syn-number: #0000ff;     /* blue for numbers */
      --syn-boolean: #808000;    /* olive for booleans */
      --syn-null: #808080;       /* grey for null */

      /* Functional colors */
      --win95-error-bg: #ffffff;
      --win95-error-border: #ff0000;
      --win95-error-text: #ff0000;
    }
    ```
  - **Part B: 全局基础样式**:
    ```css
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--win95-bg);
      color: var(--win95-text);
    }
    ```
  - **Part C: 共享按钮类** (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`) — 使用 Win95 3D 凹凸边框效果:
    ```css
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-family: inherit;
      font-size: 0.8125rem;
      font-weight: normal;
      color: var(--win95-text);
      background: var(--win95-button-face);
      border: none;
      outline: 2px solid;
      outline-color: var(--win95-button-highlight) var(--win95-button-dark-shadow) var(--win95-button-dark-shadow) var(--win95-button-highlight);
      cursor: pointer;
      user-select: none;
    }
    .btn:active:not(:disabled) {
      outline-color: var(--win95-button-dark-shadow) var(--win95-button-highlight) var(--win95-button-highlight) var(--win95-button-dark-shadow);
    }
    .btn:disabled {
      color: var(--win95-text-disabled);
      text-shadow: 1px 1px 0 var(--win95-button-highlight);
    }
    .btn:focus-visible {
      outline: 2px solid var(--win95-text);
      outline-offset: 1px;
    }
    .btn-primary {
      font-weight: bold;
      outline-color: var(--win95-text) var(--win95-button-dark-shadow) var(--win95-button-dark-shadow) var(--win95-text);
      /* Note: Win95 default button has slightly thicker border */
    }
    .btn-secondary { }
    .btn-ghost {
      background: transparent;
      outline: 1px solid transparent;
    }
    .btn-ghost:hover:not(:disabled) {
      outline-color: var(--win95-button-highlight) var(--win95-button-dark-shadow) var(--win95-button-dark-shadow) var(--win95-button-highlight);
      background: var(--win95-button-face);
    }
    ```
  - **Part D: 页面布局样式**（`.page`, `.shell`, `.topbar`, `.workspace`, `.surface`, `.surface__content`）— 移除深色/浅色主题条件，统一 Win95 风格
  - **Part E: 全局 `@keyframes fadeIn`** — 保持微妙淡入效果，移至全局作用域

  **Must NOT do**:
  - 不要保留 `[data-theme='dark']` 或 `[data-theme='light']` 选择器
  - 不要保留 `backdrop-filter: blur()` 声明
  - 不要保留 `linear-gradient()` 
  - 不要使用 `border-radius` > 2px
  - 不要使用 `transform: translateY()` 悬停效果
  - 不要定义组件特定的样式（仅全局/共享）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯 CSS 重写，按明确规格定义变量和共享类
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 5-10 (所有组件重设计依赖 CSS 变量)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `app/app.style.css:1-182` - 当前样式文件，理解布局结构后完整重写
  - `app/app.vue:1-50` - Shell 组件，了解 CSS 类映射
  - Win95 CSS Button Pattern: 使用 `outline` 四色技巧模拟 3D 凹凸边框（替代真实 `border` 避免占据布局空间）

  **Acceptance Criteria**:
  - [ ] `:root` 选择器包含全部 12 个 Win95 变量 + 5 个语法颜色变量
  - [ ] `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` 类使用 3D 凹凸边框效果
  - [ ] 全局 body 字体栈为现代系统字体
  - [ ] 无 `backdrop-filter`, `linear-gradient`, `border-radius > 2px`
  - [ ] 无 `[data-theme='dark']` 或 `[data-theme='light']` 残留
  - [ ] `@keyframes fadeIn` 定义在全局作用域

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: CSS variables defined correctly
    Tool: Bash (grep)
    Steps:
      1. Run: grep -c "^  --win95-" app/app.style.css
      2. Assert: count >= 12 (all Win95 variables defined)
      3. Run: grep -c "^  --syn-" app/app.style.css
      4. Assert: count >= 5 (syntax highlighting variables)
    Expected Result: All 17+ CSS variables present
    Evidence: .omo/evidence/task-3-css-vars.txt

  Scenario: No glassmorphism or old theme remnants
    Tool: Bash (grep)
    Steps:
      1. Run: grep -r "backdrop-filter" app/app.style.css && echo "FAIL" || echo "PASS"
      2. Assert: "PASS" (no backdrop-filter)
      3. Run: grep -r "data-theme" app/app.style.css && echo "FAIL" || echo "PASS"
      4. Assert: "PASS" (no theme attribute selectors)
      5. Run: grep -r "linear-gradient" app/app.style.css && echo "FAIL" || echo "PASS"
      6. Assert: "PASS" (no gradients)
    Expected Result: All three checks show PASS
    Evidence: .omo/evidence/task-3-no-glassmorphism.txt
  ```

  **Commit**: YES
  - Message: `style: define Win95 CSS variables and shared button classes`
  - Files: `app/app.style.css`

- [x] 4. 移除 `useAppShell.ts` 主题切换逻辑

  **What to do**:
  - 编辑 `app/composables/useAppShell.ts`
  - **移除**:
    - `theme` 状态变量（第 44 行 `useState<'dark' | 'light'>`）
    - `toggleTheme` 函数（第 74-77 行）
    - `onMounted` 中的 localStorage 读取逻辑（第 78-88 行）
    - `watch` 中的 localStorage 写入逻辑（第 90-98 行）
    - import 中的 `onMounted` 和 `watch`（如果不再使用）
  - **保留**:
    - `activeTool`, `tools`, `toolComponents`, `selectTool`, `activeComponent`, `activeToolProps`
    - 所有工具相关的逻辑和 return 值
  - **返回对象变更**: 移除 `theme` 和 `toggleTheme` 的导出

  **Must NOT do**:
  - 不要修改工具路由逻辑（`selectTool`, `activeComponent` 等）
  - 不要修改工具元数据定义（`tools` 数组）
  - 不要触碰其他 3 个 composable 文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 精确的代码删除操作，明确的行号范围，无新逻辑
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 5 (app.vue 需要移除 theme 绑定)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `app/composables/useAppShell.ts:42-108` - 主题相关代码（需移除的部分）
  - `app/composables/useAppShell.ts:1-41, 46-72, 100-109` - 工具相关代码（需保留的部分）

  **Acceptance Criteria**:
  - [ ] `toggleTheme` 函数不再存在于文件中
  - [ ] `theme` 变量不再存在于文件中
  - [ ] 无 `localStorage` 相关代码
  - [ ] 无 `onMounted` / `watch` import（如果仅用于主题逻辑）
  - [ ] `selectTool` 和其他工具逻辑完好无损
  - [ ] TypeScript 编译通过（`npx vue-tsc --noEmit` 或 `npm run build`）

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Theme toggle completely removed
    Tool: Bash (grep)
    Steps:
      1. Run: grep -n "toggleTheme" app/composables/useAppShell.ts && echo "FAIL" || echo "PASS"
      2. Assert: "PASS"
      3. Run: grep -n "theme" app/composables/useAppShell.ts
      4. Assert: zero matches or only non-theme occurrences
      5. Run: grep -n "localStorage" app/composables/useAppShell.ts && echo "FAIL" || echo "PASS"
      6. Assert: "PASS"
    Expected Result: No theme-related code remains
    Evidence: .omo/evidence/task-4-theme-removed.txt

  Scenario: Tool routing still works
    Tool: Bash (build)
    Steps:
      1. Run: npm run build
      2. Assert: exit code 0
      3. Run: grep -c "selectTool\|activeTool\|activeComponent" app/composables/useAppShell.ts
      4. Assert: count >= 3 (tool logic preserved)
    Expected Result: Build passes, tool logic intact
    Evidence: .omo/evidence/task-4-build.txt
  ```

  **Commit**: YES
  - Message: `refactor: remove dark/light theme toggle from useAppShell`
  - Files: `app/composables/useAppShell.ts`

- [ ] 5. 重设计 `app.vue` Shell + 新增 Win95 状态栏

  **What to do**:
  - 编辑 `app/app.vue`
  - **模板变更**:
    - 移除 `:data-theme="theme"` 绑定（第 2 行）
    - 移除主题切换按钮（第 22-27 行 `.toggle`）
    - 将 `.brand-chip` 改为 Win95 标题栏风格（深蓝背景 `var(--win95-title-bar)` + 白字）
    - 将 `.tool-btn` 改为 Win95 标签页风格（选中状态用凹陷效果，未选中用凸起效果）
    - 将 `.topbar` 移除圆角，改为 Win95 工具栏风格（纯色背景）
    - 在 `<section class="workspace">` 底部新增状态栏：
      ```html
      <footer class="statusbar">
        <span class="statusbar__tool">{{ activeToolMeta?.label ?? 'Web Tools' }}</span>
        <span class="statusbar__status">就绪</span>
      </footer>
      ```
  - **脚本变更**:
    - 从 `useAppShell()` 解构中移除 `theme` 和 `toggleTheme`（它们不再存在）
    - 解构新增 `activeToolMeta`（从 useAppShell 返回）
  - **样式变更**（在 `app.style.css` 中定义 `.statusbar` 样式）:
    - 状态栏：Win95 凹陷面板风格，底部固定，显示工具名称和状态文字
    - `data-theme` 引用全部移除

  **Must NOT do**:
  - 不要改变 `.shell` 的 Flexbox 布局结构
  - 不要改变工具路由逻辑（`<component :is="activeComponent">`）
  - 不要移除 `Suspense` 包装
  - 不要添加窗口 chrome（标题栏按钮、菜单栏等）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 模板编辑 + CSS 样式定义，逻辑简单但需精确
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-10)
  - **Blocks**: Task 11 (snapshot tests)
  - **Blocked By**: Tasks 3 (CSS variables), 4 (useAppShell changes)

  **References**:
  - `app/app.vue:1-50` - 当前 Shell 模板
  - `app/app.style.css` - CSS 变量和共享类（Task 3 输出）
  - `app/composables/useAppShell.ts` - activeToolMeta 导出（Task 4 输出）
  - `window_frame_pattern`: Win95 状态栏样式：灰色凹槽 (`box-shadow: inset 1px 1px 0 var(--win95-button-dark-shadow), inset -1px -1px 0 var(--win95-button-highlight))`)

  **Acceptance Criteria**:
  - [ ] 无 `:data-theme="theme"` 绑定残留
  - [ ] 无 `.toggle` 主题切换按钮
  - [ ] 无 `theme` / `toggleTheme` 引用
  - [ ] `.brand-chip` 使用 Win95 标题栏颜色
  - [ ] `.tool-btn` 选中/未选中使用凹凸 3D 效果
  - [ ] `.statusbar` 存在并使用凹陷面板样式
  - [ ] `npm run build` 成功

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: No theme toggle in shell
    Tool: Bash (grep)
    Steps:
      1. Run: grep -n "toggleTheme\|data-theme\|\.toggle" app/app.vue && echo "FAIL" || echo "PASS"
      2. Assert: "PASS" (no theme-related code)
    Expected Result: Zero theme-related code in app.vue
    Evidence: .omo/evidence/task-5-no-theme.txt

  Scenario: Status bar present with correct content
    Tool: Bash (grep)
    Steps:
      1. Run: grep -c "statusbar" app/app.vue
      2. Assert: count >= 1
      3. Run: grep -c "activeToolMeta" app/app.vue
      4. Assert: count >= 1
    Expected Result: Status bar template and activeToolMeta reference present
    Evidence: .omo/evidence/task-5-statusbar.txt

  Scenario: Shell renders with Win95 aesthetic (visual)
    Tool: Playwright
    Preconditions: npm run dev running
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for page load (timeout: 10s)
      3. Screenshot: .omo/evidence/task-5-shell-desktop.png (viewport: 1440x900)
      4. Assert: topbar background is flat (no glass/blur visible)
      5. Assert: status bar visible at bottom with text content
      6. Assert: no theme toggle button visible
    Expected Result: Win95-style shell with status bar, no glassmorphism
    Evidence: .omo/evidence/task-5-shell-desktop.png
  ```

  **Commit**: YES
  - Message: `style: redesign app shell to Win95 layout with status bar`
  - Files: `app/app.vue`

- [ ] 6. 重设计 `json-formatter` 组件为 Win95 风格

  **What to do**:
  - **编辑 `json-formatter.vue`**:
    - 将所有 `<button class="btn-primary">`, `<button class="btn-secondary">`, `<button class="btn-ghost">` 改用共享类
    - 移除组件内联的 SVG 渐变/圆角样式（SVG 保留，只改 wrapper 样式）
  - **编辑 `json-formatter.style.css`**（最大变更，当前 427 行）:
    - **移除**: 所有重复的按钮样式（第 346-427 行，~80 行）— 改为仅引用共享类
    - **移除**: `backdrop-filter: blur(...)`（3 处: 第 32, 131, 409 行）
    - **移除**: `linear-gradient(...)`（错误提示和按钮渐变，~6 处）
    - **移除**: `box-shadow` 含 alpha 透明度的声明
    - **替换**: 所有 `border-radius` > 2px → `border-radius: 0`（Win95 直角）
    - **替换**: `.json-formatter__toolbar` → Win95 工具栏风格（纯色背景，无圆角）
    - **替换**: `.json-formatter__pane` → Win95 凹陷面板风格（`box-shadow: inset`）
    - **替换**: `.json-formatter__pane-header` → Win95 标签头风格
    - **替换**: `.json-formatter__textarea` → Win95 输入框风格（白色凹陷，系统等宽字体）
    - **替换**: `.json-formatter__view-toggle button.active` → Win95 选中状态
    - **替换**: `.json-formatter__error` → Win95 错误对话框风格（白底红字，无渐变）
    - **替换**: `.json-formatter__indent-control select` → Win95 下拉框风格（白色凹陷 + 箭头）
    - **保留**: 布局结构（grid/flex），动画（仅 `fadeIn`），响应式断点逻辑
    - **调整**: 间距（减少 padding/margin 以提高信息密度）

  **Must NOT do**:
  - 不要修改 `json-formatter.vue` 的模板结构
  - 不要修改 composable 引用或逻辑
  - 不要删除 `src="./json-formatter.style.css"` 引用方式（保持 `<style scoped src="...">`）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯 CSS 重写 + 最小模板变更，文件虽大但变更模式明确
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7-10)
  - **Blocks**: Task 11 (snapshot tests)
  - **Blocked By**: Task 3 (CSS variables)

  **References**:
  - `app/components/tools/json-formatter.vue:1-158` - 组件模板
  - `app/components/tools/json-formatter.style.css:1-427` - 当前样式（重点变更区域已标注行号）
  - `app/composables/useJsonFormatter.ts:1-183` - READ-ONLY，了解 stats/error 等状态变量

  **Acceptance Criteria**:
  - [ ] 无 `backdrop-filter` 声明
  - [ ] 无 `linear-gradient` 声明
  - [ ] 无 `border-radius` > 2px 声明
  - [ ] 按钮使用共享类（无重复的 `.btn-primary`/`.btn-secondary` 定义）
  - [ ] 所有面板使用 Win95 凹陷/凸起 3D 边框
  - [ ] 错误提示使用白底红字（非渐变）
  - [ ] `npm run build` 成功

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: JSON formatter renders with Win95 style (visual)
    Tool: Playwright
    Preconditions: npm run dev running, click "JSON 格式化" tab
    Steps:
      1. Navigate to http://localhost:3000
      2. Click tab: "JSON 格式化"
      3. Wait for tool to load (timeout: 5s)
      4. Screenshot: .omo/evidence/task-6-json-desktop.png (viewport: 1440x900)
      5. Assert: toolbar has flat background (no blur/gradient)
      6. Assert: input/output panes have inset border (sunken panel look)
      7. Assert: buttons have 3D raised appearance
    Expected Result: Win95-style json-formatter, no glassmorphism
    Evidence: .omo/evidence/task-6-json-desktop.png

  Scenario: JSON formatting functionality preserved
    Tool: Playwright + Bash
    Steps:
      1. In Playwright: paste {"a":1} into input textarea
      2. Click "格式化" button
      3. Assert: output textarea contains formatted JSON with indentation
      4. Click "压缩" button
      5. Assert: output contains compact JSON (no newlines)
      6. In Bash: npm run build
      7. Assert: exit code 0
    Expected Result: All format/minify/clear functions work correctly
    Evidence: .omo/evidence/task-6-functional.png
  ```

  **Commit**: YES
  - Message: `style: redesign json-formatter to Win95 aesthetic`
  - Files: `app/components/tools/json-formatter.vue`, `app/components/tools/json-formatter.style.css`

- [ ] 7. 重设计 `base64-encoder` 组件为 Win95 风格

  **What to do**:
  - 编辑 `app/components/tools/base64-encoder.vue`
  - **模板变更**:
    - 将所有 `<button class="btn-primary">`, `<button class="btn-secondary">`, `<button class="btn-ghost">` 改用共享类
    - 移除按钮上的 SVG inline 渐变相关样式
  - **样式变更**（scoped `<style>` 块，第 92-355 行）:
    - **移除**: 所有重复的按钮样式（第 232-314 行，~80 行）
    - **移除**: `backdrop-filter: blur(12px)`（第 148 行）
    - **移除**: `linear-gradient(...)` 错误和按钮渐变（第 121, 289 行）
    - **移除**: `box-shadow` 含 alpha 透明度
    - **替换**: `border-radius: 12px` → `border-radius: 0`
    - **替换**: `.base64-encoder__pane` → 凹陷面板（`box-shadow: inset`）
    - **替换**: `.base64-encoder__pane-header` → UPPERCASE Win95 标签头风格
    - **替换**: `.base64-encoder__textarea` → 白色凹陷输入框（系统等宽字体）
    - **替换**: `.base64-encoder__error` → 白底红字
    - **替换**: `.base64-encoder__stats span` → 标签风格（凸起小面板）
    - **保留**: 布局 grid，fadeIn 动画，响应式断点

  **Must NOT do**:
  - 不要修改 `useBase64()` composable 引用
  - 不要修改 textarea 的 v-model 绑定
  - 不要改变组件 HTML 结构

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯 CSS/样式替换任务，参考 json-formatter 模式即可
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5-6, 8-10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 3

  **References**:
  - `app/components/tools/base64-encoder.vue:1-355` - 完整组件文件
  - `app/composables/useBase64.ts:1-142` - READ-ONLY composable
  - Win95 输入框模式: 白色背景 + `box-shadow: inset 1px 1px 0 var(--win95-button-dark-shadow), inset -1px -1px 0 var(--win95-button-highlight)`

  **Acceptance Criteria**:
  - [ ] 无重复按钮样式
  - [ ] 无 `backdrop-filter`, `linear-gradient`, `border-radius > 2px`
  - [ ] 面板使用凹陷 3D 边框
  - [ ] 错误提示使用白底红字
  - [ ] `npm run build` 成功

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Base64 encoder renders with Win95 style
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Click "Base64 编解码" tab
      3. Screenshot: .omo/evidence/task-7-base64-desktop.png (viewport: 1440x900)
      4. Assert: panes have sunken panel appearance
      5. Assert: buttons have 3D raised style
    Expected Result: Win95-style base64 encoder
    Evidence: .omo/evidence/task-7-base64-desktop.png

  Scenario: Base64 encode/decode functionality preserved
    Tool: Playwright
    Steps:
      1. Type "hello" in input textarea
      2. Click "编码" button
      3. Assert: output textarea contains "aGVsbG8="
      4. Click "清空" button
      5. Assert: input and output are empty
      6. Type "aGVsbG8=" in input
      7. Click "解码" button
      8. Assert: output textarea contains "hello"
    Expected Result: Encode and decode work correctly
    Evidence: .omo/evidence/task-7-functional.png
  ```

  **Commit**: YES
  - Message: `style: redesign base64-encoder to Win95 aesthetic`
  - Files: `app/components/tools/base64-encoder.vue`

- [ ] 8. 重设计 `timestamp-converter` 组件为 Win95 风格

  **What to do**:
  - 编辑 `app/components/tools/timestamp-converter.vue`
  - **模板变更**:
    - 将所有按钮改用共享类（`btn-primary`, `btn-secondary`, `btn-ghost`）
  - **样式变更**（scoped `<style>` 块，第 250-729 行）:
    - **移除**: 所有重复的按钮样式（第 606-688 行，~80 行）
    - **移除**: `backdrop-filter: blur(12px)`（第 268, 443 行）
    - **移除**: `linear-gradient(...)` 错误渐变（第 422 行）
    - **移除**: `box-shadow` 含 alpha 透明度
    - **替换**: `border-radius: 12px` + `border-radius: 10px` + `border-radius: 8px` → `border-radius: 0`
    - **替换**: `.ts-converter__tz-bar` → Win95 工具栏
    - **替换**: `.ts-converter__now-bar` → Win95 状态行
    - **替换**: `.ts-converter__panel` → Win95 分组框（凹陷）
    - **替换**: `.ts-converter__panel-header` → 分组框标题
    - **替换**: `.ts-converter__input` → 白色凹陷输入框
    - **替换**: `.ts-converter__unit-toggle` → 分段按钮（选中=凹陷）
    - **替换**: `.ts-converter__stat` → 统计数据卡片（凸起小面板）
    - **替换**: `.ts-converter__error` → 白底红字
    - **特殊处理**: `:global(.ts-converter__tz-dropdown)` Teleported 下拉菜单（第 324-374 行）— Win95 下拉框风格（白色背景 + 3D 边框），保持 `:global()` 命名空间
    - **保留**: 布局 grid，Teleport 机制，所有功能性 class 名称

  **Must NOT do**:
  - 不要修改 `<Teleport to="body">` 机制
  - 不要修改 `useTimestamp()` composable 引用
  - 不要破坏时区下拉菜单的打开/关闭/搜索逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 最大组件（729 行），但主要是 CSS 替换，Teleported 下拉菜单需额外注意
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5-7, 9-10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 3

  **References**:
  - `app/components/tools/timestamp-converter.vue:1-729` - 完整组件（最大文件）
  - `app/composables/useTimestamp.ts:1-333` - READ-ONLY composable
  - Win95 下拉框模式: `background: #ffffff; border: none; outline: 2px solid; outline-color: var(--win95-button-dark-shadow) var(--win95-button-highlight) var(--win95-button-highlight) var(--win95-button-dark-shadow)`

  **Acceptance Criteria**:
  - [ ] 无重复按钮样式
  - [ ] 无 `backdrop-filter`, `linear-gradient`, `border-radius > 2px`
  - [ ] Teleported 下拉菜单使用 Win95 样式（`:global()` 块内）
  - [ ] 分段按钮（s/ms）使用凹凸切换效果
  - [ ] 统计数据卡片使用凸起面板
  - [ ] `npm run build` 成功

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Timestamp converter renders with Win95 style
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Click "Timestamp" tab
      3. Screenshot: .omo/evidence/task-8-timestamp-desktop.png (viewport: 1440x900)
      4. Assert: no glass/blur effects visible
      5. Assert: Current time bar has flat background
    Expected Result: Win95-style timestamp converter
    Evidence: .omo/evidence/task-8-timestamp-desktop.png

  Scenario: Timestamp conversion functionality preserved
    Tool: Playwright
    Steps:
      1. Enter "1700000000" in timestamp input
      2. Assert: datetime input auto-fills with converted date
      3. Click "Use Now" button
      4. Assert: timestamp input populates with current timestamp
      5. Click s/ms toggle to switch units
      6. Assert: timestamp value adjusts accordingly
      7. Click timezone input, select different timezone from dropdown
      8. Assert: datetime updates for new timezone
    Expected Result: All conversion, unit toggle, timezone features work
    Evidence: .omo/evidence/task-8-functional.png
  ```

  **Commit**: YES
  - Message: `style: redesign timestamp-converter to Win95 aesthetic`
  - Files: `app/components/tools/timestamp-converter.vue`

- [ ] 9. 重设计 `json-tree-view` + `json-node` 为 Win95 风格

  **What to do**:
  - **编辑 `json-tree-view.vue`**（第 121-129 行样式块）:
    - 保持字体族 `monospace`（Monaco, Menlo, Ubuntu Mono, Cascadia Code）
    - 添加 Win95 树形容器样式（白色背景 + 凹陷边框）
  - **编辑 `json-node.vue`**（第 169-268 行样式块）:
    - **关键变更**: 5 个硬编码十六进制颜色 → CSS 变量（使用 Task 3 中定义的 `--syn-*` 变量）:
      - `#8b5cf6` (紫) → `var(--syn-key)` 键名
      - `#10b981` (绿) → `var(--syn-string)` 字符串值
      - `#3b82f6` (蓝) → `var(--syn-number)` 数字值
      - `#f59e0b` (琥珀) → `var(--syn-boolean)` 布尔值
      - `#ef4444` (红) → `var(--syn-null)` null 值
    - **替换**: `.json-node__toggle` → Win95 树控件展开/折叠箭头（保持 SVG 箭头 + 添加 3D 按钮效果）
    - **替换**: `.json-node__bracket-symbol` → 使用 Win95 文本颜色
    - **替换**: `.json-node__preview` → 保持斜体，使用 Win95 禁用色
    - **移除**: 所有 `border-radius` 声明
    - **调整**: 间距为 Win95 紧凑风格

  **Must NOT do**:
  - 不要修改组件的 Props/Emits 定义
  - 不要修改 `defineExpose`（expandAll/collapseAll）
  - 不要修改树展开/折叠逻辑
  - 不要修改 `data-json-path` / `data-json-value` 属性（影响剪贴板功能）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 两个小组件，重点是硬编码颜色→CSS 变量转换 + 样式调整
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5-8, 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 3 (CSS 变量，特别是 `--syn-*` 语法颜色变量)

  **References**:
  - `app/components/tools/json-tree-view.vue:1-129` - 树容器组件
  - `app/components/tools/json-node.vue:1-268` - 树节点组件（含 5 个硬编码颜色）
  - `app/app.style.css` - CSS 变量定义（Task 3 输出，确认 `--syn-*` 变量名）
  - Win95 TreeView 模式: 展开/折叠用 [+] / [-] 或三角箭头 + 凹陷背景

  **Acceptance Criteria**:
  - [ ] 5 个 `--syn-*` CSS 变量被引用（无硬编码 `#8b5cf6`, `#10b981`, `#3b82f6`, `#f59e0b`, `#ef4444`）
  - [ ] 树控件展开/折叠按钮有 3D 效果
  - [ ] 无 `border-radius` 声明
  - [ ] `defineExpose` 和 emits 完好无损
  - [ ] `npm run build` 成功

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: JSON tree view renders with Win95 colors
    Tool: Bash (grep)
    Steps:
      1. Run: grep -n "#8b5cf6\|#10b981\|#3b82f6\|#f59e0b\|#ef4444" app/components/tools/json-node.vue && echo "FAIL" || echo "PASS"
      2. Assert: "PASS" (no hardcoded colors remain)
      3. Run: grep -c "var(--syn-" app/components/tools/json-node.vue
      4. Assert: count >= 5 (all syntax colors use CSS variables)
    Expected Result: All hardcoded colors replaced with CSS variables
    Evidence: .omo/evidence/task-9-css-vars.txt

  Scenario: Tree expand/collapse functionality preserved
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000, JSON Formatter tab
      2. Paste: {"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}],"total":2}
      3. Click "格式化"
      4. Switch to tree view
      5. Click toggle on "users" array → assert children expand
      6. Click "收起全部" → assert all children collapse
      7. Click "展开全部" → assert all children expand
    Expected Result: Tree navigation works correctly with Win95 styling
    Evidence: .omo/evidence/task-9-tree-functional.png
  ```

  **Commit**: YES
  - Message: `style: redesign json-tree-view and json-node to Win95 aesthetic with CSS variables`
  - Files: `app/components/tools/json-tree-view.vue`, `app/components/tools/json-node.vue`

- [ ] 10. 重设计 `tool-placeholder` 组件为 Win95 风格

  **What to do**:
  - 编辑 `app/components/tools/tool-placeholder.vue`
  - **样式变更**（第 18-42 行）:
    - **替换**: `border: 1px dashed` → Win95 凹陷面板 + 虚线边框保持不变（占位符的"未完成"感）
    - **替换**: `border-radius: 18px` → `border-radius: 0`
    - **替换**: `color: var(--muted)` → `color: var(--win95-text-disabled)`（使用新变量）
    - 字体使用系统字体栈
    - "即将上线 · 敬请期待" 文字使用 Win95 禁用文本样式

  **Must NOT do**:
  - 不要修改 Props 接口（title, description）
  - 不要修改模板结构（h2 + p + span）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 最小组件（42 行），简单样式替换
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5-9)
  - **Blocks**: Task 11
  - **Blocked By**: Task 3

  **References**:
  - `app/components/tools/tool-placeholder.vue:1-42` - 完整占位符组件
  - `app/app.style.css` - CSS 变量定义（Task 3 输出）

  **Acceptance Criteria**:
  - [ ] 使用 `var(--win95-text-disabled)` 而非 `var(--muted)`
  - [ ] `border-radius: 0`
  - [ ] Props 接口不变
  - [ ] `npm run build` 成功

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Placeholder renders with Win95 style
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Click "SHA-256 工具" tab (placeholder tool)
      3. Screenshot: .omo/evidence/task-10-placeholder-desktop.png (viewport: 1440x900)
      4. Assert: title text visible
      5. Assert: description text visible
      6. Assert: "即将上线 · 敬请期待" text visible
      7. Assert: dashed border present, no rounded corners
    Expected Result: Placeholder with Win95 styling, all text visible
    Evidence: .omo/evidence/task-10-placeholder-desktop.png
  ```

  **Commit**: YES
  - Message: `style: redesign tool-placeholder to Win95 aesthetic`
  - Files: `app/components/tools/tool-placeholder.vue`

- [ ] 11. 编写 7 个组件快照测试 + 更新全局验证

  **What to do**:
  - 为每个组件创建快照测试文件（除 tool-placeholder 已由 Task 1 创建外）:
    - `app/components/tools/__tests__/json-formatter.test.ts`
    - `app/components/tools/__tests__/base64-encoder.test.ts`
    - `app/components/tools/__tests__/timestamp-converter.test.ts`
    - `app/components/tools/__tests__/json-tree-view.test.ts`
    - `app/components/tools/__tests__/json-node.test.ts`
    - `app/components/__tests__/app.test.ts` (shell 组件)
  - 每个测试文件结构:
    ```ts
    import { describe, it, expect } from 'vitest'
    import { mount } from '@vue/test-utils'
    import ComponentName from '../component-name.vue'

    describe('ComponentName', () => {
      it('matches snapshot', () => {
        const wrapper = mount(ComponentName, {
          props: { /* 组件需要的 props */ }
        })
        expect(wrapper.html()).toMatchSnapshot()
      })
    })
    ```
  - 更新 Task 1 创建的 tool-placeholder 测试（确保它使用 Win95 渲染的快照）
  - 运行 `npm test` — 确认 7 个测试全部通过
  - 运行 `npm run build` — 确认构建成功
  - **全局 grep 验证**:
    ```bash
    grep -r "backdrop-filter" app/                    # 期望: 零结果
    grep -r "var(--bg)\|var(--fg)\|var(--muted)\|var(--surface)" app/  # 期望: 零结果
    grep -r "toggleTheme\|data-theme" app/             # 期望: 零结果
    grep -r "linear-gradient" app/                     # 期望: ≤2 结果
    ```

  **Must NOT do**:
  - 不要创建复杂的交互测试（仅快照测试）
  - 不要修改组件源代码
  - 不要添加 e2e 测试依赖（Playwright 在 QA 场景中使用，不在此任务）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准快照测试编写，6 个文件遵循相同模板
  - **Skills**: 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: NO（依赖 Wave 2 所有组件完成）
  - **Parallel Group**: Wave 3 (sequential, follows Wave 2)
  - **Blocks**: None
  - **Blocked By**: Tasks 1 (vitest setup), 5, 6, 7, 8, 9, 10 (all component redesigns)

  **References**:
  - `app/components/tools/__tests__/tool-placeholder.test.ts` - Task 1 创建的示例测试
  - `app/components/tools/json-formatter.vue` - 了解 props 接口
  - `app/components/tools/base64-encoder.vue` - 无 props，使用 composable
  - `app/components/tools/timestamp-converter.vue` - 无 props，使用 composable
  - `app/components/tools/json-tree-view.vue` - 需要 `data` prop
  - `app/components/tools/json-node.vue` - 需要 `data`, `nodeKey`, `path`, `depth`, `expandedPaths` props
  - `app/app.vue` - 无 props（Nuxt app root）

  **Acceptance Criteria**:
  - [ ] 7 个测试文件存在（包括 Task 1 的 placeholder 测试）
  - [ ] `npm test` 全部通过（7 passed, 0 failed）
  - [ ] 所有 grep 验证通过（无旧变量、无毛玻璃、无主题切换残留）
  - [ ] `npm run build` 成功

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: All snapshot tests pass
    Tool: Bash
    Steps:
      1. Run: npm test
      2. Assert: exit code 0
      3. Assert: output contains "Tests 7 passed" (or 7+)
    Expected Result: All 7 snapshot tests pass
    Evidence: .omo/evidence/task-11-tests-pass.txt

  Scenario: Zero remnants of old style
    Tool: Bash
    Steps:
      1. Run: grep -r "backdrop-filter" app/ | wc -l
      2. Assert: count = 0
      3. Run: grep -r "var(--bg)" app/ | wc -l
      4. Assert: count = 0
      5. Run: grep -r "toggleTheme" app/ | wc -l
      6. Assert: count = 0
      7. Run: grep -r "data-theme" app/ | wc -l
      8. Assert: count = 0
    Expected Result: All zero results — clean Win95 codebase
    Evidence: .omo/evidence/task-11-clean-grep.txt

  Scenario: Build still works
    Tool: Bash
    Steps:
      1. Run: npm run build
      2. Assert: exit code 0
    Expected Result: Production build succeeds
    Evidence: .omo/evidence/task-11-build.txt
  ```

  **Commit**: YES
  - Message: `test: add snapshot tests for all 7 components`
  - Files: `app/**/__tests__/*.test.ts`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .omo/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + `npm test`. Review all changed files for: hardcoded colors (not using CSS variables), `backdrop-filter` or `linear-gradient` leftovers, `border-radius` > 2px, duplicate button CSS, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Test [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state (`npm run dev`). Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration: all 4 tool tabs working, theme toggle absent, status bar visible, responsive layout at 375px and 1440px. Test edge cases: empty state in JSON formatter, invalid Base64 input, empty timestamp fields.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `chore(test): set up vitest + @nuxt/test-utils` - vitest.config.ts, package.json
- **2**: `chore: delete dead code app.setup.ts` - app/app.setup.ts
- **3**: `style: define Win95 CSS variables and shared button classes` - app/app.style.css
- **4**: `refactor: remove dark/light theme toggle from useAppShell` - app/composables/useAppShell.ts
- **5**: `style: redesign app shell to Win95 layout with status bar` - app/app.vue
- **6**: `style: redesign json-formatter to Win95 aesthetic` - app/components/tools/json-formatter.vue, app/components/tools/json-formatter.style.css
- **7**: `style: redesign base64-encoder to Win95 aesthetic` - app/components/tools/base64-encoder.vue
- **8**: `style: redesign timestamp-converter to Win95 aesthetic` - app/components/tools/timestamp-converter.vue
- **9**: `style: redesign json-tree-view and json-node to Win95 aesthetic` - app/components/tools/json-tree-view.vue, app/components/tools/json-node.vue
- **10**: `style: redesign tool-placeholder to Win95 aesthetic` - app/components/tools/tool-placeholder.vue
- **11**: `test: add snapshot tests for all 7 components` - app/**/*.test.ts

## Success Criteria

### Verification Commands
```bash
npm run build                                    # Expected: zero errors
npm test                                         # Expected: 7 tests pass
grep -r "backdrop-filter" app/                   # Expected: NO results
grep -r "var(--bg)" app/                         # Expected: NO results
grep -r "toggleTheme\|data-theme" app/            # Expected: NO results
grep -r "linear-gradient" app/                   # Expected: ≤2 results (error banner only)
```

### Final Checklist
- [ ] All "Must Have" present (12 Win95 CSS variables, 3D borders, shared button classes, flat colors, status bar)
- [ ] All "Must NOT Have" absent (no glassmorphism, no rounded corners, no gradients, no theme toggle)
- [ ] All 7 snapshot tests pass
- [ ] All 4 tool pages function correctly
- [ ] Desktop (1440px) and mobile (375px) screenshots match Win95 aesthetic
