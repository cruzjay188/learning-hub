// A row of choices with one thumb that slides to the chosen one (lib/continuity.js moves it).
// items: [{ value, label, count?, on, href? }]. With href the items are links (Work's tabs).
// attr names the data attribute each button carries (data-filter, data-rfilter), for tests and shortcuts.
export default function SegmentedControl({ id, label, items, attr, onPick }) {
  return (
    <div className="segc" role="group" aria-label={label} data-segc={id}>
      <span className="segc__thumb" aria-hidden="true" />
      {items.map((it) => (it.href
        ? <a key={it.value} className="segc__i" href={it.href} aria-current={it.on ? 'page' : 'false'}>{it.label}</a>
        : (
          <button key={it.value} type="button" className="segc__i" {...{ [attr]: it.value }} aria-pressed={it.on} onClick={() => onPick(it.value)}>
            {it.label}{it.count !== undefined && <> <span className="n">{it.count}</span></>}
          </button>
        )))}
    </div>
  )
}
