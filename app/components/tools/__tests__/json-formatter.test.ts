import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

// json-formatter uses useJsonFormatter composable (auto-imported by Nuxt)
// and imports JsonTreeView child component
// Mount with stub for Nuxt auto-imports

describe('JsonFormatter', () => {
  it('matches snapshot', async () => {
    const JsonFormatter = await import('../json-formatter.vue')
    const wrapper = mount(JsonFormatter.default, {
      global: {
        stubs: {
          JsonTreeView: { template: '<div class="json-tree-stub"><slot /></div>' }
        }
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
