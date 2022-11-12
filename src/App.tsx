import React from 'react'
import { Button, createTheme, ThemeProvider } from '@mui/material'
import { Log, useCoreContext } from '@/common/context'
import TreeNav from '@/modules/TreeNav'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})


export default function App() {
  const config = useCoreContext()

  const onClick = () => {
    config.pushLog(new Log(1, 'title', 2, new Date()))
    config.flush()
  }

  return (
    <ThemeProvider theme={theme}>
      <TreeNav config={config} />
      {
        config !== undefined && config.logger.logs.map((log, i) => <div key={i}>{JSON.stringify(log)}</div>)
      }
      <Button onClick={onClick}>123</Button>
    </ThemeProvider>
  )
}
