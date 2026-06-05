import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

describe('TimestampConverter', () => {
  // Freeze time to prevent the live "now" ticker from changing the snapshot every second.
  const NOW = new Date('2024-01-15T09:30:00Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('matches snapshot', async () => {
    const TimestampConverter = await import('../timestamp-converter.vue')
    const wrapper = mount(TimestampConverter.default, {
      global: {
        stubs: {
          Teleport: { template: '<div class="teleport-stub"><slot /></div>' }
        }
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
