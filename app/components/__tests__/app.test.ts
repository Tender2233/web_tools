import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('App', () => {
  it('matches snapshot', async () => {
    const App = await import('../../app.vue')
    const wrapper = mount(App.default, {
      global: {
        stubs: {
          Suspense: { template: '<div class="suspense-stub"><slot /><slot name="fallback" /></div>' }
        }
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
