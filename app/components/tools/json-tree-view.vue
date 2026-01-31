<template>
  <div class="json-tree" ref="treeRef">
    <JsonNode
      :data="data"
      :path="'root'"
      :depth="0"
      :expanded-paths="expandedPaths"
      @toggle="togglePath"
    />
  </div>
</template>

<script setup lang="ts">
import JsonNode from './json-node.vue'

const props = defineProps<{
  data: unknown
}>()

const treeRef = ref<HTMLDivElement | null>(null)
const expandedPaths = ref<Set<string>>(new Set(['root']))

const togglePath = (path: string) => {
  const newSet = new Set(expandedPaths.value)
  if (newSet.has(path)) {
    newSet.delete(path)
  } else {
    newSet.add(path)
  }
  expandedPaths.value = newSet
}

const expandAll = () => {
  if (!props.data) return
  
  const allPaths = new Set<string>()
  const collectPaths = (value: unknown, path: string) => {
    allPaths.add(path)
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        collectPaths(item, `${path}[${index}]`)
      })
    } else if (value && typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
        collectPaths(val, `${path}.${key}`)
      })
    }
  }
  collectPaths(props.data, 'root')
  expandedPaths.value = allPaths
}

const collapseAll = () => {
  expandedPaths.value = new Set(['root'])
}

// 处理复制事件，将选中节点的JSON写入剪贴板
const handleCopy = (event: ClipboardEvent) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  // 检查选择是否在树形视图内
  const range = selection.getRangeAt(0)
  if (!treeRef.value?.contains(range.commonAncestorContainer)) return
  
  // 查找选择范围内的所有节点
  const selectedNodes: HTMLElement[] = []
  let node = range.startContainer
  
  // 向上查找最近的带有data-json-path的元素
  while (node && node !== treeRef.value) {
    if (node instanceof HTMLElement && node.hasAttribute('data-json-path')) {
      selectedNodes.push(node)
      break
    }
    if (node.parentElement) {
      node = node.parentElement
    } else {
      break
    }
  }
  
  if (selectedNodes.length === 0) return
  
  // 获取最小节点的JSON数据
  const targetNode = selectedNodes[0]
  if (!targetNode) return
  const jsonValue = targetNode.getAttribute('data-json-value')
  
  if (!jsonValue) return
  
  try {
    // 解析并格式化JSON
    const parsed = JSON.parse(jsonValue)
    const formatted = JSON.stringify(parsed, null, 2)
    
    // 写入剪贴板
    event.preventDefault()
    event.clipboardData?.setData('text/plain', formatted)
  } catch (err) {
    // 解析失败，使用默认行为
    console.error('Failed to parse JSON for copy:', err)
  }
}

onMounted(() => {
  document.addEventListener('copy', handleCopy)
})

onBeforeUnmount(() => {
  document.removeEventListener('copy', handleCopy)
})

// 暴露方法给父组件
defineExpose({
  expandAll,
  collapseAll
})
</script>

<style scoped>
.json-tree {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Cascadia Code', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  user-select: text;
  color: var(--fg);
}
</style>
