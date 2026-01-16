<template>
  <div class="json-tool" :class="{ 'json-tool--full': layout === 'full' }">
    <header class="json-tool__header">
      <div>
        <h2>JSON 格式化 & 编辑</h2>
        <p>粘贴、编辑并在右侧即时查看格式化结果。支持多档缩进与错误提示。</p>
      </div>
      <div class="json-tool__controls">
        <label>
          缩进
          <select v-model="indentMode">
            <option value="2">2 空格</option>
            <option value="4">4 空格</option>
            <option value="tab">Tab</option>
          </select>
        </label>
        <button type="button" @click="formatJson" :disabled="isInputEmpty">格式化</button>
        <button type="button" @click="compactJson" :disabled="isInputEmpty">压缩</button>
        <button type="button" class="ghost" @click="resetJson" :disabled="isInputEmpty">清空</button>
      </div>
    </header>

    <div v-if="error" class="banner">
      <strong>JSON 解析失败：</strong> {{ error }}
    </div>

        <div class="panes" :style="paneStyle">
        <label>
          输入 / 编辑
          <textarea v-model="input" spellcheck="false" placeholder="在此粘贴 JSON 或手动输入"></textarea>
        </label>
        <label>
          输出 (只读)
          <textarea :value="output" spellcheck="false" readonly></textarea>
        </label>

    </div>

    <footer class="json-tool__stats">
      <div>
        <span>字符：{{ sizeStats.chars }}</span>
        <span>键值对：{{ sizeStats.keys }}</span>
      </div>
      <div class="json-tool__actions">
        <button type="button" @click="copyOutput" :disabled="!output">复制输出</button>
        <button type="button" @click="downloadOutput" :disabled="!output">下载 .json</button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
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

const paneStyle = computed(() => {
  if (props.layout === 'full') {
    return {
      minHeight: '70vh',
      gridTemplateColumns: 'repeat(auto-fit, minmax(45%, 1fr))'
    }
  }
  return {
    minHeight: '60vh'
  }
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
</script>

<style scoped>
.json-tool {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--fg);
}

.json-tool__header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.json-tool h2 {
  margin: 0 0 0.4rem;
  font-size: 1.8rem;
}

.json-tool p {
  margin: 0;
  color: var(--muted);
}

.json-tool__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: flex-end;
}

.json-tool--full .panes {
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
}

.json-tool__controls label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  color: var(--muted);
}

.json-tool__controls select {
  margin-top: 0.2rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  color: var(--fg);
  padding: 0.4rem 0.6rem;
}

button {
  border: 1px solid var(--border);
  background: var(--surface-strong);
  color: var(--fg);
  border-radius: 10px;
  padding: 0.5rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  border-color: var(--accent);
}

button.ghost {
  background: transparent;
}

.banner {
  border: 1px solid rgba(255, 86, 99, 0.4);
  background: rgba(255, 86, 99, 0.12);
  color: #ff7a88;
  border-radius: 12px;
  padding: 0.8rem 1rem;
}

.panes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2%;
  width: 100%;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--muted);
  height: 100%;
}

textarea {
  border-radius: 16px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.08);
  min-height: 38vh;
  padding: 1.2rem;
  color: var(--fg);
  font-size: 0.95rem;
  line-height: 1.5;
  font-family: 'SFMono-Regular', 'JetBrains Mono', 'Menlo', 'Consolas', monospace;
  resize: vertical;
}

.json-tool--full textarea {
  min-height: 48vh;
}

textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(109, 123, 255, 0.2);
}

.json-tool__stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  font-size: 0.95rem;
  color: var(--muted);
}

.json-tool__stats span + span {
  margin-left: 1rem;
}

.json-tool__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .json-tool__header {
    flex-direction: column;
  }

  textarea {
    min-height: 220px;
  }
}
</style>
