import { computed, ref, watch } from 'vue'

interface JsonStats {
  chars: number
  bytes: number
  lines: number
  keys: number
  depth: number
}

export const useJsonFormatter = () => {
  const input = ref('')
  const output = ref('')
  const error = ref('')
  const parsedValue = ref<unknown | null>(null)
  const indentSize = ref<2 | 4>(2)

  const isInputEmpty = computed(() => input.value.trim().length === 0)
  const hasValidOutput = computed(() => output.value.length > 0 && !error.value)

  const countKeys = (value: unknown): number => {
    if (Array.isArray(value)) {
      return value.reduce((acc: number, item) => acc + countKeys(item), 0)
    }
    if (value && typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      return Object.keys(obj).length + Object.values(obj).reduce((acc: number, item) => acc + countKeys(item), 0)
    }
    return 0
  }

  const getDepth = (value: unknown, current = 0): number => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return current
      }
      return Math.max(...value.map(item => getDepth(item, current + 1)))
    }
    if (value && typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      const keys = Object.keys(obj)
      if (keys.length === 0) {
        return current
      }
      return Math.max(...keys.map(key => getDepth(obj[key], current + 1)))
    }
    return current
  }

  const stats = computed<JsonStats>(() => {
    const chars = output.value.length
    const bytes = new TextEncoder().encode(output.value).length
    const lines = output.value ? output.value.split('\n').length : 0
    const keys = parsedValue.value ? countKeys(parsedValue.value) : 0
    const depth = parsedValue.value ? getDepth(parsedValue.value) : 0
    return { chars, bytes, lines, keys, depth }
  })

  const tryParse = (source: string): { parsed: unknown; error: string } => {
    try {
      const parsed = JSON.parse(source)
      return { parsed, error: '' }
    } catch (err) {
      if (err instanceof SyntaxError) {
        return { parsed: null, error: err.message }
      }
      return { parsed: null, error: '解析失败' }
    }
  }

  const formatJson = () => {
    if (isInputEmpty.value) {
      output.value = ''
      parsedValue.value = null
      error.value = ''
      return
    }

    const result = tryParse(input.value)
    if (result.error) {
      error.value = result.error
      output.value = ''
      parsedValue.value = null
      return
    }

    error.value = ''
    parsedValue.value = result.parsed
    output.value = JSON.stringify(result.parsed, null, indentSize.value)
  }

  const minifyJson = () => {
    if (isInputEmpty.value) {
      output.value = ''
      parsedValue.value = null
      error.value = ''
      return
    }

    const result = tryParse(input.value)
    if (result.error) {
      error.value = result.error
      output.value = ''
      parsedValue.value = null
      return
    }

    error.value = ''
    parsedValue.value = result.parsed
    output.value = JSON.stringify(result.parsed)
  }

  const clearAll = () => {
    input.value = ''
    output.value = ''
    parsedValue.value = null
    error.value = ''
  }

  const copyOutput = async () => {
    if (!hasValidOutput.value) {
      return
    }
    try {
      await navigator.clipboard.writeText(output.value)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const downloadJson = () => {
    if (!hasValidOutput.value) {
      return
    }
    const blob = new Blob([output.value], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `formatted-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Auto-format on input change (debounced)
  let formatTimer: ReturnType<typeof setTimeout> | null = null
  watch(input, () => {
    if (formatTimer) {
      clearTimeout(formatTimer)
    }
    formatTimer = setTimeout(() => {
      if (!isInputEmpty.value) {
        formatJson()
      } else {
        output.value = ''
        parsedValue.value = null
        error.value = ''
      }
    }, 300)
  })

  // Re-format on indent size change
  watch(indentSize, () => {
    if (parsedValue.value !== null) {
      output.value = JSON.stringify(parsedValue.value, null, indentSize.value)
    }
  })

  return {
    input,
    output,
    error,
    indentSize,
    stats,
    isInputEmpty,
    hasValidOutput,
    parsedValue,
    formatJson,
    minifyJson,
    clearAll,
    copyOutput,
    downloadJson
  }
}
