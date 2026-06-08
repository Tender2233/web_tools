<template>
  <div class="placeholder">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <span>即将上线 · 敬请期待</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<style scoped>
.placeholder {
  min-height: 360px;
  box-shadow: var(--border-window-outer), var(--border-window-inner);
  background: var(--surface);
  border: 1px dashed var(--border-dark);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.8rem;
  color: var(--border-dark);
}

.placeholder h2 {
  margin: 0;
  color: var(--canvas-text);
}

.placeholder span {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--border-dark);
}
</style>
