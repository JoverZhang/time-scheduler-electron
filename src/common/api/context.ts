import * as path from 'path'
import * as fs from 'fs'
import { LocalException } from '@/common/exception'


const APP_DATA = process.env.APP_DATA as string
const CONFIG_PATH = path.join(APP_DATA, 'config2.json')


enum CategoryEnum {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  LONG_TERM = 'LONG_TERM',
}


interface RawTask {
  id: number
  category: CategoryEnum
  title: string
  timeRequired: number
  createdAt: string
}

interface RawLog {
  taskId: number
  duration: number
  createdAt: string
}

interface Raw {
  tasks: RawTask[]
  logs: RawLog[]
}


export interface Task {
  id: number
  category: CategoryEnum
  title: string
  children: Task[]
  timeRequired: number
  duration: number
  createdAt: Date
}

export interface Log {
  task: Task
  duration: number
  createdAt: Date
}

export interface Context {
  dailyTasks: Task[]
  weeklyTasks: Task[]
  longTermTasks: Task[]
  logs: Log[]
  taskMap: Map<number, Task>
}


function loadFormDisk(): Raw {
  const text = fs.readFileSync(CONFIG_PATH)
  return JSON.parse(text.toString()) as Raw
}

function storeToDisk(raw: Raw) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(raw, null, 2))
}

function convertToContext(raw: Raw): [LocalException | null, Context] {
  const taskMap: Map<number, Task> = new Map(raw.tasks.map(task =>
    [task.id, {
      id: task.id,
      category: task.category,
      title: task.title,
      children: [], // delay fill
      timeRequired: task.timeRequired, // delay correction
      duration: 0, // delay correction
      createdAt: new Date(task.createdAt),
    }]))

  const context: Context = {
    dailyTasks: [],
    weeklyTasks: [],
    longTermTasks: [],
    logs: [],
    taskMap,
  }

  // cache for task
  const logsMap: Map<number, Log[]> = new Map()

  // populate to logs
  for (let rawLog of raw.logs) {
    const task = taskMap.get(rawLog.taskId)
    if (!task) {
      return [new LocalException(`IllegalFormat: No such task with id == '${rawLog.taskId}'`), context]
    }
    const log: Log = {
      task,
      duration: rawLog.duration,
      createdAt: new Date(rawLog.createdAt),
    }

    let logList = logsMap.get(log.task.id)
    if (!logList) {
      logList = []
      logsMap.set(log.task.id, logList)
    }
    logList.push(log)

    context.logs.push(log)
  }

  // categorize and populate to tasks
  for (let [id, task] of taskMap) {

    let startDate: Date = new Date(0)
    // Daily
    if (CategoryEnum.DAILY === task.category) {
      startDate = new Date(new Date().setHours(0, 0, 0, 0))
      context.dailyTasks.push(task)
    }
    // Weekly
    else if (CategoryEnum.WEEKLY === task.category) {
      const today = new Date(new Date().setHours(0, 0, 0, 0))
      startDate = new Date(today.setDate(today.getDate() - today.getDay() + 1))
      context.weeklyTasks.push(task)
    }
    // Long Term
    else {
      context.longTermTasks.push(task)
    }

    let logList = logsMap.get(id)
    if (logList) {
      task.duration = logList
        .filter(l => l.createdAt > startDate)
        .map(l => l.duration).reduce((a, b) => a + b, 0)
    }
  }

  return [null, context]
}

function convertToRaw(context: Context): Raw {
  const raw: Raw = {
    tasks: [],
    logs: [],
  }

  for (let log of context.logs) {
    raw.logs.push({
      taskId: log.task.id,
      duration: log.duration,
      createdAt: log.createdAt.toPrettyString(),
    })
  }

  for (let task of [...context.dailyTasks, ...context.weeklyTasks, ...context.longTermTasks]) {
    raw.tasks.push({
      id: task.id,
      category: task.category,
      title: task.title,
      timeRequired: task.timeRequired,
      createdAt: task.createdAt.toPrettyString(),
    })
  }

  return raw
}


const getContext = async (): Promise<Context> => {
  const raw = loadFormDisk()
  const [err, context] = convertToContext(raw)
  if (err) {
    console.error(err.stack)
    throw err
  }

  return context
}

const pushLog = async (log: Log): Promise<void> => {
  const context = await getContext()
  context.logs.unshift(log)

  const raw = convertToRaw(context)
  storeToDisk(raw)
}

export default {
  getContext,
  pushLog,
}
