import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import GeminiChat from './Gemini.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <GeminiChat />
  </StrictMode>,
)
