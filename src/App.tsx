import React, { useEffect, useState } from 'react'
import { Button, createTheme, Grid, Stack, TextField, ThemeProvider, Typography } from '@mui/material'
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
import contextApi, { Context, Task } from '@/common/api/context'


const theme = createTheme({
  palette: {
    mode: 'light',
  },
})


enum State {
  IDLE,
  TASK_SELECTED,
  STARTED,
  STOPPED,
}


const sec2Min = (sec: number): number => {
  return Math.floor(sec / 60)
}

export default function App() {
  const toast = useToast()


  const [state, setState] = useState(State.IDLE)

  const [context, setContext] = useState<Context | null>(null)
  const [curTask, setCurTask] = useState<Task | null>(null)


  const [secondsStarted, setSecondsStarted] = useState<number>(0)
  const [timer, setTimer] = useState<number | null>(null)

  const logs = context?.logs.slice(0, 10) ?? []


  useEffect(() => {
    (async () => {
      await updateContext()
    })()
  }, [])

  async function updateContext() {
    try {
      const context = await contextApi.getContext()
      setContext(context)
    } catch (e) {
      e instanceof Error && toast.error(e.message)
    }
  }


  const onTaskSelect = (task: Task) => {
    setCurTask(task)
    setState(State.TASK_SELECTED)
  }

  const onStart = () => {
    if (!curTask) throw new Error()
    let c = 0

    // add timer
    setTimer(window.setInterval(() => {

      // increment secondsStarted
      setSecondsStarted(startedTimes => {

        // when completed, notice every minute
        if (sec2Min(startedTimes) >= curTask.timeRequired &&
          c++ % 60 === 0) {
          const n = new Notification(`Time Scheduler`, { body: `Task "${curTask.title}" is completed` })
          n.onclick = () => ipc.ipcAppForce()
          n.onclose = () => ipc.ipcAppForce()
        }

        return startedTimes + 1
      })
    }, 1000))

    setState(State.STARTED)
  }

  const onStop = () => {
    if (!curTask || !timer) return
    // clear timer
    clearInterval(timer)
    setTimer(null)

    const minutes = sec2Min(secondsStarted)
    if (minutes > 0) {
      toast.success(`Complete ${minutes} Minutes`)
    } else {
      toast.warning('Less than 1 min')
    }

    setState(State.STOPPED)
  }

  const onRevise = async () => {
    if (!curTask) return
    setState(State.TASK_SELECTED)

    const duration = sec2Min(secondsStarted)
    setSecondsStarted(0)
    if (duration === 0) {
      toast.warning('Nothing to do')
      return
    }

    toast.success(`Complete ${duration} Minutes for ${curTask.title}`)

    // push log to context
    await contextApi.pushLog({
      task: curTask,
      duration,
      createdAt: new Date(),
    })
    await updateContext()
  }


  return (
    <ThemeProvider theme={theme}>

      <Grid container spacing={0}>

        {/* Navigation */}
        <Grid item xs={5}>
          {!!context &&
            <TreeNav
              disableSelection={state > State.TASK_SELECTED}
              sx={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}
              context={context}
              onTaskSelect={onTaskSelect}
            />
          }
        </Grid>

        {/* Control Panel */}
        <Grid item xs={7} sx={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}>

          {/* Main Panel */}
          <Stack alignItems="center">
            <Typography pt={2} variant="h5">
              {`< ${curTask?.title ?? 'No Task Selected'} >`}
            </Typography>
            <Typography pt={2} variant="body1">
              Required: <b>{curTask ? curTask.timeRequired - curTask.duration : 0}</b> min
            </Typography>
            <Typography pt={2} variant="body1">
              Started: <b>{padLeft(sec2Min(secondsStarted), 2)}:{padLeft(Math.abs(secondsStarted % 60), 2)}</b>
            </Typography>

            <Stack mt={2} spacing={2} direction="row">
              <TextField
                disabled={state !== State.STOPPED}
                label="Seconds"
                type="number"
                variant="outlined"
                value={secondsStarted}
                onChange={e => {
                  setSecondsStarted(parseInt(e.target.value) || 0)
                }}
              />
              <Button
                disabled={state !== State.STOPPED}
                variant="outlined"
                color="info"
                onClick={onRevise}
              >REVISE
              </Button>
            </Stack>

            <Stack mt={3} spacing={2} direction="row">
              <Button
                disabled={state !== State.TASK_SELECTED}
                variant="outlined"
                color="success"
                onClick={onStart}
              >START
              </Button>
              <Button
                disabled={state !== State.STARTED}
                variant="outlined"
                color="error"
                onClick={onStop}
              >STOP
              </Button>
            </Stack>
          </Stack>

          {/* Log Timeline */}
          <Stack mt={2}>
            <Timeline position="alternate">
              {
                logs.map(({ task, duration, createdAt }, i) =>
                  <TimelineItem key={i}>
                    <TimelineOppositeContent color="text.secondary">
                      {createdAt.toPrettyString()}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      {task.title}
                      <br />
                      <Typography color="text.secondary">{duration} min</Typography>
                    </TimelineContent>
                  </TimelineItem>)
              }
            </Timeline>
          </Stack>

        </Grid>

      </Grid>

    </ThemeProvider>
  )
}
