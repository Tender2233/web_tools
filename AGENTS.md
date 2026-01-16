# AGENTS

## Mission & Deployment
- Deliver a **pure-frontend utility hub** that can be dropped onto any CDN as static files (via `nuxt generate`).
- Prioritize minimal dependencies and fast first paint: target <100 KB initial JS payload, zero blocking external fonts, and immediate usable layout.
- Avoid Nuxt server features (no server routes, no server middleware). Keep everything inside the SPA/runtime bundle.

## Architecture & Folder Expectations
- Keep the project single-route for now (`app/app.vue` as the shell) and swap tool modules inside the page via lightweight tabs/panels.
- Shared UI primitives live in `app/components/ui`. Individual tools belong in `app/components/tools/<tool-name>.vue` plus any helper composables under `app/composables`.
- Use `<script setup lang="ts">` consistently; rely on Nuxt auto-imports when possible.
- Style blocks should be `scoped` and prefer CSS variables defined at the root of the page for theming.

## Performance Guardrails
- Lazy-load heavy tool modules with dynamic imports; keep the landing shell (banner, tool list, empty state) under 30 KB.
- Reuse browser-native APIs (e.g., `crypto.subtle`, `TextEncoder/Decoder`) before adding new libraries.
- Debounce expensive operations (formatting, hashing) and keep the UI responsive by offloading sustained work to `requestIdleCallback` when reasonable.

## Feature Roadmap
1. **Foundation**: Build the landing layout, tool switcher, shared copy/download actions, responsive typography, and light/dark theme toggle stored in `localStorage`.
2. **JSON Formatter/Editor** (MVP feature):
   - Dual-pane (input/output) editor with format/compact buttons.
   - Error reporting banner when `JSON.parse` fails, without throwing.
   - Controls for indentation (2/4 spaces, tabs) and live min/max stats (size, key count).
   - Copy, download, and clear actions.
3. **Base64 Encode/Decode**: leverage `btoa`/`atob` plus UTF-8 safe fallbacks via `TextEncoder`/`TextDecoder`.
4. **Hash Utilities**: Start with SHA-256 hashing using `crypto.subtle.digest`; expose hex & base64 outputs. (User mentioned "sha235" but we standardize on SHA-256.)
5. Future tools should follow the same pattern: self-contained component + shared action bar hook.

## Coding Conventions
- Type everything (no `any`). Derive tool-specific types in `types` folder if they grow large.
- Keep functions pure; side effects belong in composables.
- Prefer `useState`/`useStorage` from Nuxt for persistent UI preferences.
- Never add inline comments unless clarifying complex logic; rely on clear naming.
- When adding dependencies, justify them in PR/commit body with bundle impact.

## Testing & Validation
- Manual QA via `npm run dev` plus story-style tool toggles.
- Before shipping, run `npm run generate` to ensure the build is static-friendly.
- For deterministic utilities (e.g., hash helpers), add Vitest unit tests under `tests/` once the testing harness is introduced; until then rely on composable-level tests.

## Current Implementation Plan
1. 统一 landing 布局为紧凑 topbar + workspace，移除多余介绍模块以扩大工具区域。
2. 将主题切换重构为右上角图标按钮，常驻全局且不遮挡内容。
3. JSON 工具需占据主要视觉空间，提供足够高度与双栏布局支持巨型输入。
4. 预留 tabs/placeholder，方便后续接入 Base64 与 SHA-256 工具。
5. 精简顶部以外的文案/装饰，将 tabs 与工具面板压缩为百分比布局，让可交互区域填满余下页面。
6. 去除多余标题与描述，仅保留极简 topbar（标记 + 主题按钮），其余高度交由工具面板使用。
7. 适配 2K/MacBook 视口，确保主要操作（复制 / 下载等）无需滚动即可呈现，优先使用百分比高度与弹性布局。
