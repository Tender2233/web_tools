import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ToolPlaceholder from '../tool-placeholder.vue'

describe('ToolPlaceholder', () => {
  it('renders title and description', () => {
    const wrapper = mount(ToolPlaceholder, {
      props: { title: 'Test Tool', description: 'A test tool' }
    })
    expect(wrapper.text()).toContain('Test Tool')
    expect(wrapper.text()).toContain('A test tool')
  })
})
