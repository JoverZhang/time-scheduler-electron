import React, { useState } from 'react'
import { Button, createTheme, Grid, Paper, Stack, ThemeProvider, Typography } from '@mui/material'
import { Log, Task, useCoreContext } from '@/common/context'
import TreeNav from '@/modules/TreeNav'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})


export default function App() {
  const config = useCoreContext()

  const [curTask, setCurTask] = useState<Task | null>(null)

  const onStop = () => {
    if (!curTask) return
    config.pushLog(new Log(curTask.id, curTask.title, 2, new Date()))
    config.flush()
  }

  const onNodeSelect = (task: Task) => {
    setCurTask(task)
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={2}>

        <Grid item xs={5}>
          <TreeNav
            sx={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}
            config={config}
            onTaskSelect={onNodeSelect}
          />
        </Grid>

        <Grid item xs={7}>
          <Stack>
            <Typography variant="h6">{curTask?.title ?? 'Not Selected'}</Typography>
            <div>{curTask?.getRequiredTime() ?? 0}</div>
          </Stack>
          <Button sx={{ mt: 15 }} color="success" onClick={onStop}>START</Button>
          <Button color="error" onClick={onStop}>STOP</Button>


          {
            config !== undefined &&
            config.logger.logs.slice(0, 10)
              .map((log, i) =>
                <Paper key={i}>{JSON.stringify({
                  title: log.title,
                  runtime: log.runtime,
                  endTime: log.endTime,
                })}</Paper>)
          }
        </Grid>

      </Grid>
    </ThemeProvider>
  )
}
