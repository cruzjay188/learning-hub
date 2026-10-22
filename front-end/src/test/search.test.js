import { describe, expect, it } from 'vitest'
import data from '../../public/hub-data.json'
import { createModel } from '../utils/model.js'
import { buildIndex, searchResults } from '../utils/search.js'

const m = createModel(data, { lectures: {}, assignments: {}, goal: { weeklyTarget: 4 }, activity: { days: {} }, onboarded: null })
const index = buildIndex(m, '2026-10-19', 11 * 60 + 15)

describe('search palette', () => {
  it('shows actions when the box is empty', () => {
    const r = searchResults(index, '', [], m)
    expect(r[0]).toMatchObject({ g: 'Actions', t: "Go to today's lecture" })
  })

  it('finds a lecture by its code, with or without the dash', () => {
    expect(searchResults(index, 'ai-8', [], m)[0]).toMatchObject({ g: 'Lectures', go: '#lecture-ai-8' })
    expect(searchResults(index, 'ai8', [], m).some((x) => x.go === '#lecture-ai-8')).toBe(true)
  })

  it('finds key terms', () => {
    expect(searchResults(index, 'authorization', [], m).some((x) => x.g === 'Key terms')).toBe(true)
  })

  it('lists recently opened lectures', () => {
    expect(searchResults(index, '', ['ai-7'], m).at(-1)).toMatchObject({ g: 'Recent', go: '#lecture-ai-7' })
  })
})
