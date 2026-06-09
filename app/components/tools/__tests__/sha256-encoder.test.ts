import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('Sha256Encoder', () => {
  it('matches snapshot', async () => {
    const Sha256Encoder = await import('../sha256-encoder.vue')
    const wrapper = mount(Sha256Encoder.default)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
