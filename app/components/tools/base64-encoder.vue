<template>
  <div class="base64-encoder">
    <div class="base64-encoder__toolbar">
      <div class="base64-encoder__toolbar-group">
        <button @click="encode" :disabled="isInputEmpty" class="btn btn-primary">
          编码
        </button>
        <button @click="decode" :disabled="isInputEmpty" class="btn btn-secondary">
          解码
        </button>
        <button @click="clearAll" :disabled="isInputEmpty" class="btn btn-ghost">
          清空
        </button>
      </div>
    </div>

    <div v-if="error" class="base64-encoder__error">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div class="base64-encoder__panes">
      <div class="base64-encoder__pane">
        <div class="base64-encoder__pane-header">
          <span>输入</span>
        </div>
        <textarea
          v-model="input"
          class="base64-encoder__textarea"
          placeholder="粘贴或输入文本..."
          spellcheck="false"
        />
      </div>

      <div class="base64-encoder__pane">
        <div class="base64-encoder__pane-header">
          <span>输出</span>
          <div class="base64-encoder__stats" v-if="hasValidOutput">
            <span>输入 {{ stats.inputSize }} 字节</span>
            <span>输出 {{ stats.outputSize }} 字节</span>
            <span>{{ stats.ratio }}%</span>
          </div>
        </div>
        <textarea
          v-model="output"
          class="base64-encoder__textarea"
          placeholder="结果..."
          spellcheck="false"
          readonly
        />
      </div>
    </div>

    <div class="base64-encoder__actions">
      <button @click="copyOutput" :disabled="!hasValidOutput" class="btn btn-secondary">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
        </svg>
        复制输出
      </button>
      <button @click="downloadOutput" :disabled="!hasValidOutput" class="btn btn-secondary">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        下载文件
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  input,
  output,
  error,
  stats,
  isInputEmpty,
  hasValidOutput,
  encode,
  decode,
  clearAll,
  copyOutput,
  downloadOutput
} = useBase64()
</script>

<style scoped>
.base64-encoder {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  animation: fadeIn 0.4s ease-out;
}

.base64-encoder__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.base64-encoder__toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.base64-encoder__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--win95-error-bg);
  border: 2px solid var(--win95-error-border);
  border-radius: 0;
  color: var(--win95-error-text);
  font-size: 0.9375rem;
  animation: slideDown 0.3s ease-out;
}

.base64-encoder__error svg {
  flex-shrink: 0;
  opacity: 0.9;
}

.base64-encoder__panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  flex: 1;
  min-height: 0;
}

.base64-encoder__pane {
  display: flex;
  flex-direction: column;
  border: none;
  outline: 2px solid;
  outline-color: var(--win95-button-dark-shadow) var(--win95-button-highlight) var(--win95-button-highlight) var(--win95-button-dark-shadow);
  border-radius: 0;
  background: var(--win95-surface);
  box-shadow: inset 1px 1px 0 var(--win95-button-dark-shadow), inset -1px -1px 0 var(--win95-button-highlight);
  overflow: hidden;
  min-height: 0;
}

.base64-encoder__pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid var(--win95-button-dark-shadow);
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--win95-text-disabled);
}

.base64-encoder__stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.base64-encoder__stats span {
  padding: 0.25rem 0.5rem;
  background: var(--win95-button-face);
  outline: 2px solid;
  outline-color: var(--win95-button-highlight) var(--win95-button-dark-shadow) var(--win95-button-dark-shadow) var(--win95-button-highlight);
  border-radius: 0;
  white-space: nowrap;
}

.base64-encoder__textarea {
  flex: 1;
  width: 100%;
  padding: 0.75rem;
  background: var(--win95-surface);
  box-shadow: inset 1px 1px 0 var(--win95-button-dark-shadow), inset -1px -1px 0 var(--win95-button-highlight);
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--win95-text);
  outline: none;
  overflow-y: auto;
}

.base64-encoder__textarea::placeholder {
  color: var(--win95-text-disabled);
  opacity: 0.5;
}

.base64-encoder__textarea:focus {
  outline: 2px dotted var(--win95-text);
  outline-offset: -2px;
}

.base64-encoder__textarea::-webkit-scrollbar {
  width: 10px;
}

.base64-encoder__textarea::-webkit-scrollbar-track {
  background: transparent;
}

.base64-encoder__textarea::-webkit-scrollbar-thumb {
  background: var(--win95-button-shadow);
  border-radius: 0;
}

.base64-encoder__textarea::-webkit-scrollbar-thumb:hover {
  background: var(--win95-button-dark-shadow);
}

.base64-encoder__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}



@media (max-width: 1024px) {
  .base64-encoder__panes {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .base64-encoder__toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .base64-encoder__toolbar-group {
    justify-content: stretch;
  }
  
  .base64-encoder__toolbar-group button {
    flex: 1;
  }
  
  .base64-encoder__pane-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .base64-encoder__stats {
    justify-content: space-between;
  }
  
  .base64-encoder__actions {
    flex-direction: column;
  }
  
  .base64-encoder__actions button {
    width: 100%;
  }
}
</style>
