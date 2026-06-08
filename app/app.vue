<template>
  <div class="page">
    <div class="shell">
      <header class="topbar" aria-label="工具切换与主题设置">
        <div class="brand-chip">Web Tools</div>
        
        <nav class="tool-nav" role="tablist">
          <button
            v-for="tool in tools"
            :key="tool.id"
            class="tool-btn"
            type="button"
            role="tab"
            :aria-selected="activeTool === tool.id"
            @click="selectTool(tool.id)"
            :title="tool.description"
          >
            {{ tool.label }}
          </button>
        </nav>
      </header>

      <section class="workspace">
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

      <footer class="statusbar">
        <span class="statusbar__tool">{{ activeToolMeta?.label ?? 'Web Tools' }}</span>
        <span class="statusbar__status">就绪</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const { activeComponent, activeTool, activeToolMeta, activeToolProps, selectTool, tools } = useAppShell()
</script>

<style src="./app.style.css"></style>

