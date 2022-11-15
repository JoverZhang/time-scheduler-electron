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


  // context
  const [context, setContext] = useState<Context | null>(null)

  const getContext = async () => {
    try {
      const context = await contextApi.getContext()
      setContext(context)
    } catch (e) {
      e instanceof Error && toast.error(e.message)
    }
  }

  useEffect(() => {
    (async () => {
      await getContext()
    })()
  }, [])


  const logList = context?.logs.slice(0, 10) ?? []

  const [curTask, setCurTask] = useState<Task | null>(null)
  const [startedTimes, setStartedTimes] = useState<number>(0)
  const [timer, setTimer] = useState<number | null>(null)

  const onTaskSelect = (task: Task) => {
    setCurTask(task)
    setState(State.TASK_SELECTED)
  }

  const onStart = () => {
    if (!curTask) throw new Error()
    let c = 0

    // add timer
    setTimer(window.setInterval(() => {

      // increment startedTimes
      setStartedTimes(old => {

        // when completed, notice every minute
        if (sec2Min(old) >= curTask.timeRequired &&
          c++ % 60 === 0) {
          const n = new Notification(`Time Scheduler`, { body: `Task "${curTask.title}" is completed` })
          n.onclick = () => ipc.ipcAppForce()
          n.onclose = () => ipc.ipcAppForce()
        }

        return old + 1
      })
    }, 1000))

    setState(State.STARTED)
  }

  const onStop = () => {
    if (!curTask || !timer) return
    // clear timer
    clearInterval(timer)
    setTimer(null)

    const minutes = sec2Min(startedTimes)
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

    const minutes = sec2Min(startedTimes)
    setStartedTimes(0)
    if (minutes === 0) {
      toast.warning('Nothing to do')
      return
    }

    toast.success(`Complete ${minutes} Minutes for ${curTask.title}`)

    // update context
    await contextApi.pushLog({
      task: curTask,
      duration: minutes,
      createdAt: new Date(),
    })
  }

  return (
    <ThemeProvider theme={theme}>

      <Grid container spacing={0}>

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

        <Grid item xs={7} sx={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}>

          {/* Control Panel */}
          <Stack alignItems="center">
            <Typography pt={2} variant="h6">
              {curTask?.title ?? 'Not Selected'}
            </Typography>
            <Typography pt={2} variant="body1">
              Required Minutes: <b>{curTask ? curTask.timeRequired - curTask.duration : 0}</b>
            </Typography>
            <Typography pt={2} variant="body1">
              Started Times: <b>{padLeft(sec2Min(startedTimes), 2)}:{padLeft(Math.abs(startedTimes % 60), 2)}</b>
            </Typography>

            <Stack mt={2} spacing={2} direction="row">
              <TextField
                disabled={state !== State.STOPPED}
                label="Seconds"
                type="number"
                variant="outlined"
                value={startedTimes}
                onChange={e => {
                  setStartedTimes(parseInt(e.target.value) || 0)
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

          {/* Log Timeline Window */}
          <Stack mt={2}>
            <Timeline position="alternate">
              {
                logList.map(({ task, duration, createdAt }, i) =>
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
