import { useHub } from '../hooks/useHub.js'
import { I } from './icons.jsx'

const isMac = /Mac|iPhone|iPad/.test(navigator.platform)

// The message that rises from the bottom ("Rated Solid", "Copied"), sometimes with Undo.
// Showing and hiding is done by hub.toast() (lib/actions.js); this draws what's inside.
export default function Toast() {
  const { ui, hub } = useHub()
  const t = ui.toast
  return (
    <div
      className="toast" id="toast" role="status" aria-live="polite"
      onPointerEnter={hub.holdToast} onFocus={hub.holdToast} onPointerLeave={hub.releaseToast} onBlur={hub.releaseToast}
    >
      {t && (
        <>
          <span className="toast__ico" data-kind={t.kind} aria-hidden="true">{t.kind === 'warn' ? <I.alert /> : t.kind === 'copy' ? <I.copy /> : <I.check size={16} />}</span>
          <span>{t.msg}</span>
          {t.label && (
            <button type="button" data-toast-action="" onClick={hub.runToastAction}>
              {t.label}{t.label === 'Undo' && <> <kbd>{isMac ? '⌘Z' : 'Ctrl+Z'}</kbd></>}
            </button>
          )}
        </>
      )}
    </div>
  )
}
