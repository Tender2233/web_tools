# JSON Formatter Tool

## 功能特性

### 核心功能
- ✅ **双栏布局**：左侧输入、右侧输出，实时预览
- ✅ **自动格式化**：输入时自动触发（300ms 防抖）
- ✅ **手动控制**：格式化、压缩、清空按钮
- ✅ **缩进配置**：支持 2 空格或 4 空格
- ✅ **错误提示**：清晰的 JSON 解析错误提示
- ✅ **统计信息**：显示行数、字符数、字节数、键数量、嵌套深度

### 操作功能
- 📋 **复制输出**：一键复制格式化结果
- 💾 **下载 JSON**：导出为 `.json` 文件（带时间戳）
- 🧹 **清空**：快速清除输入和输出

## 实现细节

### 架构
- **Composable**: `useJsonFormatter.ts` - 核心业务逻辑
- **组件**: `json-formatter.vue` - UI 组件
- **样式**: `json-formatter.style.css` - BEM 命名规范

### 技术亮点
1. **纯原生实现**：无需外部库，使用原生 `JSON.parse/stringify`
2. **自动格式化**：输入 300ms 防抖后自动格式化
3. **智能统计**：递归计算嵌套深度和键数量
4. **类型安全**：完整 TypeScript 类型支持
5. **响应式设计**：小于 1024px 自动切换为单栏布局

### 性能优化
- 防抖处理避免频繁计算
- 使用 `TextEncoder` 精确计算字节数
- 只读输出框提升性能

## 使用方式

```vue
<template>
  <JsonFormatter />
</template>

<script setup lang="ts">
// Nuxt 自动导入
</script>
```

## API

### useJsonFormatter()

返回对象：
```typescript
{
  input: Ref<string>           // 输入内容
  output: Ref<string>          // 输出内容
  error: Ref<string>           // 错误信息
  indentSize: Ref<2 | 4>       // 缩进大小
  stats: ComputedRef<JsonStats> // 统计信息
  isInputEmpty: ComputedRef<boolean>
  hasValidOutput: ComputedRef<boolean>
  formatJson: () => void       // 格式化
  minifyJson: () => void       // 压缩
  clearAll: () => void         // 清空
  copyOutput: () => Promise<void>  // 复制
  downloadJson: () => void     // 下载
}
```

### JsonStats
```typescript
interface JsonStats {
  chars: number   // 字符数
  bytes: number   // 字节数
  lines: number   // 行数
  keys: number    // 键总数
  depth: number   // 嵌套深度
}
```
