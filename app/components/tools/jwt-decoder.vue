<template>
  <div class="jwt-decoder">
    <div class="jwt-decoder__toolbar">
      <div class="jwt-decoder__toolbar-group">
        <button @click="parseToken" :disabled="isInputEmpty" class="btn btn-primary">
          解析
        </button>
        <button @click="clearAll" :disabled="isInputEmpty && !hasValidJwt" class="btn btn-ghost">
          清空
        </button>
        <button
          v-if="hasValidJwt"
          @click="applyPayloadEdit"
          :disabled="!hasValidJwt"
          class="btn btn-secondary"
        >
          应用编辑
        </button>
      </div>
      <div class="jwt-decoder__stats" v-if="hasValidJwt">
        <span class="jwt-decoder__stat-chip">{{ stats.algorithm }}</span>
        <span v-if="stats.isExpired === true" class="jwt-decoder__stat-chip jwt-decoder__stat-chip--expired">
          已过期
        </span>
        <span v-else-if="stats.isExpired === false" class="jwt-decoder__stat-chip jwt-decoder__stat-chip--valid">
          有效
        </span>
      </div>
    </div>

    <div v-if="error" class="jwt-decoder__error">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div class="jwt-decoder__input-pane">
      <div class="jwt-decoder__pane-header">
        <span>JWT Token</span>
        <button
          v-if="hasValidJwt"
          @click="copyToken"
          class="btn btn-secondary jwt-decoder__mini-btn"
          title="复制完整 JWT"
        >
          复制
        </button>
      </div>
      <textarea
        v-model="token"
        class="jwt-decoder__textarea"
        placeholder="粘贴 JWT Token (header.payload.signature)..."
        spellcheck="false"
      />
    </div>

    <div v-if="hasValidJwt" class="jwt-decoder__parts">
      <!-- Header -->
      <div class="jwt-decoder__part">
        <div class="jwt-decoder__part-header">
          <span>Header</span>
          <button @click="copyHeader" class="btn btn-secondary jwt-decoder__mini-btn" title="复制 Header">
            复制
          </button>
        </div>
        <textarea
          :value="headerRaw"
          class="jwt-decoder__textarea jwt-decoder__textarea--readonly"
          readonly
          spellcheck="false"
        />
      </div>

      <!-- Payload (editable) -->
      <div class="jwt-decoder__part jwt-decoder__part--payload">
        <div class="jwt-decoder__part-header">
          <span>Payload</span>
          <div class="jwt-decoder__part-header-actions">
            <span class="jwt-decoder__hint">可编辑</span>
            <button @click="copyPayload" class="btn btn-secondary jwt-decoder__mini-btn" title="复制 Payload">
              复制
            </button>
          </div>
        </div>
        <textarea
          v-model="payloadEdit"
          class="jwt-decoder__textarea jwt-decoder__textarea--editable"
          spellcheck="false"
        />
      </div>

      <!-- Signature -->
      <div class="jwt-decoder__part">
        <div class="jwt-decoder__part-header">
          <span>Signature</span>
        </div>
        <div class="jwt-decoder__signature-box">
          <code>{{ signature }}</code>
          <span class="jwt-decoder__signature-note">签名无法验证（需要密钥）</span>
        </div>
      </div>
    </div>

    <!-- Time claims -->
    <div v-if="hasValidJwt && hasTimeClaims" class="jwt-decoder__time-claims">
      <div v-if="stats.issuedAt" class="jwt-decoder__time-claim">
        <span class="jwt-decoder__time-label">签发时间 (iat)</span>
        <span class="jwt-decoder__time-value">{{ stats.issuedAt }}</span>
      </div>
      <div v-if="stats.expiresAt" class="jwt-decoder__time-claim">
        <span class="jwt-decoder__time-label">过期时间 (exp)</span>
        <span class="jwt-decoder__time-value">{{ stats.expiresAt }}</span>
      </div>
      <div v-if="stats.notBefore" class="jwt-decoder__time-claim">
        <span class="jwt-decoder__time-label">生效时间 (nbf)</span>
        <span class="jwt-decoder__time-value">{{ stats.notBefore }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const {
  token,
  headerRaw,
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
} = useJwt()

const hasTimeClaims = computed(() => !!stats.value.issuedAt || !!stats.value.expiresAt || !!stats.value.notBefore)
</script>

<style scoped>
.jwt-decoder {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  animation: fadeIn 0.4s ease-out;
}

.jwt-decoder__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.jwt-decoder__toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Error */
.jwt-decoder__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--error-bg);
  border: 2px solid var(--error-text);
  border-radius: 0;
  color: var(--error-text);
  font-size: 11px;
  animation: slideDown 0.3s ease-out;
}

.jwt-decoder__error svg {
  flex-shrink: 0;
}

/* Input pane */
.jwt-decoder__input-pane {
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  background: var(--surface);
  box-shadow: var(--border-window-outer), var(--border-window-inner);
  overflow: hidden;
  min-height: 0;
  flex-shrink: 0;
}

.jwt-decoder__pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--canvas-text);
}

/* Textarea */
.jwt-decoder__textarea {
  width: 100%;
  padding: 3px 4px;
  background: var(--border-lightest);
  box-shadow: var(--border-field);
  border: none;
  border-radius: 0;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--canvas-text);
  outline: none;
  overflow-y: auto;
}

.jwt-decoder__input-pane .jwt-decoder__textarea {
  height: 64px;
}

.jwt-decoder__textarea::placeholder {
  color: var(--border-dark);
}

.jwt-decoder__textarea:focus {
  outline: 1px dotted var(--focus);
  outline-offset: -2px;
}

.jwt-decoder__textarea--readonly {
  cursor: default;
}

.jwt-decoder__textarea--editable {
  background: var(--canvas);
  box-shadow: var(--border-field);
}

/* Decoded parts: 3-column grid */
.jwt-decoder__parts {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 0.5rem;
  flex: 1;
  min-height: 0;
}

.jwt-decoder__part {
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  background: var(--surface);
  box-shadow: var(--border-window-outer), var(--border-window-inner);
  overflow: hidden;
  min-height: 0;
}

.jwt-decoder__part-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--canvas-text);
}

.jwt-decoder__part-header-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.jwt-decoder__hint {
  font-size: 9px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--border-dark);
  font-style: italic;
}

.jwt-decoder__part .jwt-decoder__textarea {
  flex: 1;
  min-height: 0;
}

/* Mini copy button */
.jwt-decoder__mini-btn {
  min-width: auto !important;
  min-height: auto !important;
  padding: 1px 8px !important;
  font-size: 10px !important;
}

/* Signature box */
.jwt-decoder__signature-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  text-align: center;
}

.jwt-decoder__signature-box code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 10px;
  word-break: break-all;
  line-height: 1.5;
  color: var(--canvas-text);
  background: var(--border-lightest);
  padding: 0.25rem 0.5rem;
  box-shadow: var(--border-field);
  max-width: 100%;
  overflow-wrap: break-word;
}

.jwt-decoder__signature-note {
  font-size: 9px;
  color: var(--border-dark);
  font-style: italic;
}

/* Stats chips */
.jwt-decoder__stats {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.jwt-decoder__stat-chip {
  padding: 0.125rem 0.375rem;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--surface);
  box-shadow: var(--border-raised-outer), var(--border-raised-inner);
  color: var(--canvas-text);
}

.jwt-decoder__stat-chip--expired {
  background: var(--error-text);
  color: var(--canvas);
  text-shadow: none;
}

.jwt-decoder__stat-chip--valid {
  background: #008000;
  color: #ffffff;
}

/* Time claims */
.jwt-decoder__time-claims {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.25rem 0;
}

.jwt-decoder__time-claim {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 10px;
}

.jwt-decoder__time-label {
  color: var(--border-dark);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.jwt-decoder__time-value {
  color: var(--canvas-text);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 10px;
}

/* Scrollbar */
.jwt-decoder__textarea::-webkit-scrollbar {
  width: 10px;
}

.jwt-decoder__textarea::-webkit-scrollbar-track {
  background: var(--surface);
}

.jwt-decoder__textarea::-webkit-scrollbar-thumb {
  background: var(--border-dark);
  border-radius: 0;
}

.jwt-decoder__textarea::-webkit-scrollbar-thumb:hover {
  background: var(--border-darkest);
}

/* Responsive */
@media (max-width: 1024px) {
  .jwt-decoder__parts {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
}

@media (max-width: 720px) {
  .jwt-decoder__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .jwt-decoder__toolbar-group {
    justify-content: stretch;
  }

  .jwt-decoder__toolbar-group button {
    flex: 1;
  }
}
</style>
