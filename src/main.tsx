import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const rootEl = document.getElementById('root')!
const rootHtmlEl = window.document.documentElement
rootHtmlEl.classList.add('ring-ui-theme-dark')

createRoot(rootEl).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
