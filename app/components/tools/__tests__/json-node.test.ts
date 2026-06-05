import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

describe('JsonNode', () => {
  it('matches snapshot for string value', async () => {
    const JsonNode = await import('../json-node.vue')
    const wrapper = mount(JsonNode.default, {
      props: {
        data: 'hello',
        nodeKey: 'greeting',
        path: 'root.greeting',
        depth: 1,
        expandedPaths: new Set()
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('matches snapshot for object value', async () => {
    const JsonNode = await import('../json-node.vue')
    const wrapper = mount(JsonNode.default, {
      props: {
        data: { x: 1, y: 2 },
        nodeKey: 'point',
        path: 'root.point',
        depth: 1,
        expandedPaths: new Set(['root.point'])
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
