import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup.tsx'
import './main.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found in the DOM')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)