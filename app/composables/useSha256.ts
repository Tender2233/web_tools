import { computed, ref, watch } from 'vue'

interface Sha256Stats {
  inputBytes: number
  hashBits: number
  algorithm: string
}

/**
 * Compute SHA-256 digest of the input string using the Web Crypto API.
 * Returns both hex and base64 representations.
 *
 * Features:
 * - Auto-compute with 300ms debounce
 * - Hex digest output
 * - Base64 digest output
 * - Copy to clipboard
 * - Download digest as .txt
 */
export const useSha256 = () => {
  const input = ref('')
  const hexDigest = ref('')
  const base64Digest = ref('')
  const error = ref('')
  // Track input length at the time of last successful hash for stats
  const lastInputByteLength = ref(0)

  const isInputEmpty = computed(() => input.value.trim().length === 0)
  const hasValidOutput = computed(() => hexDigest.value.length > 0 && !error.value)

  const stats = computed<Sha256Stats>(() => ({
    inputBytes: lastInputByteLength.value,
    hashBits: 256,
    algorithm: 'SHA-256'
  }))

  /**
   * Compute the SHA-256 hash from the current input.
   * Updates hexDigest, base64Digest, error, and lastInputByteLength.
   */
  const computeHash = async () => {
    if (isInputEmpty.value) {
      hexDigest.value = ''
      base64Digest.value = ''
      error.value = ''
      lastInputByteLength.value = 0
      return
    }

    try {
      error.value = ''

      // Encode input string as UTF-8 bytes
      const encoder = new TextEncoder()
      const data = encoder.encode(input.value)
      lastInputByteLength.value = data.length

      // Compute SHA-256 digest via Web Crypto API
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))

      // Hex representation
      hexDigest.value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Base64 representation
      let binaryString = ''
      hashArray.forEach(byte => {
        binaryString += String.fromCharCode(byte)
      })
      base64Digest.value = btoa(binaryString)
    } catch (err) {
      if (err instanceof Error) {
        error.value = `哈希计算失败: ${err.message}`
      } else {
        error.value = '哈希计算失败'
      }
      hexDigest.value = ''
      base64Digest.value = ''
      lastInputByteLength.value = 0
    }
  }

  // ── Auto-compute with 300 ms debounce ──────────────────────────────────────
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(input, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      computeHash()
    }, 300)
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  const clearAll = () => {
    input.value = ''
    hexDigest.value = ''
    base64Digest.value = ''
    error.value = ''
    lastInputByteLength.value = 0
  }

  const copyHexDigest = async () => {
    if (!hasValidOutput.value) return
    try {
      await navigator.clipboard.writeText(hexDigest.value)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const copyBase64Digest = async () => {
    if (!hasValidOutput.value) return
    try {
      await navigator.clipboard.writeText(base64Digest.value)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const downloadDigest = () => {
    if (!hasValidOutput.value) return
    const content = `SHA-256 Digest\n\nInput (${lastInputByteLength.value} bytes):\n${input.value}\n\nHex:\n${hexDigest.value}\n\nBase64:\n${base64Digest.value}\n`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sha256-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    input,
    hexDigest,
    base64Digest,
    error,
    stats,
    isInputEmpty,
    hasValidOutput,
    computeHash,
    clearAll,
    copyHexDigest,
    copyBase64Digest,
    downloadDigest
  }
}
