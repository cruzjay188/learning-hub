// Digits that roll to a new value (each digit is a column 0–9 shifted by --d).
// Screen readers get the number once, from the sr-only copy.
export default function Ticker({ n, k }) {
  const str = String(n)
  return (
    <>
      <span className="tick" {...(k ? { 'data-k': k, 'data-n': str } : {})} aria-hidden="true">
        {[...str].map((c, i) => (/\d/.test(c)
          ? <span key={i} className="d" style={{ '--d': c }}>{'0123456789'.split('').map((x) => <i key={x}>{x}</i>)}</span>
          : <i key={i}>{c}</i>))}
      </span>
      <span className="sr-only">{str}</span>
    </>
  )
}
