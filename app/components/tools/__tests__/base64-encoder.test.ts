import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('Base64Encoder', () => {
  it('matches snapshot', async () => {
    const Base64Encoder = await import('../base64-encoder.vue')
    const wrapper = mount(Base64Encoder.default)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
