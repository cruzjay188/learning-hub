// Copies text. If the browser refuses, selects the code block instead so ⌘C still works.
export async function copyText(text, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    if (fallbackEl) {
      const r = document.createRange()
      r.selectNodeContents(fallbackEl)
      const s = window.getSelection()
      s.removeAllRanges()
      s.addRange(r)
    }
    return false
  }
}
