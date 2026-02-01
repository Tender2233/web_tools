import { computed, ref } from 'vue'

interface Base64Stats {
  inputSize: number
  outputSize: number
  ratio: string
}

export const useBase64 = () => {
  const input = ref('')
  const output = ref('')
  const error = ref('')
  const mode = ref<'encode' | 'decode'>('encode')

  const isInputEmpty = computed(() => input.value.trim().length === 0)
  const hasValidOutput = computed(() => output.value.length > 0 && !error.value)

  const stats = computed<Base64Stats>(() => {
    const inputSize = new TextEncoder().encode(input.value).length
    const outputSize = new TextEncoder().encode(output.value).length
    const ratio = inputSize > 0 ? ((outputSize / inputSize) * 100).toFixed(1) : '0.0'
    return { inputSize, outputSize, ratio }
  })

  const encode = () => {
    if (isInputEmpty.value) {
      output.value = ''
      error.value = ''
      return
    }

    try {
      error.value = ''
      mode.value = 'encode'
      
      // Use TextEncoder for UTF-8 safe encoding
      const encoder = new TextEncoder()
      const uint8Array = encoder.encode(input.value)
      
      // Convert Uint8Array to binary string
      let binaryString = ''
      uint8Array.forEach(byte => {
        binaryString += String.fromCharCode(byte)
      })
      
      // Encode to base64
      output.value = btoa(binaryString)
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
      
      // Validate base64 format
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
      if (!base64Pattern.test(input.value.trim())) {
        throw new Error('无效的 Base64 格式')
      }
      
      // Decode from base64
      const binaryString = atob(input.value.trim())
      
      // Convert binary string to Uint8Array
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // Use TextDecoder for UTF-8 safe decoding
      const decoder = new TextDecoder('utf-8', { fatal: true })
      output.value = decoder.decode(bytes)
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
    const extension = mode.value === 'encode' ? 'b64' : 'txt'
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
