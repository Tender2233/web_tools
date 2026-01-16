<template>
  <div class="page" :data-theme="theme">
    <div class="shell">
      <header class="topbar" aria-label="工具切换与主题设置">
        <div class="brand-chip">Web Tools · Preview</div>
        <button class="toggle" type="button" @click="toggleTheme" aria-label="切换主题">
          <span class="toggle__icon" aria-hidden="true">
            <span v-if="theme === 'dark'">☀️</span>
            <span v-else>🌙</span>
          </span>
        </button>
      </header>

      <section class="workspace">
        <div class="tabs" role="tablist">
          <button
            v-for="tool in tools"
            :key="tool.id"
            class="tab"
            type="button"
            role="tab"
            :aria-selected="activeTool === tool.id"
            @click="selectTool(tool.id)"
            :title="tool.description"
          >
            <span class="tab__label">{{ tool.label }}</span>
            <small class="tab__badge">{{ tool.badge }}</small>
          </button>
        </div>
        <div class="surface">
          <div class="surface__content">
            <Suspense>
              <component :is="activeComponent" v-bind="activeToolProps" />
              <template #fallback>
                <div class="loading">正在唤醒工具...</div>
              </template>
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, watch } from 'vue'

type ToolId = 'json' | 'base64' | 'hash'

type ToolMeta = {
  id: ToolId
  label: string
  badge: string
  description: string
  soon?: boolean
}

const tools: ToolMeta[] = [
  {
    id: 'json',
    label: 'JSON 格式化',
    badge: 'Current',
    description: '格式化 / 压缩并校验 JSON'
  },
  {
    id: 'base64',
    label: 'Base64 编解码',
    badge: 'Next',
    description: 'UTF-8 安全的编码与解码',
    soon: true
  },
  {
    id: 'hash',
    label: 'SHA-256 工具',
    badge: 'Lab',
    description: '生成十六进制与 Base64 摘要',
    soon: true
  }
]

const activeTool = useState<ToolId>('active-tool', () => 'json')
const theme = useState<'dark' | 'light'>('web-tools-theme', () => 'dark')

const toolComponents = {
  json: defineAsyncComponent(() => import('~/components/tools/json-formatter.vue')),
  base64: defineAsyncComponent(() => import('~/components/tools/tool-placeholder.vue')),
  hash: defineAsyncComponent(() => import('~/components/tools/tool-placeholder.vue'))
} satisfies Record<ToolId, ReturnType<typeof defineAsyncComponent>>

const selectTool = (id: ToolId) => {
  activeTool.value = id
}

const activeComponent = computed(() => toolComponents[activeTool.value])

const activeToolMeta = computed(() => tools.find(tool => tool.id === activeTool.value) ?? tools[0])

const activeToolProps = computed(() => {
  if (activeTool.value === 'json') {
    return {
      layout: 'full'
    }
  }
  return {
    title: activeToolMeta.value.label,
    description: activeToolMeta.value.description
  }
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

onMounted(() => {
  if (!import.meta.client) {
    return
  }
  const stored = window.localStorage.getItem('web-tools-theme')
  if (stored === 'light' || stored === 'dark') {
    theme.value = stored
  } else {
    window.localStorage.setItem('web-tools-theme', theme.value)
  }
})

watch(
  () => theme.value,
  value => {
    if (!import.meta.client) {
      return
    }
    window.localStorage.setItem('web-tools-theme', value)
  }
)
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #05060b;
}

.page {
  min-height: 100vh;
  padding: clamp(1.5rem, 4vw, 4rem);
  color: var(--fg);
  background: radial-gradient(circle at top, rgba(98, 108, 255, 0.18), transparent 45%),
    radial-gradient(circle at 20% 20%, rgba(0, 172, 193, 0.2), transparent 35%),
    var(--bg);
  transition: background 0.3s ease, color 0.3s ease;
}

.shell {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - clamp(3rem, 10vw, 5rem));
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.brand-chip {
  border: 1px solid var(--border);
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.toggle__icon {
  font-size: 1.2rem;
}

.workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page[data-theme='dark'] {
  --bg: #04060d;
  --fg: #f5f6fb;
  --muted: rgba(245, 246, 251, 0.7);
  --surface: rgba(255, 255, 255, 0.04);
  --surface-strong: rgba(255, 255, 255, 0.08);
  --border: rgba(255, 255, 255, 0.1);
  --accent: #6d7bff;
  --shadow: 0 20px 80px rgba(0, 0, 0, 0.45);
}

.page[data-theme='light'] {
  --bg: #f8f9ff;
  --fg: #0b0d18;
  --muted: rgba(11, 13, 24, 0.68);
  --surface: rgba(255, 255, 255, 0.85);
  --surface-strong: rgba(255, 255, 255, 0.95);
  --border: rgba(11, 13, 24, 0.08);
  --accent: #4a5cff;
  --shadow: 0 20px 60px rgba(25, 33, 86, 0.18);
}


.tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18%, 1fr));
  gap: 1%;
}

.tab {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  text-align: left;
  cursor: pointer;
  color: var(--fg);
  transition: border 0.3s ease, transform 0.3s ease, background 0.3s ease;
}

.tab[aria-selected='true'] {
  border-color: var(--accent);
  background: rgba(109, 123, 255, 0.12);
  transform: translateY(-2px);
}

.tab__label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}

.tab__badge {
  color: var(--accent);
  font-size: 0.8rem;
}

.surface {
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--surface);
  padding: clamp(1rem, 2vw, 1.5rem);
  box-shadow: var(--shadow);
  flex: 1;
  min-height: 70vh;
  display: flex;
}

.surface__content {
  width: 100%;
}

.loading {
  min-height: 40vh;
  display: grid;
  place-items: center;
  color: var(--muted);
}

@media (max-width: 720px) {
  .page {
    padding: 1.5rem 1rem 2rem;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .surface {
    min-height: auto;
  }
}


</style>
