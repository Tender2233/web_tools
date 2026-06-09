import { computed, ref, watch } from 'vue'

interface Base64Stats {
  inputSize: number
  outputSize: number
  ratio: string
}

export type Base64Variant = 'standard' | 'url'

export const useBase64 = () => {
  const input = ref('')
  const output = ref('')
  const error = ref('')
  const mode = ref<'encode' | 'decode'>('encode')
  const variant = ref<Base64Variant>('standard')

  const isInputEmpty = computed(() => input.value.trim().length === 0)
  const hasValidOutput = computed(() => output.value.length > 0 && !error.value)

  const stats = computed<Base64Stats>(() => {
    const inputSize = new TextEncoder().encode(input.value).length
    const outputSize = new TextEncoder().encode(output.value).length
    const ratio = inputSize > 0 ? ((outputSize / inputSize) * 100).toFixed(1) : '0.0'
    return { inputSize, outputSize, ratio }
  })

  // ── Core UTF-8 safe standard Base64 encode/decode ──────────────────────

  const _encodeStandard = (text: string): string => {
    const uint8Array = new TextEncoder().encode(text)
    let binaryString = ''
    uint8Array.forEach(byte => {
      binaryString += String.fromCharCode(byte)
    })
    return btoa(binaryString)
  }

  const _decodeStandard = (base64: string): string => {
    const binaryString = atob(base64.trim())
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const decoder = new TextDecoder('utf-8', { fatal: true })
    return decoder.decode(bytes)
  }

  // ── URL-safe Base64 (base64url) helpers ────────────────────────────────

  const _encodeUrl = (text: string): string => {
    return _encodeStandard(text)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const _decodeUrl = (base64url: string): string => {
    let base64 = base64url.trim()
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    // Restore padding
    switch (base64.length % 4) {
      case 2: base64 += '=='; break
      case 3: base64 += '='; break
    }
    return _decodeStandard(base64)
  }

  // ── Public actions ─────────────────────────────────────────────────────

  const encode = () => {
    if (isInputEmpty.value) {
      output.value = ''
      error.value = ''
      return
    }

    try {
      error.value = ''
      mode.value = 'encode'
      output.value = variant.value === 'url'
        ? _encodeUrl(input.value)
        : _encodeStandard(input.value)
    } catch (err) {
      if (err instanceof Error) {
        error.value = `编码失败: ${err.message}`
      } else {
        error.value = '编码失败'
      }
      output.value = ''
    }
  }

  const decode = () => {
    if (isInputEmpty.value) {
      output.value = ''
      error.value = ''
      return
    }

    try {
      error.value = ''
      mode.value = 'decode'

      if (variant.value === 'url') {
        // Validate base64url format
        const urlPattern = /^[A-Za-z0-9\-_]*$/
        if (!urlPattern.test(input.value.trim())) {
          throw new Error('无效的 Base64 URL 安全格式')
        }
        output.value = _decodeUrl(input.value)
      } else {
        // Validate standard base64 format
        const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
        if (!base64Pattern.test(input.value.trim())) {
          throw new Error('无效的 Base64 格式')
        }
        output.value = _decodeStandard(input.value)
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = `解码失败: ${err.message}`
      } else {
        error.value = '解码失败'
      }
      output.value = ''
    }
  }

  const clearAll = () => {
    input.value = ''
    output.value = ''
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

  const downloadOutput = () => {
    if (!hasValidOutput.value) {
      return
    }
    const extension = variant.value === 'url'
      ? (mode.value === 'encode' ? 'b64url' : 'txt')
      : (mode.value === 'encode' ? 'b64' : 'txt')
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `base64-${mode.value}-${Date.now()}.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    input,
    output,
    error,
    mode,
    variant,
    stats,
    isInputEmpty,
    hasValidOutput,
    encode,
    decode,
    clearAll,
    copyOutput,
    downloadOutput
  }
}
