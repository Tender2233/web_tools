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

    <div class="panes" :style="{ gridTemplateColumns: paneColumns }">
      <label>
        输入 / 编辑
        <textarea v-model="input" spellcheck="false" placeholder="在此粘贴 JSON 或手动输入"></textarea>
      </label>
      <label>
        输出 / 编辑
        <textarea v-model="output" spellcheck="false"></textarea>
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
const props = defineProps<{
  layout?: 'full' | 'default'
}>()

const {
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
} = useJsonFormatter()

const layout = computed(() => props.layout ?? 'default')
</script>

<style scoped src="./json-formatter.style.css"></style>
