<template>
  <div class="page" :data-theme="theme">
    <div class="shell">
      <header class="topbar" aria-label="工具切换与主题设置">
        <div class="brand-chip">Web Tools · Preview</div>
        <button class="toggle" type="button" @click="toggleTheme" aria-label="切换主题">
          <span class="toggle__icon" aria-hidden="true">
            <span v-if="theme === 'dark'">☀️</span>
            <span v-else>🌙</span>
          </span>
        </button>
      </header>

      <section class="workspace">
        <div class="tabs" role="tablist">
          <button
            v-for="tool in tools"
            :key="tool.id"
            class="tab"
            type="button"
            role="tab"
            :aria-selected="activeTool === tool.id"
            @click="selectTool(tool.id)"
            :title="tool.description"
          >
            <span class="tab__label">{{ tool.label }}</span>
            <small class="tab__badge">{{ tool.badge }}</small>
          </button>
        </div>
        <div class="surface">
          <div class="surface__content">
            <Suspense>
              <component :is="activeComponent" v-bind="activeToolProps" />
              <template #fallback>
                <div class="loading">正在唤醒工具...</div>
              </template>
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { activeComponent, activeTool, activeToolProps, selectTool, theme, tools, toggleTheme } = useAppShell()
</script>

<style scoped src="./app.style.css"></style>

