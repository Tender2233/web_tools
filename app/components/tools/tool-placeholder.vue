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
  border: 1px dashed var(--border);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.8rem;
  color: var(--muted);
}

.placeholder h2 {
  margin: 0;
  color: var(--fg);
}

.placeholder span {
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
