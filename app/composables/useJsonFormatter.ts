import { computed, ref, watch } from 'vue'

export const useJsonFormatter = () => {
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

  const paneColumns = computed(() => 'repeat(auto-fit, minmax(360px, 1fr))')

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
      return Object.values(value).reduce(
        (acc, item) => acc + countKeys(item),
        Object.keys(value as Record<string, unknown>).length
      )
    }
    return 0
  }

  let suppressInputWatch = false
  let suppressOutputWatch = false

  const updateInputSilently = (value: string) => {
    if (input.value === value) {
      return
    }
    suppressInputWatch = true
    input.value = value
    queueMicrotask(() => {
      suppressInputWatch = false
    })
  }

  const updateOutputSilently = (value: string) => {
    if (output.value === value) {
      return
    }
    suppressOutputWatch = true
    output.value = value
    queueMicrotask(() => {
      suppressOutputWatch = false
    })
  }

  const formatJsonInternal = (opts?: { silent?: boolean }) => {
    if (isInputEmpty.value) {
      updateOutputSilently('')
      return
    }
    try {
      const parsed = JSON.parse(input.value)
      updateOutputSilently(JSON.stringify(parsed, null, indentString.value))
      error.value = ''
    } catch (err) {
      if (!opts?.silent) {
        error.value = err instanceof Error ? err.message : '未知错误'
      }
    }
  }

  const compactJson = () => {
    const source = output.value.trim() ? output.value : input.value
    if (!source.trim()) {
      return
    }
    try {
      const parsed = JSON.parse(source)
      const compacted = JSON.stringify(parsed)
      updateOutputSilently(compacted)
      updateInputSilently(compacted)
      error.value = ''
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
    }
  }

  const resetJson = () => {
    updateInputSilently('')
    updateOutputSilently('')
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

  watch(
    () => input.value,
    () => {
      if (suppressInputWatch) {
        return
      }
      error.value = ''
      if (isInputEmpty.value) {
        updateOutputSilently('')
        return
      }
      formatJsonInternal({ silent: true })
    }
  )

  const formatJson = () => {
    formatJsonInternal()
  }

  watch(

    () => output.value,
    newValue => {
      if (suppressOutputWatch) {
        return
      }
      if (newValue === input.value) {
        return
      }
      updateInputSilently(newValue)
    }
  )

  return {
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
}
