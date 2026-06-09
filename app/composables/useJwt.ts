import { computed, ref, watch } from 'vue'

// ── Types ──────────────────────────────────────────────────────────────────

export interface JwtHeader {
  alg: string
  typ?: string
  kid?: string
  [key: string]: unknown
}

export interface JwtPayload {
  [key: string]: unknown
}

export interface JwtParts {
  header: JwtHeader
  payload: JwtPayload
  signature: string
}

export interface JwtStats {
  algorithm: string
  isExpired: boolean | null
  issuedAt: string | null
  expiresAt: string | null
  notBefore: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Decode a base64url string to a UTF-8 string.
 */
function base64UrlDecode(str: string): string {
  // Restore standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  switch (base64.length % 4) {
    case 2: base64 += '=='; break
    case 3: base64 += '='; break
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

/**
 * Encode a string to base64url.
 */
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Format a Unix timestamp (seconds) to a localised date string.
 * Returns null if ts is not a finite positive number.
 */
function formatTimestamp(ts: unknown): string | null {
  if (typeof ts !== 'number' || !Number.isFinite(ts) || ts <= 0) return null
  try {
    return new Date(ts * 1000).toLocaleString()
  } catch {
    return null
  }
}

// ── Composable ─────────────────────────────────────────────────────────────

export const useJwt = () => {
  const token = ref('')
  const header = ref<JwtHeader | null>(null)
  const headerRaw = ref('')
  const payload = ref<JwtPayload | null>(null)
  const payloadRaw = ref('')
  // Editable payload JSON text
  const payloadEdit = ref('')
  const signature = ref('')
  const error = ref('')

  const isInputEmpty = computed(() => token.value.trim().length === 0)
  const hasValidJwt = computed(() => header.value !== null && payload.value !== null && !error.value)

  const stats = computed<JwtStats>(() => {
    const alg = header.value?.alg ?? '?'
    const issuedAt = formatTimestamp(payload.value?.iat)
    const expiresAt = formatTimestamp(payload.value?.exp)
    const notBefore = formatTimestamp(payload.value?.nbf)

    let isExpired: boolean | null = null
    if (typeof payload.value?.exp === 'number' && Number.isFinite(payload.value.exp)) {
      isExpired = Date.now() > (payload.value.exp as number) * 1000
    }

    return { algorithm: alg, isExpired, issuedAt, expiresAt, notBefore }
  })

  // ── Parse JWT ────────────────────────────────────────────────────────────

  const parseToken = () => {
    if (isInputEmpty.value) {
      resetState()
      return
    }

    try {
      error.value = ''

      const parts = token.value.trim().split('.')
      if (parts.length !== 3) {
        throw new Error('JWT 必须包含三段: header.payload.signature')
      }

      const [headerB64, payloadB64, sigB64] = parts

      // Decode header
      const headerDecoded = base64UrlDecode(headerB64)
      let headerParsed: JwtHeader
      try {
        headerParsed = JSON.parse(headerDecoded)
      } catch {
        throw new Error('Header 不是有效的 JSON')
      }
      header.value = headerParsed
      headerRaw.value = JSON.stringify(headerParsed, null, 2)

      // Decode payload
      const payloadDecoded = base64UrlDecode(payloadB64)
      let payloadParsed: JwtPayload
      try {
        payloadParsed = JSON.parse(payloadDecoded)
      } catch {
        throw new Error('Payload 不是有效的 JSON')
      }
      payload.value = payloadParsed
      payloadRaw.value = JSON.stringify(payloadParsed, null, 2)
      payloadEdit.value = JSON.stringify(payloadParsed, null, 2)

      // Keep signature raw
      signature.value = sigB64
    } catch (err) {
      if (err instanceof Error) {
        error.value = `解析失败: ${err.message}`
      } else {
        error.value = '解析失败'
      }
      resetState()
    }
  }

  const resetState = () => {
    header.value = null
    headerRaw.value = ''
    payload.value = null
    payloadRaw.value = ''
    payloadEdit.value = ''
    signature.value = ''
  }

  // ── Edit payload & re-encode ─────────────────────────────────────────────

  /**
   * Apply edited payload JSON.
   * Re-encodes header + edited-payload + original-signature into a new JWT.
   */
  const applyPayloadEdit = () => {
    if (!headerRaw.value || !signature.value) return

    try {
      error.value = ''

      // Validate edited payload is valid JSON
      let parsed: unknown
      try {
        parsed = JSON.parse(payloadEdit.value)
      } catch {
        throw new Error('Payload 编辑内容不是有效的 JSON')
      }
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Payload 必须是一个 JSON 对象')
      }

      payload.value = parsed as JwtPayload
      payloadRaw.value = JSON.stringify(parsed, null, 2)
      payloadEdit.value = JSON.stringify(parsed, null, 2)

      // Re-encode the JWT (note: signature is reused as-is – re-signing
      // requires the secret key which we don't have)
      // Minify header JSON for encoding to match standard JWT conventions
      const newHeaderB64 = base64UrlEncode(JSON.stringify(header.value))
      const newPayloadB64 = base64UrlEncode(JSON.stringify(parsed))
      token.value = `${newHeaderB64}.${newPayloadB64}.${signature.value}`
    } catch (err) {
      if (err instanceof Error) {
        error.value = `编辑失败: ${err.message}`
      } else {
        error.value = '编辑失败'
      }
    }
  }

  // ── Auto-parse with debounce ─────────────────────────────────────────────

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  watch(token, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      parseToken()
    }, 400)
  })

  // ── Actions ──────────────────────────────────────────────────────────────

  const clearAll = () => {
    token.value = ''
    error.value = ''
    resetState()
  }

  const copyHeader = async () => {
    if (!headerRaw.value) return
    try { await navigator.clipboard.writeText(headerRaw.value) } catch { /* noop */ }
  }

  const copyPayload = async () => {
    if (!payloadRaw.value) return
    try { await navigator.clipboard.writeText(payloadRaw.value) } catch { /* noop */ }
  }

  const copyToken = async () => {
    if (!hasValidJwt.value) return
    try { await navigator.clipboard.writeText(token.value) } catch { /* noop */ }
  }

  return {
    token,
    header,
    headerRaw,
    payload,
    payloadRaw,
    payloadEdit,
    signature,
    error,
    stats,
    isInputEmpty,
    hasValidJwt,
    parseToken,
    applyPayloadEdit,
    clearAll,
    copyHeader,
    copyPayload,
    copyToken
  }
}
