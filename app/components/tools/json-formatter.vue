<template>
  <div class="json-formatter">
    <div class="json-formatter__toolbar">
      <div class="json-formatter__toolbar-group">
        <label class="json-formatter__indent-control">
          <span>缩进</span>
          <select v-model.number="indentSize">
            <option :value="2">2 空格</option>
            <option :value="4">4 空格</option>
          </select>
        </label>
      </div>
      <div class="json-formatter__toolbar-group">
        <button @click="formatJson" :disabled="isInputEmpty" class="btn-primary">
          格式化
        </button>
        <button @click="minifyJson" :disabled="isInputEmpty" class="btn-secondary">
          压缩
        </button>
        <button @click="clearAll" :disabled="isInputEmpty" class="btn-ghost">
          清空
        </button>
      </div>
    </div>

    <div v-if="error" class="json-formatter__error">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div class="json-formatter__panes">
      <div class="json-formatter__pane">
        <div class="json-formatter__pane-header">
          <span>输入</span>
        </div>
        <textarea
          v-model="input"
          class="json-formatter__textarea"
          placeholder="粘贴或输入 JSON..."
          spellcheck="false"
        />
      </div>

      <div class="json-formatter__pane">
        <div class="json-formatter__pane-header">
          <span>输出</span>
          <div class="json-formatter__view-toggle">
            <button
              type="button"
              :class="{ active: viewMode === 'tree' }"
              @click="viewMode = 'tree'"
              title="树形视图"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
              </svg>
            </button>
            <button
              type="button"
              :class="{ active: viewMode === 'text' }"
              @click="viewMode = 'text'"
              title="文本视图"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 6.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1zM4 4.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1 0-1zm0 4h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1 0-1z"/>
              </svg>
            </button>
          </div>
          <div class="json-formatter__stats" v-if="hasValidOutput">
            <span>{{ stats.lines }} 行</span>
            <span>{{ stats.chars }} 字符</span>
            <span>{{ stats.bytes }} 字节</span>
            <span v-if="stats.keys > 0">{{ stats.keys }} 键</span>
            <span v-if="stats.depth > 0">深度 {{ stats.depth }}</span>
          </div>
        </div>
        
        <div class="json-formatter__output-container">
          <textarea
            v-if="viewMode === 'text'"
            v-model="output"
            class="json-formatter__textarea"
            placeholder="格式化结果..."
            spellcheck="false"
            readonly
          />
          <div v-else-if="viewMode === 'tree' && parsedValue" class="json-formatter__tree-container">
            <div class="json-formatter__tree-actions">
              <button type="button" @click="expandAllNodes" class="btn-mini">展开全部</button>
              <button type="button" @click="collapseAllNodes" class="btn-mini">收起全部</button>
            </div>
            <JsonTreeView ref="treeViewRef" :data="parsedValue" />
          </div>
          <div v-else class="json-formatter__empty">
            {{ error ? '解析失败，无法显示' : '暂无数据' }}
          </div>
        </div>
      </div>
    </div>

    <div class="json-formatter__actions">
      <button @click="copyOutput" :disabled="!hasValidOutput" class="btn-secondary">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
        </svg>
        复制输出
      </button>
      <button @click="downloadJson" :disabled="!hasValidOutput" class="btn-secondary">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        下载 JSON
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import JsonTreeView from './json-tree-view.vue'

const {
  input,
  output,
  error,
  indentSize,
  stats,
  isInputEmpty,
  hasValidOutput,
  parsedValue,
  formatJson,
  minifyJson,
  clearAll,
  copyOutput,
  downloadJson
} = useJsonFormatter()

const viewMode = ref<'tree' | 'text'>('tree')
const treeViewRef = ref<InstanceType<typeof JsonTreeView> | null>(null)

const expandAllNodes = () => {
  if (treeViewRef.value && typeof treeViewRef.value.expandAll === 'function') {
    treeViewRef.value.expandAll()
  }
}

const collapseAllNodes = () => {
  if (treeViewRef.value && typeof treeViewRef.value.collapseAll === 'function') {
    treeViewRef.value.collapseAll()
  }
}
</script>

<style scoped src="./json-formatter.style.css"></style>
