import { describe, expect, it } from 'vitest'
import { safeUrl } from '../utils/safeUrl.js'

describe('safeUrl', () => {
  it('lets ordinary web links through', () => {
    expect(safeUrl('https://github.com/cruzjay188/netflix')).toBe('https://github.com/cruzjay188/netflix')
    expect(safeUrl(' http://localhost:5173 ')).toBe('http://localhost:5173/')
  })
  it('refuses links that could run code or leave the web', () => {
    expect(safeUrl('javascript:alert(1)')).toBe(null)
    expect(safeUrl('JaVaScRiPt:alert(1)')).toBe(null)
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBe(null)
    expect(safeUrl('file:///etc/passwd')).toBe(null)
  })
  it('refuses junk', () => {
    expect(safeUrl('')).toBe(null)
    expect(safeUrl('not a url')).toBe(null)
    expect(safeUrl(null)).toBe(null)
    expect(safeUrl(42)).toBe(null)
  })
})
