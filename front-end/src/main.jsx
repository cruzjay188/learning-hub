import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { KEYS, readText } from './lib/storage.js'
// The styles, in cascade order: later files override earlier ones.
import './styles/01-base.css'
import './styles/02-top-bar.css'
import './styles/03-page.css'
import './styles/04-today.css'
import './styles/05-course.css'
import './styles/06-lecture.css'
import './styles/07-review.css'
import './styles/08-work.css'
import './styles/09-dialogs-toast.css'
import './styles/10-responsive.css'
import './styles/11-view-transitions.css'
import './styles/12-auth.css'

// Light or dark, if you've picked one (otherwise the system setting wins). Set before the first paint.
const theme = readText(KEYS.theme)
if (theme) document.documentElement.dataset.theme = theme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
