---
name: button-styling
description: Ensure button styles are included in scoped components for consistent UI appearance
---

# Button Styling Pattern for Web Tools

## Problem

When using `<style scoped>` in Vue components, button styles (`.btn-primary`, `.btn-secondary`, `.btn-ghost`, etc.) must be duplicated in each component that uses them. Forgetting to include these styles results in unstyled buttons.

## Root Cause

- Scoped styles are isolated per component to prevent style leakage
- Button classes are NOT global styles in this project
- Each tool component is self-contained and must define its own button styles

## Solution Pattern

### Required Button Styles Template

Copy this complete button style block into EVERY tool component's `<style scoped>` section:

```css
/* Button Styles */
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
```

### Optional: Mini Button Variant

If your component needs smaller inline buttons (like tree nodes), add:

```css
.btn-mini {
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  border-radius: 6px;
}

.btn-mini::before {
  display: none;
}

.btn-mini:hover:not(:disabled) {
  transform: none;
  box-shadow: none;
}
```

## When to Apply

Apply this pattern when creating:

1. **New tool components** in `app/components/tools/`
2. **Components with action buttons** (encode, decode, format, copy, download, clear, etc.)
3. **Any component using button classes** like `btn-primary`, `btn-secondary`, or `btn-ghost`

## Verification Checklist

- [ ] Button styles block is present in `<style scoped>`
- [ ] All button variants used in template are defined (primary/secondary/ghost)
- [ ] Base button styles include `::before` pseudo-element
- [ ] Hover, active, and disabled states are defined
- [ ] CSS variables are used (`var(--border)`, `var(--accent)`, etc.)
- [ ] Test buttons render correctly in both light and dark themes

## Reference Implementation

See `app/components/tools/json-formatter.vue` or `app/components/tools/base64-encoder.vue` for complete working examples.

## Why Not Global Styles?

The project intentionally uses scoped styles to:

- **Component isolation**: Each tool is self-contained
- **Prevent style leakage**: Changes in one component don't affect others
- **Explicit dependencies**: Clear what styles each component needs
- **Easy maintenance**: Component-specific overrides stay local

This trade-off means duplicating button styles, but ensures predictable styling behavior.
