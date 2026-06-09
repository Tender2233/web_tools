<template>
  <div class="sha256-encoder">
    <div class="sha256-encoder__toolbar">
      <div class="sha256-encoder__toolbar-group">
        <button @click="computeHash" :disabled="isInputEmpty" class="btn btn-primary">
          计算哈希
        </button>
        <button @click="clearAll" :disabled="isInputEmpty && !hasValidOutput" class="btn btn-ghost">
          清空
        </button>
      </div>
    </div>

    <div v-if="error" class="sha256-encoder__error">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div class="sha256-encoder__panes">
      <div class="sha256-encoder__pane">
        <div class="sha256-encoder__pane-header">
          <span>输入</span>
        </div>
        <textarea
          v-model="input"
          class="sha256-encoder__textarea"
          placeholder="粘贴或输入文本以生成 SHA-256 摘要..."
          spellcheck="false"
        />
      </div>

      <div class="sha256-encoder__pane">
        <div class="sha256-encoder__pane-header">
          <span>输出</span>
          <div class="sha256-encoder__stats" v-if="hasValidOutput">
            <span>输入 {{ stats.inputBytes }} 字节</span>
            <span>{{ stats.algorithm }}</span>
            <span>{{ stats.hashBits }} 位</span>
          </div>
        </div>
        <div class="sha256-encoder__outputs">
          <div class="sha256-encoder__output-field">
            <div class="sha256-encoder__output-label">十六进制 (Hex)</div>
            <div class="sha256-encoder__output-row">
              <input
                :value="hexDigest"
                class="sha256-encoder__output-input"
                placeholder="hex 摘要..."
                readonly
                spellcheck="false"
              />
              <button
                @click="copyHexDigest"
                :disabled="!hasValidOutput"
                class="btn btn-secondary sha256-encoder__copy-btn"
                title="复制十六进制摘要"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="sha256-encoder__output-field">
            <div class="sha256-encoder__output-label">Base64</div>
            <div class="sha256-encoder__output-row">
              <input
                :value="base64Digest"
                class="sha256-encoder__output-input"
                placeholder="base64 摘要..."
                readonly
                spellcheck="false"
              />
              <button
                @click="copyBase64Digest"
                :disabled="!hasValidOutput"
                class="btn btn-secondary sha256-encoder__copy-btn"
                title="复制 Base64 摘要"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sha256-encoder__actions">
      <button @click="downloadDigest" :disabled="!hasValidOutput" class="btn btn-secondary">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        下载摘要
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
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
} = useSha256()
</script>

<style scoped>
.sha256-encoder {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  animation: fadeIn 0.4s ease-out;
}

.sha256-encoder__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sha256-encoder__toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Error: white bg + red border */
.sha256-encoder__error {
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

.sha256-encoder__error svg {
  flex-shrink: 0;
}

.sha256-encoder__panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  flex: 1;
  min-height: 0;
}

/* Sunken panel: window-style box-shadow */
.sha256-encoder__pane {
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  background: var(--surface);
  box-shadow: var(--border-window-outer), var(--border-window-inner);
  overflow: hidden;
  min-height: 0;
}

.sha256-encoder__pane-header {
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

/* Stats: raised box-shadow */
.sha256-encoder__stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 11px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.sha256-encoder__stats span {
  padding: 0.125rem 0.375rem;
  background: var(--surface);
  box-shadow: var(--border-raised-outer), var(--border-raised-inner);
  border-radius: 0;
  white-space: nowrap;
}

/* Textarea for input */
.sha256-encoder__textarea {
  flex: 1;
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

.sha256-encoder__textarea::placeholder {
  color: var(--border-dark);
}

.sha256-encoder__textarea:focus {
  outline: 1px dotted var(--focus);
  outline-offset: -2px;
}

/* Outputs area inside the right pane */
.sha256-encoder__outputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  min-height: 0;
  overflow-y: auto;
}

.sha256-encoder__output-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sha256-encoder__output-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--border-darkest);
  padding: 0 0.25rem;
}

.sha256-encoder__output-row {
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
}

.sha256-encoder__output-input {
  flex: 1;
  padding: 3px 4px;
  background: var(--border-lightest);
  box-shadow: var(--border-field);
  border: none;
  border-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--canvas-text);
  outline: none;
  min-width: 0;
}

.sha256-encoder__output-input::placeholder {
  color: var(--border-dark);
}

.sha256-encoder__output-input:focus {
  outline: 1px dotted var(--focus);
  outline-offset: -2px;
}

.sha256-encoder__copy-btn {
  min-width: auto !important;
  padding: 0 6px !important;
  flex-shrink: 0;
}

/* Actions */
.sha256-encoder__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Scrollbar styling */
.sha256-encoder__textarea::-webkit-scrollbar,
.sha256-encoder__outputs::-webkit-scrollbar {
  width: 10px;
}

.sha256-encoder__textarea::-webkit-scrollbar-track,
.sha256-encoder__outputs::-webkit-scrollbar-track {
  background: var(--surface);
}

.sha256-encoder__textarea::-webkit-scrollbar-thumb,
.sha256-encoder__outputs::-webkit-scrollbar-thumb {
  background: var(--border-dark);
  border-radius: 0;
}

.sha256-encoder__textarea::-webkit-scrollbar-thumb:hover,
.sha256-encoder__outputs::-webkit-scrollbar-thumb:hover {
  background: var(--border-darkest);
}

/* Responsive */
@media (max-width: 1024px) {
  .sha256-encoder__panes {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .sha256-encoder__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .sha256-encoder__toolbar-group {
    justify-content: stretch;
  }
}
</style>
