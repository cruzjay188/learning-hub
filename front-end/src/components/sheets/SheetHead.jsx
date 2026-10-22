import { useHub } from '../../hooks/useHub.js'
import { I } from '../icons.jsx'

// The grab handle (phones) and the title row with a close button
export default function SheetHead({ children }) {
  const { hub } = useHub()
  return (
    <>
      <div className="sheet__grab" aria-hidden="true" />
      <div className="sheet__head">
        <h2 id="sheet-title">{children}</h2>
        <button type="button" className="icon-btn" data-action="close-sheet" aria-label="Close" onClick={hub.closeSheet}><I.close /></button>
      </div>
    </>
  )
}
