<template>
  <div class="ts-converter">

    <!-- ── Timezone bar ───────────────────────────────────────────────── -->
    <div class="ts-converter__tz-bar">
      <div class="ts-converter__tz-label">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
        Timezone
      </div>
      <div class="ts-converter__tz-selector">
        <div class="ts-converter__tz-input-wrap">
          <svg class="ts-converter__tz-search-icon" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
          </svg>
          <input
            ref="tzInputRef"
            v-model="tzSearch"
            class="ts-converter__tz-search"
            :placeholder="selectedTimezone"
            @focus="openTzDropdown"
            @blur="onTzBlur"
          />
        </div>
        <Teleport to="body">
          <div
            v-if="tzOpen"
            class="ts-converter__tz-dropdown"
            :style="dropdownStyle"
          >
            <div
              v-for="tz in filteredTimezones"
              :key="tz"
              class="ts-converter__tz-option"
              :class="{ 'is-active': tz === selectedTimezone }"
              @mousedown.prevent="selectTimezone(tz)"
            >
              {{ tz }}
            </div>
            <div v-if="filteredTimezones.length === 0" class="ts-converter__tz-empty">
              No timezones match "{{ tzSearch }}"
            </div>
          </div>
        </Teleport>
      </div>
    </div>

    <!-- ── Live "now" banner ──────────────────────────────────────────── -->
    <div class="ts-converter__now-bar">
      <span class="ts-converter__now-label">Current time</span>
      <span class="ts-converter__now-ts">{{ nowTimestamp }}</span>
      <span class="ts-converter__now-sep">·</span>
      <span class="ts-converter__now-dt">{{ nowDatetime }}</span>
      <button class="btn-primary ts-converter__use-now" @click="useNow">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
        </svg>
        Use Now
      </button>
    </div>

    <!-- ── Error banner ───────────────────────────────────────────────── -->
    <div v-if="error" class="ts-converter__error">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
      </svg>
      {{ error }}
    </div>

    <!-- ── Main conversion panels ─────────────────────────────────────── -->
    <div class="ts-converter__panels">

      <!-- Timestamp panel -->
      <div class="ts-converter__panel">
        <div class="ts-converter__panel-header">
          <span class="ts-converter__panel-title">Unix Timestamp</span>
          <!-- sec / ms toggle -->
          <div class="ts-converter__unit-toggle">
            <button
              :class="['ts-converter__unit-btn', unit === 's' && 'is-active']"
              @click="unit = 's'"
            >s</button>
            <button
              :class="['ts-converter__unit-btn', unit === 'ms' && 'is-active']"
              @click="unit = 'ms'"
            >ms</button>
          </div>
        </div>
        <div class="ts-converter__input-wrap">
          <input
            v-model="timestampInput"
            class="ts-converter__input ts-converter__input--mono"
            :placeholder="unit === 's' ? '1700000000' : '1700000000000'"
            inputmode="numeric"
            spellcheck="false"
          />
          <button
            class="ts-converter__copy-btn btn-ghost"
            :disabled="!timestampInput"
            @click="copyTimestamp"
            :title="copiedField === 'ts' ? 'Copied!' : 'Copy timestamp'"
          >
            <svg v-if="copiedField !== 'ts'" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Arrow divider -->
      <div class="ts-converter__arrow">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
        </svg>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" style="transform: rotate(180deg)">
          <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
        </svg>
      </div>

      <!-- Datetime panel -->
      <div class="ts-converter__panel">
        <div class="ts-converter__panel-header">
          <span class="ts-converter__panel-title">Date / Time</span>
          <span class="ts-converter__panel-hint">yyyy-MM-dd HH:mm:ss</span>
        </div>
        <div class="ts-converter__input-wrap">
          <input
            v-model="datetimeInput"
            class="ts-converter__input ts-converter__input--mono"
            placeholder="2024-01-15 09:30:00"
            spellcheck="false"
          />
          <button
            class="ts-converter__copy-btn btn-ghost"
            :disabled="!datetimeInput"
            @click="copyDatetime"
            :title="copiedField === 'dt' ? 'Copied!' : 'Copy datetime'"
          >
            <svg v-if="copiedField !== 'dt'" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>
        </div>
      </div>

    </div>

    <!-- ── Stats row ──────────────────────────────────────────────────── -->
    <div v-if="stats" class="ts-converter__stats">
      <div class="ts-converter__stat">
        <span class="ts-converter__stat-label">UTC Offset</span>
        <span class="ts-converter__stat-value">{{ stats.utcOffset }}</span>
      </div>
      <div class="ts-converter__stat">
        <span class="ts-converter__stat-label">Weekday</span>
        <span class="ts-converter__stat-value">{{ stats.weekday }}</span>
      </div>
      <div class="ts-converter__stat">
        <span class="ts-converter__stat-label">UTC</span>
        <span class="ts-converter__stat-value ts-converter__stat-value--mono">{{ stats.utcDatetime }}</span>
      </div>
      <div class="ts-converter__stat">
        <span class="ts-converter__stat-label">ISO 8601</span>
        <span class="ts-converter__stat-value ts-converter__stat-value--mono ts-converter__stat-value--iso">{{ stats.iso8601 }}</span>
      </div>
      <div class="ts-converter__stat">
        <span class="ts-converter__stat-label">Relative</span>
        <span class="ts-converter__stat-value">{{ stats.relative }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────────────── -->
    <div class="ts-converter__actions">
      <button class="btn-ghost" @click="clearAll" :disabled="!timestampInput && !datetimeInput">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
        </svg>
        Clear
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTimestamp } from '~/composables/useTimestamp'

const {
  timestampInput,
  datetimeInput,
  unit,
  selectedTimezone,
  error,
  tzSearch,
  copiedField,
  filteredTimezones,
  stats,
  nowTimestamp,
  nowDatetime,
  useNow,
  clearAll,
  copyTimestamp,
  copyDatetime
} = useTimestamp()

const tzOpen    = ref(false)
const tzInputRef = ref<HTMLInputElement | null>(null)

const dropdownStyle = computed(() => {
  if (!tzInputRef.value) return {}
  const r = tzInputRef.value.getBoundingClientRect()
  return {
    position: 'fixed' as const,
    top:   `${r.bottom + 6}px`,
    left:  `${r.left}px`,
    width: `${r.width}px`
  }
})

const openTzDropdown = () => {
  tzOpen.value = true
}

const selectTimezone = (tz: string) => {
  selectedTimezone.value = tz
  tzSearch.value = ''
  tzOpen.value = false
}

const onTzBlur = () => {
  setTimeout(() => {
    tzOpen.value = false
    tzSearch.value = ''
  }, 150)
}
</script>

<style scoped>
.ts-converter {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
  animation: fadeIn 0.4s ease-out;
}

/* ── Timezone bar ─────────────────────────────────────────────────────────── */
.ts-converter__tz-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  backdrop-filter: blur(12px);
}

.ts-converter__tz-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.ts-converter__tz-selector {
  position: relative;
  flex: 1;
}

.ts-converter__tz-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ts-converter__tz-search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--muted);
  pointer-events: none;
  flex-shrink: 0;
}

.ts-converter__tz-search {
  width: 100%;
  padding: 0.5rem 0.875rem 0.5rem 2.25rem;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--fg);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.ts-converter__tz-search:focus {
  border-color: var(--accent);
}

.ts-converter__tz-search::placeholder {
  color: var(--muted);
  opacity: 0.7;
}

/* Dropdown is teleported to <body> — must use :global */
:global(.ts-converter__tz-dropdown) {
  max-height: 220px;
  overflow-y: auto;
  background: var(--surface-strong, rgba(255,255,255,0.08));
  border: 1px solid var(--border, rgba(255,255,255,0.1));
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  z-index: 9999;
  backdrop-filter: blur(16px);
}

:global(.ts-converter__tz-dropdown::-webkit-scrollbar) {
  width: 6px;
}

:global(.ts-converter__tz-dropdown::-webkit-scrollbar-track) {
  background: transparent;
}

:global(.ts-converter__tz-dropdown::-webkit-scrollbar-thumb) {
  background: var(--border, rgba(255,255,255,0.1));
  border-radius: 3px;
}

:global(.ts-converter__tz-option) {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: var(--fg, #f5f6fb);
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.ts-converter__tz-option:hover) {
  background: rgba(109, 123, 255, 0.12);
}

:global(.ts-converter__tz-option.is-active) {
  background: rgba(109, 123, 255, 0.2);
  color: var(--accent, #6d7bff);
  font-weight: 600;
}

:global(.ts-converter__tz-empty) {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--muted, rgba(245,246,251,0.55));
  text-align: center;
}

/* ── Now bar ──────────────────────────────────────────────────────────────── */
.ts-converter__now-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.ts-converter__now-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.ts-converter__now-ts,
.ts-converter__now-dt {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: var(--accent);
  white-space: nowrap;
}

.ts-converter__now-sep {
  color: var(--muted);
}

.ts-converter__use-now {
  margin-left: auto;
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
}

/* ── Error banner ─────────────────────────────────────────────────────────── */
.ts-converter__error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 59, 92, 0.15), rgba(255, 23, 68, 0.1));
  border: 1px solid rgba(255, 59, 92, 0.3);
  border-radius: 8px;
  color: #ff9eb3;
  font-size: 0.9375rem;
  animation: slideDown 0.3s ease-out;
}

/* ── Main panels ──────────────────────────────────────────────────────────── */
.ts-converter__panels {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
}

.ts-converter__panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: border-color 0.2s ease;
}

.ts-converter__panel:focus-within {
  border-color: var(--accent);
}

.ts-converter__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.ts-converter__panel-title {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.ts-converter__panel-hint {
  font-size: 0.75rem;
  color: var(--muted);
  opacity: 0.6;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* sec / ms toggle */
.ts-converter__unit-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.ts-converter__unit-btn {
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.ts-converter__unit-btn:hover:not(.is-active) {
  background: var(--surface-strong);
  color: var(--fg);
  transform: none;
  box-shadow: none;
  border-color: transparent;
}

.ts-converter__unit-btn::before {
  display: none;
}

.ts-converter__unit-btn.is-active {
  background: var(--accent);
  color: white;
}

/* Input + copy button */
.ts-converter__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ts-converter__input {
  width: 100%;
  padding: 1.125rem 3rem 1.125rem 1.25rem;
  background: transparent;
  border: none;
  color: var(--fg);
  font-size: 1.125rem;
  outline: none;
}

.ts-converter__input--mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.ts-converter__input::placeholder {
  color: var(--muted);
  opacity: 0.45;
}

.ts-converter__copy-btn {
  position: absolute;
  right: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
}

/* Arrow divider */
.ts-converter__arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: var(--muted);
  opacity: 0.5;
}

/* ── Stats row ────────────────────────────────────────────────────────────── */
.ts-converter__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  animation: fadeIn 0.3s ease-out;
}

.ts-converter__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  flex: 1;
  min-width: 120px;
}

.ts-converter__stat-label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.ts-converter__stat-value {
  font-size: 0.9375rem;
  color: var(--fg);
  font-weight: 500;
}

.ts-converter__stat-value--mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8125rem;
}

.ts-converter__stat-value--iso {
  font-size: 0.75rem;
  word-break: break-all;
}

/* ── Actions ──────────────────────────────────────────────────────────────── */
.ts-converter__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* ── Button Styles ────────────────────────────────────────────────────────── */
button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-strong);
  color: var(--fg);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(109, 123, 255, 0.1) 0%, rgba(74, 92, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

button:hover:not(:disabled)::before {
  opacity: 1;
}

button:hover:not(:disabled) {
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(109, 123, 255, 0.15);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button.btn-primary {
  background: linear-gradient(135deg, #6d7bff 0%, #5a67e8 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(109, 123, 255, 0.25);
}

button.btn-primary::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
}

button.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(109, 123, 255, 0.35);
  transform: translateY(-2px);
}

button.btn-secondary {
  background: var(--surface-strong);
  backdrop-filter: blur(8px);
}

button.btn-ghost {
  background: transparent;
  border-color: transparent;
}

button.btn-ghost:hover:not(:disabled) {
  background: var(--surface);
  border-color: var(--border);
}

button svg {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .ts-converter__panels {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .ts-converter__arrow {
    flex-direction: row;
    transform: rotate(90deg);
    justify-content: center;
    opacity: 0.35;
  }
}

@media (max-width: 600px) {
  .ts-converter__tz-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .ts-converter__now-bar {
    gap: 0.5rem;
  }

  .ts-converter__use-now {
    margin-left: 0;
    width: 100%;
  }

  .ts-converter__stats {
    gap: 0.5rem;
  }

  .ts-converter__stat {
    min-width: calc(50% - 0.25rem);
    flex: none;
  }
}
</style>
