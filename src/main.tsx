import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/sora/index.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Root } from './Root'
import { theme } from './theme'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el elemento #root en el documento')
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root />
    </ThemeProvider>
  </StrictMode>,
)
