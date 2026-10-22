import { useHub } from '../../hooks/useHub.js'
import RatingControl from '../RatingControl.jsx'
import SheetHead from './SheetHead.jsx'

// Rate a lecture (phone bar, Review's Unrated list). Closes itself after you pick.
export default function RateSheet({ lid }) {
  const { m } = useHub()
  const l = m.LB(lid)
  return (
    <>
      <SheetHead>Rate {m.codeOf(l) || l.title}</SheetHead>
      <div className="sheet__body">
        <p className="row__sub" style={{ fontSize: '14px' }}>{l.title}</p>
        <div><RatingControl l={l} bare where="sheet" /></div>
      </div>
    </>
  )
}
