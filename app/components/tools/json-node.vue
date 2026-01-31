<template>
  <div class="json-node" :style="{ paddingLeft: `${depth * 1.25}rem` }">
    <div class="json-node__line" :data-json-path="path" :data-json-value="dataJson">
      <!-- Toggle button for objects/arrays -->
      <button
        v-if="isExpandable"
        type="button"
        class="json-node__toggle"
        @click="handleToggle"
        :aria-label="isExpanded ? '折叠' : '展开'"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path v-if="isExpanded" d="M1 3 L5 7 L9 3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path v-else d="M3 1 L7 5 L3 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
      </button>
      <span v-else class="json-node__spacer"></span>

      <!-- Key (for object properties) -->
      <span v-if="nodeKey !== null" class="json-node__key">{{ nodeKey }}:</span>

      <!-- Value preview -->
      <span v-if="isExpandable" class="json-node__bracket">
        <span class="json-node__bracket-symbol">{{ isArray ? '[' : '{' }}</span>
        <span v-if="!isExpanded" class="json-node__preview">
          {{ previewText }}
        </span>
        <span v-if="!isExpanded" class="json-node__bracket-symbol">{{ isArray ? ']' : '}' }}</span>
        <span v-if="itemCount > 0" class="json-node__count">{{ itemCount }} {{ isArray ? 'items' : 'keys' }}</span>
      </span>
      <span v-else :class="valueClass">{{ formattedValue }}</span>
    </div>

    <!-- Children (when expanded) -->
    <template v-if="isExpandable && isExpanded">
      <JsonNode
        v-for="(child, index) in children"
        :key="child.key"
        :data="child.value"
        :node-key="child.key"
        :path="child.path"
        :depth="depth + 1"
        :expanded-paths="expandedPaths"
        @toggle="$emit('toggle', $event)"
      />
      <div class="json-node__line" :style="{ paddingLeft: `${depth * 1.25}rem` }">
        <span class="json-node__spacer"></span>
        <span class="json-node__bracket-symbol">{{ isArray ? ']' : '}' }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Child {
  key: string
  value: unknown
  path: string
}

const props = defineProps<{
  data: unknown
  nodeKey?: string | null
  path: string
  depth: number
  expandedPaths: Set<string>
}>()

const emit = defineEmits<{
  toggle: [path: string]
}>()

const isArray = computed(() => Array.isArray(props.data))
const isObject = computed(() => props.data && typeof props.data === 'object' && !isArray.value)
const isExpandable = computed(() => isArray.value || isObject.value)
const isExpanded = computed(() => props.expandedPaths.has(props.path))

const dataJson = computed(() => {
  try {
    return JSON.stringify(props.data)
  } catch {
    return ''
  }
})

const itemCount = computed(() => {
  if (isArray.value) {
    return (props.data as unknown[]).length
  }
  if (isObject.value) {
    return Object.keys(props.data as Record<string, unknown>).length
  }
  return 0
})

const children = computed<Child[]>(() => {
  if (!isExpandable.value) return []
  
  if (isArray.value) {
    return (props.data as unknown[]).map((item, index) => ({
      key: String(index),
      value: item,
      path: `${props.path}[${index}]`
    }))
  }
  
  if (isObject.value) {
    return Object.entries(props.data as Record<string, unknown>).map(([key, value]) => ({
      key,
      value,
      path: `${props.path}.${key}`
    }))
  }
  
  return []
})

const previewText = computed(() => {
  if (!isExpandable.value) return ''
  if (itemCount.value === 0) return ''
  
  if (isArray.value) {
    const items = props.data as unknown[]
    const preview = items.slice(0, 3).map(formatPreview).join(', ')
    return itemCount.value > 3 ? `${preview}, ...` : preview
  }
  
  if (isObject.value) {
    const entries = Object.entries(props.data as Record<string, unknown>)
    const preview = entries.slice(0, 2).map(([k]) => k).join(', ')
    return itemCount.value > 2 ? `${preview}, ...` : preview
  }
  
  return ''
})

const formatPreview = (value: unknown): string => {
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value.substring(0, 10)}${value.length > 10 ? '...' : ''}"`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return '[...]'
  if (typeof value === 'object') return '{...}'
  return '...'
}

const formattedValue = computed(() => {
  const value = props.data
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return String(value)
})

const valueClass = computed(() => {
  const value = props.data
  if (value === null || value === undefined) return 'json-node__value--null'
  if (typeof value === 'string') return 'json-node__value--string'
  if (typeof value === 'number') return 'json-node__value--number'
  if (typeof value === 'boolean') return 'json-node__value--boolean'
  return 'json-node__value'
})

const handleToggle = () => {
  emit('toggle', props.path)
}
</script>

<style scoped>
.json-node {
  position: relative;
}

.json-node__line {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0;
  min-height: 1.6rem;
}

.json-node__toggle {
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.json-node__toggle:hover {
  background: var(--surface-strong);
  color: var(--accent);
}

.json-node__spacer {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.json-node__key {
  color: #8b5cf6;
  font-weight: 500;
  user-select: text;
}

.json-node__bracket {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  user-select: text;
}

.json-node__bracket-symbol {
  color: var(--muted);
  font-weight: 600;
  user-select: text;
}

.json-node__preview {
  color: var(--muted);
  font-style: italic;
  opacity: 0.7;
  user-select: text;
}

.json-node__count {
  color: var(--muted);
  font-size: 0.75rem;
  opacity: 0.6;
  user-select: none;
  margin-left: 0.25rem;
}

.json-node__value {
  user-select: text;
}

.json-node__value--string {
  color: #10b981;
  user-select: text;
}

.json-node__value--number {
  color: #3b82f6;
  user-select: text;
}

.json-node__value--boolean {
  color: #f59e0b;
  font-weight: 500;
  user-select: text;
}

.json-node__value--null {
  color: #ef4444;
  font-style: italic;
  user-select: text;
}
</style>
