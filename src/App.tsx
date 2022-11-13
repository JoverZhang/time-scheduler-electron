import React, { useState } from 'react'
import { Button, createTheme, Grid, Stack, ThemeProvider, Typography } from '@mui/material'
import { Log, Task, useCoreContext } from '@/common/context'
import TreeNav from '@/modules/TreeNav'
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab'
import { useToast } from '@/common/toast'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})


export default function App() {
  const toast = useToast()

  const config = useCoreContext()
  const logList = config.logger.logs.slice(0, 10)

  const [curTask, setCurTask] = useState<Task | null>(null)
  const [secondCount, setSecondCount] = useState<number>(0)
  const [timer, setTimer] = useState<number | null>(null)

  const onTaskSelect = (task: Task) => {
    setCurTask(task)
  }

  const onStart = () => {
    if (!curTask) {
      toast.warning('Please select a task first')
      return
    }
    setTimer(window.setInterval(() => {
      setSecondCount(old => old + 1)
    }, 1000))
  }

  const onStop = () => {
    if (!curTask || !timer) return
    clearInterval(timer)
    setTimer(null)

    const second = secondCount
    setSecondCount(0)
    console.log(second)
    config.pushLog(new Log(curTask.id, curTask.title, second, new Date()))
    config.flush()
  }

  return (
    <ThemeProvider theme={theme}>

      <Grid container spacing={0}>

        <Grid item xs={5}>
          <TreeNav
            disableSelection={!!timer}
            sx={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}
            config={config}
            onTaskSelect={onTaskSelect}
          />
        </Grid>

        <Grid item xs={7} sx={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}>

          {/* Control Panel */}
          <Stack alignItems="center">
            <Typography pt={2} variant="h6">{curTask?.title ?? 'Not Selected'}</Typography>
            <Typography pt={2} variant="body1">Required Minute: <b>{curTask?.getRequiredTime() ?? 0}</b></Typography>
            <Typography pt={2} variant="body1">{secondCount}</Typography>
            <Stack mt={3} spacing={2} direction="row">
              <Button
                disabled={!!timer}
                variant="outlined"
                color="success"
                onClick={onStart}
              >START
              </Button>
              <Button
                disabled={!timer}
                variant="outlined"
                color="error"
                onClick={onStop}
              >STOP
              </Button>
            </Stack>
          </Stack>

          {/* Log Timeline Window */}
          <Stack mt={2}>
            <Timeline position="alternate">
              {
                logList.map(({ title, endTime }, i) =>
                  <TimelineItem key={i}>
                    <TimelineOppositeContent color="text.secondary">
                      {endTime.toPrettyString()}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      {title}
                    </TimelineContent>
                  </TimelineItem>,
                )
              }
            </Timeline>
          </Stack>
        </Grid>

      </Grid>

    </ThemeProvider>
  )
}
