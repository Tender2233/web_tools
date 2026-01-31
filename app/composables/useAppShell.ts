import type { Component } from 'vue'

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

export const useAppShell = () => {
  const activeTool = useState<ToolId>('active-tool', () => 'json')
  const theme = useState<'dark' | 'light'>('web-tools-theme', () => 'dark')

  const toolComponents = {
    json: defineAsyncComponent(() => import('~/components/tools/json-formatter.vue')),
    base64: defineAsyncComponent(() => import('~/components/tools/tool-placeholder.vue')),
    hash: defineAsyncComponent(() => import('~/components/tools/tool-placeholder.vue'))
  } as Record<ToolId, Component>

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
    const meta = activeToolMeta.value
    return {
      title: meta?.label ?? '',
      description: meta?.description ?? ''
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

  return {
    activeComponent,
    activeTool,
    activeToolProps,
    selectTool,
    theme,
    tools,
    toggleTheme
  }
}
