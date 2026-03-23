import { describe, it, expect } from 'vitest'
import { mergeStats } from './sync'

describe('mergeStats', () => {
  it('takes higher seen count per word', () => {
    const local = { 'w1': { seen: 5, correct: 3, lastReviewed: 1000 } }
    const remote = { 'w1': { seen: 3, correct: 2, lastReviewed: 500 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].seen).toBe(5)
  })

  it('takes higher correct count per word', () => {
    const local = { 'w1': { seen: 5, correct: 3, lastReviewed: 1000 } }
    const remote = { 'w1': { seen: 5, correct: 4, lastReviewed: 1500 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].correct).toBe(4)
  })

  it('takes latest lastReviewed timestamp', () => {
    const local = { 'w1': { seen: 3, correct: 2, lastReviewed: 2000 } }
    const remote = { 'w1': { seen: 3, correct: 2, lastReviewed: 1000 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].lastReviewed).toBe(2000)
  })

  it('includes words only in local', () => {
    const local = { 'w1': { seen: 2, correct: 1, lastReviewed: 100 } }
    const remote = {}
    const result = mergeStats(local, remote)
    expect(result['w1'].seen).toBe(2)
  })

  it('includes words only in remote', () => {
    const local = {}
    const remote = { 'w1': { seen: 3, correct: 2, lastReviewed: 500 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].seen).toBe(3)
  })

  it('correct is clamped to not exceed seen', () => {
    const local = { 'w1': { seen: 4, correct: 3, lastReviewed: 1000 } }
    const remote = { 'w1': { seen: 3, correct: 3, lastReviewed: 800 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].correct).toBeLessThanOrEqual(result['w1'].seen)
    expect(result['w1'].seen).toBe(4)
    expect(result['w1'].correct).toBe(3)
  })
})
