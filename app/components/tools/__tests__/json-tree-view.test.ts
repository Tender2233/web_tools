import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('JsonTreeView', () => {
  it('matches snapshot with simple data', async () => {
    const JsonTreeView = await import('../json-tree-view.vue')
    const wrapper = mount(JsonTreeView.default, {
      props: { data: { name: 'Alice', age: 30 } }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
