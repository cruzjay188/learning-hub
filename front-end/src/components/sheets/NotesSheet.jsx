import { useHub } from '../../hooks/useHub.js'
import NotesControl from '../NotesControl.jsx'
import SheetHead from './SheetHead.jsx'

// My notes on a phone (the rail isn't shown there)
export default function NotesSheet({ lid }) {
  const { m } = useHub()
  return (
    <>
      <SheetHead>My notes</SheetHead>
      <div className="sheet__body"><NotesControl l={m.LB(lid)} inSheet /></div>
    </>
  )
}
