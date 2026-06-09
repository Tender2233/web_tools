import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('JwtDecoder', () => {
  it('matches snapshot', async () => {
    const JwtDecoder = await import('../jwt-decoder.vue')
    const wrapper = mount(JwtDecoder.default)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
