import { computed, ref } from 'vue'

interface Props {
  layout?: 'full' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'compact'
})

const input = ref('')
const output = ref('')
const error = ref('')
const indentMode = ref<'2' | '4' | 'tab'>('2')

const indentString = computed(() => {
  if (indentMode.value === 'tab') {
    return '\t'
  }
  return ' '.repeat(Number(indentMode.value))
})

const isInputEmpty = computed(() => input.value.trim().length === 0)

const paneColumns = computed(() => {
  if (props.layout === 'full') {
    return 'repeat(auto-fit, minmax(45%, 1fr))'
  }
  return 'repeat(auto-fit, minmax(360px, 1fr))'
})

const sizeStats = computed(() => {
  if (!output.value) {
    return { chars: 0, keys: 0 }
  }
  try {
    const parsed = JSON.parse(output.value)
    return {
      chars: output.value.length,
      keys: countKeys(parsed)
    }
  } catch (err) {
    return { chars: output.value.length, keys: 0 }
  }
})

const countKeys = (value: unknown): number => {
  if (Array.isArray(value)) {
    return value.reduce((acc, item) => acc + countKeys(item), 0)
  }
  if (value && typeof value === 'object') {
    return Object.values(value).reduce((acc, item) => acc + countKeys(item), Object.keys(value as Record<string, unknown>).length)
  }
  return 0
}

const formatJson = () => {
  if (isInputEmpty.value) {
    return
  }
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed, null, indentString.value)
    error.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误'
  }
}

const compactJson = () => {
  if (isInputEmpty.value) {
    return
  }
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed)
    error.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误'
  }
}

const resetJson = () => {
  input.value = ''
  output.value = ''
  error.value = ''
}

const copyOutput = async () => {
  if (!output.value) {
    return
  }
  await navigator.clipboard.writeText(output.value)
}

const downloadOutput = () => {
  if (!output.value) {
    return
  }
  const blob = new Blob([output.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'formatted.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export {
  compactJson,
  copyOutput,
  downloadOutput,
  error,
  formatJson,
  indentMode,
  input,
  isInputEmpty,
  output,
  paneColumns,
  resetJson,
  sizeStats
}
