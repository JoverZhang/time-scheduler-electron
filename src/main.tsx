import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './samples/node-api'
import 'styles/index.css'
import '@/common/advance'
import { SnackbarProvider } from 'notistack'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <App />
    </SnackbarProvider>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
