import { CONF } from './format.js'

// The "Quiz me" prompt you paste into Claude Code: the lecture, your rating, missed terms and notes.
export function quizPrompt(m, l) {
  const st = m.LS(l.id)
  const missed = (st.recall && st.recall.missed) || []
  return `Use the tutor agent to quiz me on ${m.lecLabel(l)}.${st.confidence ? ` I rated it ${CONF[st.confidence - 1]}.` : ''}${missed.length ? ` Terms I missed: ${missed.join(', ')}.` : ''}${st.notes ? ` My notes: ${st.notes.trim().slice(0, 500)}` : ''} Read hub/guides/${l.id}.json for the lecture's goal, steps and key terms. Ask me one question at a time.`
}
