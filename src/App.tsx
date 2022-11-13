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
import ipc from '@/common/ipc'
import { useToast } from '@/common/toast'
import { padLeft } from '@/common/utils'


const theme = createTheme({
  palette: {
    mode: 'light',
  },
})


const sec2Min = (sec: number): number => {
  return Math.floor(sec / 60)
}

export default function App() {
  const toast = useToast()

  const config = useCoreContext()
  const logList = config.logger.logs.slice(0, 10)

  const [curTask, setCurTask] = useState<Task | null>(null)
  const [startedTimes, setStartedTimes] = useState<number>(0)
  const [timer, setTimer] = useState<number | null>(null)

  const onTaskSelect = (task: Task) => {
    setCurTask(task)
  }


  const onStart = () => {
    if (!curTask) {
      toast.warning('Please select a task first')
      return
    }
    let c = 0
    setTimer(window.setInterval(() => {

      // increment startedTimes
      setStartedTimes(old => {

        // when completed, notice every minute
        if (sec2Min(old) >= curTask.getRequiredTime() &&
          c++ % 60 === 0) {
          const n = new Notification(`Time Scheduler`, { body: `Task "${curTask.title}" is completed` })
          n.onclick = () => ipc.ipcAppForce()
          n.onclose = () => ipc.ipcAppForce()
        }

        return old + 1
      })
    }, 50))
  }

  const onStop = () => {
    if (!curTask || !timer) return
    clearInterval(timer)
    setTimer(null)

    const minutes = sec2Min(startedTimes)
    setStartedTimes(0)
    if (minutes === 0) {
      toast.warning('Less than 1 min, not add log')
      return
    }
    toast.success(`Complete ${minutes} Minutes`)
    config.pushLog(new Log(curTask.id, curTask.title, minutes, new Date()))
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
            <Typography pt={2} variant="h6">
              {curTask?.title ?? 'Not Selected'}
            </Typography>
            <Typography pt={2} variant="body1">
              Required Minutes: <b>{curTask?.getRequiredTime() ?? 0}</b>
            </Typography>
            <Typography pt={2} variant="body1">
              Started Times: <b>{padLeft(sec2Min(startedTimes), 2)}:{padLeft(startedTimes % 60, 2)}</b>
            </Typography>

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
                logList.map(({ title, endTime, runtime }, i) =>
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
                      <br />
                      <Typography color="text.secondary">{runtime} min</Typography>
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
